import { useTheme } from "@pancakeswap/hooks";
import { useMatchBreakpoints } from "@pancakeswap/uikit";
import { extent, max, scaleLinear, scaleTime, ZoomTransform } from "d3";
import partition from "lodash/partition";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AxisBottom } from "./AxisBottom";
import { AxisRight } from "./AxisRight";
import { Brush } from "./Brush";
import { CandleChart } from "./CandleChart";
import { GridLines } from "./GridLines";
import { HorizontalLine } from "./Line";
import { BrushDomainType, ChartProps, LiquidityChartEntry, PriceChartEntry } from "./types";
import { Area } from "./VerticalArea";
import Zoom, { ZoomOverlay } from "./Zoom";

const priceAccessor = (d: LiquidityChartEntry) => d.price0;
const liquidityAccessor = (d: LiquidityChartEntry) => d.activeLiquidity;
const periodAccessor = (d: PriceChartEntry) => d.time!;
const pricePeriodAccessor = (d: PriceChartEntry) => d.close;
const paddingRight = 40;
const paddingBottom = 40;

export function Chart({
  id = "PriceRangeChart",
  data: { liquiditySeries, current, priceHistory },
  dimensions: { width, height },
  margins,
  interactive = true,
  brushDomain,
  brushLabels,
  onBrushDomainChange,
  zoomLevels,
  showZoomButtons = true,
  axisTicks,
  showGridLines = true,
}: ChartProps) {
  const zoomRef = useRef<SVGRectElement | null>(null);

  const { theme } = useTheme();
  const { isMobile } = useMatchBreakpoints();

  const [zoom, setZoom] = useState<ZoomTransform | null>(null);
  const [axisRightWidth, setAxisRightWidth] = useState<number>(0);

  // Need axis width to calculate price scale range (width of candlestick chart)
  const handleAxisMount = useCallback((element: SVGGElement | null) => {
    if (element) {
      // Use a small delay to ensure the axis is fully rendered
      setTimeout(() => {
        const width = element.getBoundingClientRect().width;
        setAxisRightWidth(width);
      }, 0);
    }
  }, []);

  // Calculate domain from the price history candlestick chart
  const calculatePriceHistoryDomain = useCallback(() => {
    const priceValues: number[] = [];
    priceHistory.forEach((entry) => {
      if (entry.open > 0) priceValues.push(entry.open);
      if (entry.close > 0) priceValues.push(entry.close);
      if (entry.high > 0) priceValues.push(entry.high);
      if (entry.low > 0) priceValues.push(entry.low);
    });

    // Fallback to current-price based domain if no valid price data
    if (priceValues.length === 0) {
      return {
        min: current * zoomLevels.initialMin,
        max: current * zoomLevels.initialMax,
      };
    }

    const minPrice = Math.min(...priceValues);
    const maxPrice = Math.max(...priceValues);

    // Apply +/-10% padding to keep the price chart always in view
    const priceRange = maxPrice - minPrice;

    // If all prices are the same, use a percentage of the price as padding
    const padding = priceRange > 0 ? priceRange * 0.1 : maxPrice * 0.1;
    const domainMin = minPrice - padding;
    const domainMax = maxPrice + padding;

    return { min: domainMin, max: domainMax };
  }, [priceHistory, current, zoomLevels.initialMin, zoomLevels.initialMax]);

  const [innerHeight, innerWidth] = useMemo(
    () => [height - margins.top - margins.bottom, width - margins.left - margins.right],
    [width, height, margins]
  );

  const { liquidityScale, priceScale, periodScale } = useMemo(() => {
    const priceDomain = calculatePriceHistoryDomain();

    // Subtract right axis width using state
    const priceScaleRange = axisRightWidth > 0 ? innerWidth - axisRightWidth : innerWidth * 0.93;

    const scales = {
      liquidityScale: scaleLinear()
        .domain([0, max(liquiditySeries, liquidityAccessor)] as number[])
        .range([innerWidth, innerWidth * 0.5]),
      priceScale: scaleLinear()
        // Keep the candlestick chart in view by default instead of user's selected range
        .domain([priceDomain.min, priceDomain.max] as number[])
        .range([innerHeight, 0]),
      periodScale: scaleTime()
        .domain(extent(priceHistory, periodAccessor) as [Date, Date])
        .range([0, priceScaleRange]),
    };

    if (zoom) {
      const newYscale = zoom.rescaleY(scales.priceScale);
      scales.priceScale.domain(newYscale.domain());
    }

    return scales;
  }, [calculatePriceHistoryDomain, innerWidth, liquiditySeries, innerHeight, zoom, priceHistory, axisRightWidth]);

  useEffect(() => {
    if (!brushDomain) {
      const [maxPrice, minPrice] = priceScale.domain();
      onBrushDomainChange(
        {
          min: minPrice,
          max: maxPrice,
        },
        undefined
      );
    }
  }, [brushDomain, onBrushDomainChange, priceScale]);

  const [leftSeries, rightSeries] = useMemo(() => {
    const isHighToLow = liquiditySeries[0]?.price0 > liquiditySeries[liquiditySeries.length - 1]?.price0;
    let [left, right] = partition(liquiditySeries, (d) =>
      isHighToLow ? +priceAccessor(d) < current : +priceAccessor(d) > current
    );

    if (right.length && right[right.length - 1]) {
      if (right[right.length - 1].price0 !== current) {
        right = [...right, { activeLiquidity: right[right.length - 1].activeLiquidity, price0: current }];
      }
      left = [{ activeLiquidity: right[right.length - 1].activeLiquidity, price0: current }, ...left];
    }

    return [left, right];
  }, [current, liquiditySeries]);

  const [minHandleColor, maxHandleColor] = useMemo(() => {
    // const isHighToLow = liquiditySeries[0]?.price0 > liquiditySeries[liquiditySeries.length - 1]?.price0;
    // return isHighToLow ? [theme.colors.success, theme.colors.failure] : [theme.colors.failure, theme.colors.success];
    return [theme.colors.secondary, theme.colors.secondary];
  }, [liquiditySeries, theme.colors.secondary]);

  const defaultBrushExtent = useMemo(
    () => ({ min: priceScale.domain()[1], max: priceScale.domain()[0] }),
    [priceScale]
  );

  // Only used for tracking the brush extent when dragging the handles
  const [localBrushExtent, setLocalBrushExtent] = useState<BrushDomainType | null>(brushDomain ?? defaultBrushExtent);

  const handleResetBrush = useCallback(() => {
    onBrushDomainChange({ min: current * zoomLevels.initialMin, max: current * zoomLevels.initialMax }, "reset");
  }, [current, onBrushDomainChange, zoomLevels.initialMax, zoomLevels.initialMin]);

  return (
    <>
      {showZoomButtons && (
        <Zoom
          svg={zoomRef.current}
          xScale={priceScale}
          setZoom={setZoom}
          width={innerWidth}
          height={height}
          resetBrush={handleResetBrush}
          zoomLevels={zoomLevels}
          showResetButton={false}
        />
      )}
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: "hidden" }}>
        <defs>
          <linearGradient id="green-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor={theme.colors.input} stopOpacity={1} />
          </linearGradient>
          <linearGradient id="red-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="5%" stopColor={theme.colors.input} stopOpacity={1} />
          </linearGradient>
        </defs>
        <defs>
          <clipPath id={`${id}-chart-clip`}>
            <rect x="0" y="0" width={innerWidth} height={height - paddingBottom} />
          </clipPath>

          {brushDomain && (
            // mask to highlight selected area
            <mask id={`${id}-chart-area-mask`}>
              <rect
                fill={theme.colors.secondary}
                y={liquidityScale(brushDomain.min)}
                x="0"
                width={innerWidth}
                height={liquidityScale(brushDomain.max) - liquidityScale(brushDomain.min)}
              />
            </mask>
          )}
        </defs>
        <defs>
          <clipPath id={`${id}-line-chart-clip`}>
            <rect x={margins.left} y={margins.top} width={innerWidth} height={height - paddingBottom} />
          </clipPath>
        </defs>
        <defs>
          <clipPath id={`${id}-content-clip`}>
            <rect x="0" y="0" width="400" height="172" />
          </clipPath>
        </defs>

        {/* Grid lines rendered first so they appear behind chart data */}
        {showGridLines && (
          <g clipPath={`url(#${id}-chart-clip)`}>
            <GridLines
              priceScale={priceScale}
              periodScale={periodScale}
              innerWidth={innerWidth}
              innerHeight={innerHeight}
              horizontalTicks={6}
              verticalTicks={4}
            />
          </g>
        )}

        <g>
          <g clipPath={`url(#${id}-chart-clip)`}>
            <Area
              series={leftSeries}
              xScale={liquidityScale}
              yScale={priceScale}
              xValue={liquidityAccessor}
              yValue={priceAccessor}
              opacity={1}
              fill="url(#green-gradient)"
            />
            <Area
              series={rightSeries}
              xScale={liquidityScale}
              yScale={priceScale}
              xValue={liquidityAccessor}
              yValue={priceAccessor}
              opacity={1}
              fill="url(#red-gradient)"
            />
          </g>
        </g>
        <g>
          <g clipPath={`url(#${id}-line-chart-clip)`}>
            <CandleChart
              series={priceHistory}
              xScale={periodScale}
              yScale={priceScale}
              xValue={periodAccessor}
              yValue={pricePeriodAccessor}
              color={theme.colors.secondary}
            />
          </g>
        </g>

        <g clipPath={`url(#${id}-content-clip)`}>
          <HorizontalLine
            value={current}
            yScale={priceScale}
            x1={0}
            x2={innerWidth}
            color={theme.colors.primary}
            strokeWidth={0.5}
          />

          <ZoomOverlay width={innerWidth} height={height} ref={zoomRef} />

          <Brush
            id={id}
            scale={priceScale}
            interactive={interactive}
            brushLabelValue={brushLabels}
            brushExtent={brushDomain ?? defaultBrushExtent}
            width={innerWidth / 2 - margins.right - paddingRight * 2}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            setBrushExtent={onBrushDomainChange}
            setLocalBrushExtent={setLocalBrushExtent}
            minHandleColor={minHandleColor}
            maxHandleColor={maxHandleColor}
            current={current}
          />
          <AxisRight
            yScale={priceScale}
            innerWidth={width}
            highlightValue={current}
            selectedMin={localBrushExtent ? Number(localBrushExtent.min.toFixed(12)) : undefined}
            selectedMax={localBrushExtent ? Number(localBrushExtent.max.toFixed(12)) : undefined}
            ticks={isMobile ? 4 : 6}
            offset={1}
            onAxisMount={handleAxisMount}
          />
        </g>
        <AxisBottom
          xScale={periodScale}
          innerHeight={innerHeight}
          ticks={axisTicks?.bottomTicks}
          tickFormat={axisTicks?.bottomFormat}
        />
      </svg>
    </>
  );
}
