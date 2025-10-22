import { useDebounce } from '@pancakeswap/hooks'
import { UnifiedCurrency } from '@pancakeswap/sdk'
import { tokens } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useTheme from 'hooks/useTheme'
import React, { useEffect, useMemo, useRef } from 'react'
import { styled } from 'styled-components'
import type { TradingViewWidget, TradingViewWidgetOptions } from './lib/pancakeswap-charting-library.d.ts'
import { createTradingViewWidget, loadTradingViewLibrary } from './lib/pancakeswap-charting-library.es.js'
import { AggregatePricingModal } from './AggregatePricingModal'

interface TradingViewChartProps {
  symbol?: string
  interval?: string
  theme?: 'Light' | 'Dark'
  height?: string
  width?: string
  currency0?: UnifiedCurrency
  currency1?: UnifiedCurrency
  on24HPriceDataChange: (low24h: number, high24h: number, priceChangePercent: number, price: number) => void
  onLiveDataChanges: (price: number) => void
}

const ChartContainer = styled.div`
  width: 100%;
  height: calc(100% - 165px);
  font-family: 'Kanit', sans-serif;

  /* Force TradingView to use Kanit font */
  * {
    font-family: 'Kanit', sans-serif !important;
  }

  /* Specific TradingView elements */
  iframe {
    font-family: 'Kanit', sans-serif !important;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 0;
    width: 100%;
    height: 450px;
  }
`

const update24HPriceData = async (
  on24HPriceDataChange: (low24h: number, high24h: number, priceChangePercent: number, price: number) => void,
) => {
  if (window?.pcsExtraData?.fetch24HrData) {
    try {
      const data = await window.pcsExtraData.fetch24HrData()
      if (data) {
        on24HPriceDataChange(data.high, data.low, data.close, data.changes)
      }
    } catch (error) {
      console.error('Failed to fetch 24H price data:', error)
      on24HPriceDataChange(-1, -1, -1, -1)
    }
  }
}

const setSymbolInfo = (
  currency0: UnifiedCurrency,
  currency1: UnifiedCurrency,
  on24HPriceDataChange: (low24h: number, high24h: number, priceChangePercent: number, price: number) => void,
  onLiveDataChanges: (price: number) => void,
) => {
  // Clear any existing data to prevent caching issues and ensure clean state
  window.pcsExtraData = window.pcsExtraData || {}
  window.pcsExtraData.token0Address = currency0?.isToken ? currency0?.address : currency0?.wrapped?.address
  window.pcsExtraData.token1Address = currency1?.isToken ? currency1?.address : currency1?.wrapped?.address
  window.pcsExtraData.fromChainId = currency0?.chainId
  window.pcsExtraData.toChainId = currency1?.chainId
  update24HPriceData(on24HPriceDataChange)
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  currency0,
  currency1,
  on24HPriceDataChange,
  onLiveDataChanges: _onLiveDataChanges,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<TradingViewWidget | null>(null)
  const isInitialized = useRef(false)
  const isWidgetReady = useRef(false)
  const currentSymbol = useRef('')
  const currentCurrency0Address = useRef<string | undefined>(undefined)
  const currentCurrency1Address = useRef<string | undefined>(undefined)
  const initializationTimeout = useRef<NodeJS.Timeout | null>(null)
  const customButtonRef = useRef<HTMLButtonElement | null>(null)
  const { isDark, theme } = useTheme()

  const modalRef = useRef<HTMLButtonElement | null>(null)

  // Debounce currency changes to prevent frequent widget recreation
  const debouncedCurrency0 = useDebounce(currency0, 300)
  const debouncedCurrency1 = useDebounce(currency1, 300)

  const symbol =
    debouncedCurrency0 && debouncedCurrency1 ? `${debouncedCurrency0?.symbol}/${debouncedCurrency1?.symbol}` : ''

  // Function to create custom button in TradingView toolbar
  const createCustomButton = () => {
    if (!widgetRef.current || !isWidgetReady.current) return

    try {
      // Check if widget has createButton method
      if (widgetRef.current && typeof widgetRef.current.createButton === 'function') {
        const button = widgetRef.current.createButton()
        if (button) {
          button.innerHTML = `<span style="color: ${theme.colors.text}; font-weight: 500; cursor: pointer;">Aggregate Pricing</span>`
          button.setAttribute('title', 'Chart Information')
          button.classList.add('aggregate-pricing-button')
          button.addEventListener('click', () => {
            // Trigger the hidden modal button
            if (modalRef.current) {
              modalRef.current.click()
            }
          })
          customButtonRef.current = button
        }
      }
    } catch (error) {
      console.error('Error creating custom button:', error)
    }
  }

  useEffect(() => {
    const symbolChanged = symbol !== currentSymbol.current
    const currency0Address = debouncedCurrency0?.isToken
      ? debouncedCurrency0?.address
      : debouncedCurrency0?.wrapped?.address
    const currency1Address = debouncedCurrency1?.isToken
      ? debouncedCurrency1?.address
      : debouncedCurrency1?.wrapped?.address
    const currency0AddressChanged = currency0Address !== currentCurrency0Address.current
    const currency1AddressChanged = currency1Address !== currentCurrency1Address.current

    if (
      debouncedCurrency0 &&
      debouncedCurrency1 &&
      (symbolChanged || currency0AddressChanged || currency1AddressChanged)
    ) {
      currentSymbol.current = symbol
      currentCurrency0Address.current = currency0Address
      currentCurrency1Address.current = currency1Address

      // If currency addresses changed, force widget recreation
      if (currency0AddressChanged || currency1AddressChanged) {
        if (widgetRef.current) {
          try {
            if (widgetRef.current.remove) {
              widgetRef.current.remove()
            }
          } catch (error) {
            console.error('Error removing widget:', error)
          }
          widgetRef.current = null
        }
        isInitialized.current = false
        isWidgetReady.current = false
        return // Let the main effect handle recreation
      }

      // Only try to update existing widget if we have one and it's ready
      if (widgetRef.current && isInitialized.current && isWidgetReady.current) {
        setSymbolInfo(debouncedCurrency0, debouncedCurrency1, on24HPriceDataChange, _onLiveDataChanges)

        try {
          // Check if widget has activeChart method
          if (widgetRef.current && typeof widgetRef.current.activeChart === 'function') {
            const activeChart = widgetRef.current.activeChart()
            if (activeChart && typeof activeChart.setSymbol === 'function') {
              activeChart.setSymbol(symbol)
            }
          }
        } catch (error) {
          console.error('Error setting symbol:', error)
        }
      }
    }
  }, [debouncedCurrency0, debouncedCurrency1, symbol])

  useEffect(() => {
    async function initChart() {
      try {
        await loadTradingViewLibrary()

        // Inject global CSS for TradingView font
        const style = document.createElement('style')
        style.textContent = `
          .tv-chart-container *,
          .tradingview-widget-container *,
          div[data-name="legend-series-item"] *,
          div[class*="price-axis"] *,
          div[class*="time-axis"] *,
          div[class*="legend"] * {
            font-family: 'Kanit', sans-serif !important;
          }
        `
        document.head.appendChild(style)

        // Clean up existing widget if chain changed
        if (widgetRef.current && isInitialized.current) {
          try {
            if (widgetRef.current.remove) {
              widgetRef.current.remove()
            }
          } catch (error) {
            console.error('Error removing existing widget:', error)
          }
          widgetRef.current = null
          isInitialized.current = false
          isWidgetReady.current = false
        }

        // Clear any pending initialization
        if (initializationTimeout.current) {
          clearTimeout(initializationTimeout.current)
          initializationTimeout.current = null
        }

        // Add delay to wait for currency updates
        const shouldDelay = !debouncedCurrency0 || !debouncedCurrency1

        const doInitialization = () => {
          if (containerRef.current && !widgetRef.current && symbol && debouncedCurrency0 && debouncedCurrency1) {
            const options: TradingViewWidgetOptions = {
              symbol,
              theme: isDark ? 'Dark' : 'Light',
              overrides: {
                'mainSeriesProperties.candleStyle.upColor': isDark
                  ? tokens.colors.dark.success
                  : tokens.colors.light.success,
                'mainSeriesProperties.candleStyle.downColor': isDark
                  ? tokens.colors.dark.destructive
                  : tokens.colors.light.destructive,
                'mainSeriesProperties.candleStyle.borderUpColor': isDark
                  ? tokens.colors.dark.success
                  : tokens.colors.light.success,
                'mainSeriesProperties.candleStyle.borderDownColor': isDark
                  ? tokens.colors.dark.destructive
                  : tokens.colors.light.destructive,
                'mainSeriesProperties.candleStyle.wickUpColor': isDark
                  ? tokens.colors.dark.success
                  : tokens.colors.light.success,
                'mainSeriesProperties.candleStyle.wickDownColor': isDark
                  ? tokens.colors.dark.destructive
                  : tokens.colors.light.destructive,
                'paneProperties.background': isDark ? tokens.colors.dark.card : tokens.colors.light.card,
                'paneProperties.backgroundType': 'solid',
                'paneProperties.grid.color': isDark ? '#ffffff' : '#e0e0e0',
                'paneProperties.grid.style': 0,
                'paneProperties.vertGrid.color': isDark ? '#ffffff' : '#e0e0e0',
                'paneProperties.vertGrid.style': 0,
                'paneProperties.horzGrid.color': isDark ? '#ffffff' : '#e0e0e0',
                'paneProperties.horzGrid.style': 0,
                headerToolbarBg: isDark ? tokens.colors.dark.backgroundAlt : tokens.colors.light.backgroundAlt,
                custom_font_family: `'Kanit', sans-serif`,
                'scalesProperties.fontFamily': `'Kanit', sans-serif`,
                'scalesProperties.fontSize': 12,
                'scalesProperties.textColor': isDark ? '#ffffff' : '#1a1a1a',
                'legendProperties.fontFamily': `'Kanit', sans-serif`,
                'legendProperties.fontSize': 12,
              },
              disabled_features: [
                'left_toolbar',
                // 'header_widget',
                'symbol_info',
                'header_symbol_search',
                'create_volume_indicator_by_default',
                'create_volume_indicator_by_default_once',
                'volume_force_overlay',
                'symbol_info_price_source',
                'allow_arbitrary_symbol_search_input',
                'symbol_search_hot_key',
                'header_compare',
                'compare_symbol_search_spread_operators',
                'studies_symbol_search_spread_operators',
                'symbol_info_long_description',
                'show_symbol_logos',
                'show_symbol_logo_in_legend',
                'show_symbol_logo_for_compare_studies',
                'uppercase_instrument_names',
                'study_symbol_ticker_description',
                'auto_enable_symbol_labels',
                // disable marks on bars (earnings, dividends )
                'marks_on_bars',
                'show_event_marks',
                'show_earnings_marks',
                'show_dividend_marks',
                'show_splits_marks',
                // disable timescale marks
                'timescale_marks',
                'timeframes_toolbar',
                // 'legend_widget',
                'display_legend_on_all_charts',
                'two_character_bar_marks_labels',
                // Hide most toolbar buttons except the ones we want to keep
                'header_saveload',
                'header_undo_redo',
                'header_settings',
                'header_screenshot',
                'header_widget_dom_node',
                'header_compare',
                'control_bar',
                'edit_buttons_in_legend',
                'border_around_the_chart',
                'show_interval_dialog_on_key_press',
                'property_pages',
                'save_chart_properties_to_local_storage',
                'use_localstorage_for_settings',
                'border_around_the_chart',
                'toolbar_button_newtab',
                'toolbar_button_compare',
                'toolbar_button_properties',
                'toolbar_button_text',
                'toolbar_button_shapes',
                'toolbar_button_line_tools',
                'toolbar_button_measure',
                'toolbar_button_zoom_in',
                'toolbar_button_zoom_out',
                'toolbar_button_undo',
                'toolbar_button_redo',
                'toolbar_button_saveload',
                'toolbar_button_settings',
                'toolbar_button_screenshot',
                'toolbar_button_hotlist',
              ],
              enabled_features: ['hide_left_toolbar_by_default'],
              autosize: true,
              height: '100%',
              width: '100%',
              time_frames: [
                { text: '1m', resolution: '1' },
                { text: '5m', resolution: '5' },
                { text: '15m', resolution: '15' },
                { text: '30m', resolution: '30' },
                { text: '1h', resolution: '60' },
                { text: '1d', resolution: '1D' },
              ],
            }
            setSymbolInfo(debouncedCurrency0, debouncedCurrency1, on24HPriceDataChange, _onLiveDataChanges)

            widgetRef.current = createTradingViewWidget(containerRef.current, options)

            // Wait for widget to be ready
            if (widgetRef.current && widgetRef.current.onChartReady) {
              widgetRef.current.onChartReady(() => {
                isWidgetReady.current = true
                // Create custom button after widget is ready
                setTimeout(() => {
                  createCustomButton()
                }, 300)
              })
            } else {
              // If no onChartReady method, set as ready after delay
              setTimeout(() => {
                isWidgetReady.current = true
                // Create custom button after widget is ready
                setTimeout(() => {
                  createCustomButton()
                }, 300)
              }, 1000)
            }

            update24HPriceData(on24HPriceDataChange)
            isInitialized.current = true
          }
        }

        if (shouldDelay) {
          initializationTimeout.current = setTimeout(doInitialization, 100)
        } else {
          doInitialization()
        }
      } catch (error) {
        console.error('Failed to initialize chart:', error)
      }
    }

    initChart()
  }, [symbol, isDark, theme, debouncedCurrency0, debouncedCurrency1])

  useEffect(() => {
    async function changeTheme() {
      if (widgetRef.current && isInitialized.current && isWidgetReady.current) {
        try {
          await widgetRef.current.changeTheme(isDark ? 'Dark' : 'Light')
          widgetRef.current.applyOverrides({
            'mainSeriesProperties.candleStyle.upColor': isDark
              ? tokens.colors.dark.success
              : tokens.colors.light.success,
            'mainSeriesProperties.candleStyle.downColor': isDark
              ? tokens.colors.dark.destructive
              : tokens.colors.light.destructive,
            'mainSeriesProperties.candleStyle.borderUpColor': isDark
              ? tokens.colors.dark.success
              : tokens.colors.light.success,
            'mainSeriesProperties.candleStyle.borderDownColor': isDark
              ? tokens.colors.dark.destructive
              : tokens.colors.light.destructive,
            'mainSeriesProperties.candleStyle.wickUpColor': isDark
              ? tokens.colors.dark.success
              : tokens.colors.light.success,
            'mainSeriesProperties.candleStyle.wickDownColor': isDark
              ? tokens.colors.dark.destructive
              : tokens.colors.light.destructive,
            'paneProperties.background': isDark ? tokens.colors.dark.card : tokens.colors.light.card,
            'paneProperties.backgroundType': 'solid',
            'paneProperties.grid.color': isDark ? '#ffffff' : '#e0e0e0',
            'paneProperties.grid.style': 0,
            'paneProperties.vertGrid.color': isDark ? '#ffffff' : '#e0e0e0',
            'paneProperties.vertGrid.style': 0,
            'paneProperties.horzGrid.color': isDark ? '#ffffff' : '#e0e0e0',
            'paneProperties.horzGrid.style': 0,
            'scalesProperties.fontFamily': `'Kanit', sans-serif`,
            'scalesProperties.fontSize': 12,
            'scalesProperties.textColor': isDark ? '#ffffff' : '#1a1a1a',
            'legendProperties.fontFamily': `'Kanit', sans-serif`,
            'legendProperties.fontSize': 12,
          })
        } catch (error) {
          console.error('Error changing theme:', error)
        }
      }
    }
    changeTheme()
  }, [isDark, theme])

  useEffect(() => {
    return () => {
      // Clear initialization timeout
      if (initializationTimeout.current) {
        clearTimeout(initializationTimeout.current)
        initializationTimeout.current = null
      }

      // Clean up widget
      if (widgetRef.current?.remove) {
        widgetRef.current.remove()
      }
      widgetRef.current = null

      // Clean up custom button
      if (customButtonRef.current) {
        customButtonRef.current = null
      }
    }
  }, [])

  return (
    <>
      <ChartContainer id="swap-chart" ref={containerRef} />
      <AggregatePricingModal>
        <button ref={modalRef} style={{ display: 'none' }} type="button" />
      </AggregatePricingModal>
    </>
  )
}

export default TradingViewChart
