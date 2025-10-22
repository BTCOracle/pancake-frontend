var R = Object.defineProperty
var L = (h, e, t) => (e in h ? R(h, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : (h[e] = t))
var P = (h, e, t) => L(h, typeof e != 'symbol' ? e + '' : e, t)
function V(h) {
  return h
}
const _ = {
  // BNB Smart Chain (BEP20)
  56: {
    id: 14,
    name: 'BNB Smart Chain (BEP20)',
    displayName: 'BSC',
    chainId: 56,
    scanUrl: 'https://bscscan.com',
  },
  // Ethereum
  1: {
    id: 1,
    name: 'Ethereum',
    displayName: 'Ethereum',
    chainId: 1,
    scanUrl: 'https://etherscan.io',
  },
  // Arbitrum
  42161: {
    id: 51,
    name: 'Arbitrum',
    displayName: 'Arbitrum',
    chainId: 42161,
    scanUrl: 'https://arbiscan.io',
  },
  // Avalanche C-Chain
  43114: {
    id: 28,
    name: 'Avalanche C-Chain',
    displayName: 'Avalanche',
    chainId: 43114,
    scanUrl: 'https://snowscan.xyz',
  },
  // Polygon
  137: {
    id: 25,
    name: 'Polygon',
    displayName: 'Polygon',
    chainId: 137,
    scanUrl: 'https://polygonscan.com',
  },
  // Base
  8453: {
    id: 199,
    name: 'Base',
    displayName: 'Base',
    chainId: 8453,
    scanUrl: 'https://basescan.org',
  },
  // Optimism
  10: {
    id: 42,
    name: 'Optimism',
    displayName: 'Optimism',
    chainId: 10,
    scanUrl: 'https://optimistic.etherscan.io',
  },
  // Fantom
  250: {
    id: 24,
    name: 'Fantom',
    displayName: 'Fantom',
    chainId: 250,
    scanUrl: 'https://ftmscan.com',
  },
  // zkSync Era
  324: {
    id: 183,
    name: 'zkSync Era',
    displayName: 'zkSync',
    chainId: 324,
    scanUrl: 'https://explorer.zksync.io',
  },
  // Linea
  59144: {
    id: 198,
    name: 'Linea',
    displayName: 'Linea',
    chainId: 59144,
    scanUrl: 'https://lineascan.build',
  },
  // Gnosis Chain
  100: {
    id: 20,
    name: 'Gnosis Chain',
    displayName: 'Gnosis',
    chainId: 100,
    scanUrl: 'https://gnosisscan.io',
  },
  // Cronos
  25: {
    id: 68,
    name: 'Cronos',
    displayName: 'Cronos',
    chainId: 25,
    scanUrl: 'https://cronoscan.com',
  },
  // Blast
  81457: {
    id: 210,
    name: 'Blast',
    displayName: 'Blast',
    chainId: 81457,
    scanUrl: 'https://blastscan.io',
  },
  // Mantle
  5e3: {
    id: 195,
    name: 'Mantle',
    displayName: 'Mantle',
    chainId: 5e3,
    scanUrl: 'https://mantlescan.xyz',
  },
  // Scroll
  534352: {
    id: 205,
    name: 'Scroll',
    displayName: 'Scroll',
    chainId: 534352,
    scanUrl: 'https://scrollscan.com',
  },
  // Polygon zkEVM
  1101: {
    id: 3890,
    name: 'Polygon zkEVM',
    displayName: 'Polygon zkEVM',
    chainId: 1101,
    scanUrl: 'https://zkevm.polygonscan.com',
  },
  // opBNB
  204: {
    id: 1839,
    name: 'opBNB',
    displayName: 'opBNB',
    chainId: 204,
    scanUrl: 'https://mainnet.opbnbscan.com',
  },
  // Solana
  8000001001: {
    id: 16,
    name: 'Solana',
    displayName: 'Solana',
    chainId: 8000001001,
    scanUrl: 'https://solscan.io',
  },
}
Object.values(_).reduce((h, e) => ((h[e.id] = e), h), {})
function I(h) {
  return _[h]
}
const z = ['1', '5', '15', '30', '60', '1D'],
  T = {
    1: '1m',
    '1m': '1m',
    5: '5m',
    '5m': '5m',
    15: '15m',
    '15m': '15m',
    30: '30m',
    '30m': '30m',
    '1h': '1h',
    60: '1h',
    '60m': '1h',
    240: '4h',
    '1D': '1d',
    '1d': '1d',
    '1W': '1w',
    '1M': '1M',
  },
  H = {
    supported_resolutions: z.map(V),
    supports_marks: !1,
    supports_timescale_marks: !1,
    supports_time: !0,
    exchanges: [
      {
        value: 'PancakeSwap',
        name: 'PancakeSwap',
        desc: 'PancakeSwap DEX',
      },
    ],
    symbols_types: [
      {
        name: 'Token',
        value: 'token',
      },
    ],
  }
class J {
  constructor(e = {}, t) {
    P(this, 'configuration')
    P(this, 'api')
    P(this, 'ws', null)
    P(this, 'wsUrl', 'wss://dws.coinmarketcap.com/ws')
    // "wss://pcs-ws.dquery.ai/ws";
    P(this, 'subscriptions', /* @__PURE__ */ new Map())
    ;(this.configuration = {
      ...H,
      ...e,
    }),
      (this.api = t),
      window.pcsExtraData
        ? ((window.pcsExtraData.fetch24HrData = this.fetch24HrData.bind(this)),
          console.log('[Datafeed]: Injected fetch24HrData method into window.pcsExtraData'))
        : console.warn('[Datafeed]: window.pcsExtraData is not defined, cannot inject fetch24HrData method')
  }
  /**
   * Initialize Datafeed and return configuration
   * @param callback - Callback function to return configuration
   */
  onReady(e) {
    console.log('[Datafeed]: onReady() called'),
      setTimeout(() => {
        e(this.configuration)
      }, 0)
  }
  /**
   * Parse trading pair information
   * Get token addresses and chain IDs from window.TradingView
   */
  resolveSymbol(e, t, o) {
    console.log('[Datafeed]: resolveSymbol() called with', e)
    try {
      const n = window.pcsExtraData.token0Address,
        a = window.pcsExtraData.token1Address,
        i = window.pcsExtraData.fromChainId,
        c = window.pcsExtraData.toChainId
      if (!n || !a || !i || !c) {
        console.error('Missing token addresses or chainId in window.pcsExtraData'), o('Missing token information')
        return
      }
      const s = I(Number(i))
      s
        ? console.log(`Using chain: ${s.name} (${s.displayName}), Chain ID: ${s.chainId}`)
        : console.warn(`Chain ID ${i} is not supported. Using default BNB Chain (56).`)
      const l = I(Number(c))
      l
        ? console.log(`Using chain: ${l.name} (${l.displayName}), Chain ID: ${l.chainId}`)
        : console.warn(`Chain ID ${c} is not supported. Using default BNB Chain (56).`)
      const p = n.slice(-4),
        m = a.slice(-4),
        S = `${p}/${m}`,
        f = {
          name: e,
          // Original name for internal identification
          description: e,
          // Display name, e.g. "USDT/BNB"
          ticker: e,
          exchange: 'PancakeSwap',
          listed_exchange: 'PancakeSwap',
          type: 'token',
          session: '24x7',
          timezone: 'Etc/UTC',
          pricescale: 1e5,
          // Price precision, adjust according to actual situation
          minmov: 1,
          format: 'price',
          has_intraday: !0,
          has_daily: !0,
          has_weekly_and_monthly: !0,
          supported_resolutions: this.configuration.supported_resolutions || [],
          volume_precision: 8,
          data_status: 'streaming',
          currency_code: 'USD',
          original_currency_code: 'USD',
          // Use long_description field to store additional information
          long_description: JSON.stringify({
            baseToken: n,
            quoteToken: a,
            fromChainId: i,
            toChainId: c,
            displayName: S,
            fromChainName: (s == null ? void 0 : s.name) || 'BNB Smart Chain (BEP20)',
            fromChainDisplayName: (s == null ? void 0 : s.displayName.toLowerCase()) || 'BSC',
            toChainName: (l == null ? void 0 : l.name) || 'BNB Smart Chain (BEP20)',
            toChainDisplayName: (l == null ? void 0 : l.displayName.toLowerCase()) || 'BSC',
          }),
        }
      setTimeout(() => {
        t(f)
      }, 0)
    } catch (n) {
      console.error('Error in resolveSymbol:', n), o('Failed to resolve symbol')
    }
  }
  /**
   * Get historical K-line data
   * This is the core method for TradingView chart loading, responsible for fetching historical price data
   *
   * @param symbolInfo - Trading pair information object containing all info set in resolveSymbol
   * @param resolution - Time period, e.g. '1', '5', '15', '30', '60', '240', '1D', '1W', '1M'
   * @param periodParams - Time range parameters including from (start timestamp in seconds), to (end timestamp in seconds), and countBack (number of K-lines requested)
   * @param onResult - Success callback function to return K-line data
   * @param onError - Error callback function
   */
  getBars(e, t, o, n, a) {
    console.log('[Datafeed]: getBars() called with', {
      symbol: e.name,
      resolution: t,
      from: new Date(o.from * 1e3).toISOString(),
      to: new Date(o.to * 1e3).toISOString(),
      countBack: o.countBack,
    })
    try {
      const i = JSON.parse(e.long_description || '{}'),
        { baseToken: c, quoteToken: s, fromChainId: l, toChainId: p } = i
      if (!c || !s || !l || !p) {
        console.error('[Datafeed]: Missing token information in symbolInfo', e),
          a('Missing token information in symbol')
        return
      }
      this.api.setPlatform(Number(l), 'from'), this.api.setPlatform(Number(p), 'to')
      const { from: m, to: S, countBack: f } = o
      console.log(`[Datafeed]: Fetching prices for base token ${c} and quote token ${s}`),
        console.warn(`[Datafeed]: tv Resolution: ${t}, cmc Resolution: ${T[t]}`)
      const E = this.api.getBars('from', c, T[t], m, S, f),
        C = this.api.getBars('to', s, T[t], m, S, f)
      Promise.all([E, C])
        .then(([D, $]) => {
          if (!D || D.length === 0 || !$ || $.length === 0) {
            console.log(`[Datafeed]: No data for ${e.name} from=${m} to=${S}`), n([], { noData: !0 })
            return
          }
          const b = [],
            B = /* @__PURE__ */ new Map()
          D.forEach((d) => {
            B.set(d.time, { base: d })
          }),
            $.forEach((d) => {
              const r = B.get(d.time)
              r ? (r.quote = d) : B.set(d.time, { quote: d })
            })
          const g = Array.from(B.keys()).sort((d, r) => d - r)
          let u = null
          g.forEach((d) => {
            const r = B.get(d)
            if (r.base && r.quote) {
              let w = r.base.open / r.quote.open,
                k = r.base.high / r.quote.high,
                y = r.base.low / r.quote.low
              const N = r.base.close / r.quote.close
              k < y && ([k, y] = [y, k]), u && (w = u.close)
              const F = r.base.volume !== void 0 ? r.base.volume : 0,
                O = r.quote.volume !== void 0 ? r.quote.volume : 0,
                q = (F + O) / 2,
                W = Math.max(w, N) * 5,
                M = Math.min(w, N) / 5
              ;(k > W || y < M) &&
                console.warn(`[Datafeed]: Abnormal price range detected at ${new Date(d).toISOString()}:`, {
                  symbol: e.name,
                  time: d,
                  timeUTC: new Date(d).toUTCString(),
                  open: w,
                  high: k,
                  low: y,
                  close: N,
                  highToOpenRatio: k / w,
                  highToCloseRatio: k / N,
                  lowToOpenRatio: y / w,
                  lowToCloseRatio: y / N,
                  baseToken: {
                    open: r.base.open,
                    high: r.base.high,
                    low: r.base.low,
                    close: r.base.close,
                  },
                  quoteToken: {
                    open: r.quote.open,
                    high: r.quote.high,
                    low: r.quote.low,
                    close: r.quote.close,
                  },
                })
              const v = {
                time: d,
                open: w,
                high: k,
                low: y,
                close: N,
                volume: q,
              }
              b.push(v), (u = v)
            }
          }),
            b.sort((d, r) => d.time - r.time)
          for (let d = 1; d < b.length; d++) {
            const r = b[d - 1],
              w = b[d]
            w.open !== r.close && (w.open = r.close)
          }
          console.log(`[Datafeed]: Calculated ${b.length} bars for ${e.name}`, {
            firstBar: b.length > 0 ? b[0] : null,
            lastBar: b.length > 0 ? b[b.length - 1] : null,
          }),
            n(b, { noData: b.length === 0 })
        })
        .catch((D) => {
          console.error('[Datafeed]: Error fetching bars from API:', D),
            a(`Failed to fetch bars: ${D instanceof Error ? D.message : String(D)}`)
        })
    } catch (i) {
      console.error('[Datafeed]: Error in getBars method:', i),
        a(`Error processing request: ${i instanceof Error ? i.message : String(i)}`)
    }
  }
  /**
   * Subscribe to real-time data
   * This method is responsible for establishing WebSocket connection and subscribing to real-time K-line data
   *
   * @param symbolInfo - Trading pair information object containing all info set in resolveSymbol
   * @param resolution - Time period, e.g. '1', '5', '15', '30', '60', '240', '1D', '1W', '1M'
   * @param onTick - Callback function to receive real-time K-line data
   * @param subscriberUID - Unique subscriber identifier
   * @param onResetCacheNeededCallback - Reset cache callback function
   */
  subscribeBars(e, t, o, n, a) {
    try {
      const i = JSON.parse(e.long_description || '{}'),
        { baseToken: c, quoteToken: s, fromChainId: l, toChainId: p } = i
      if (!c || !s || !l || !p) {
        console.error('[Datafeed]: Missing token information in symbolInfo for WebSocket subscription', e)
        return
      }
      this.subscriptions.set(n, {
        symbolInfo: e,
        resolution: t,
        onTick: o,
      })
      const m = I(Number(l))
      if (!m) {
        console.error(`[Datafeed]: Chain ID ${l} not supported for WebSocket subscription`)
        return
      }
      const S = I(Number(p))
      if (!S) {
        console.error(`[Datafeed]: Chain ID ${p} not supported for WebSocket subscription`)
        return
      }
      const f = m.id,
        E = S.id
      this.initWebSocket()
      const C = T[t],
        D = `datahub@kline@${f}@${c.toLowerCase()}@${C}`,
        $ = `datahub@kline@${E}@${s.toLowerCase()}@${C}`
      this.ws && this.ws.readyState === WebSocket.OPEN
        ? (this.ws.send(
            JSON.stringify({
              method: 'SUBSCRIPTION',
              params: [D],
            }),
          ),
          this.ws.send(
            JSON.stringify({
              method: 'SUBSCRIPTION',
              params: [$],
            }),
          ))
        : console.warn('[Datafeed]: WebSocket not ready, will try to subscribe when connected')
    } catch (i) {
      console.error('[Datafeed]: Error in subscribeBars:', i)
    }
  }
  /**
   * Initialize WebSocket connection
   * This method is responsible for creating WebSocket connection and setting up event handlers
   * If connection already exists, it won't be recreated
   */
  initWebSocket() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[Datafeed]: WebSocket connection already open')
      return
    }
    this.ws && (console.log('[Datafeed]: Closing existing WebSocket connection'), this.ws.close(), (this.ws = null))
    try {
      ;(this.ws = new WebSocket(this.wsUrl)),
        (this.ws.onopen = () => {
          console.log('[Datafeed]: WebSocket connection established'), this.resubscribeAll()
        }),
        (this.ws.onmessage = (e) => {
          try {
            const t = JSON.parse(e.data)
            this.processWebSocketMessage(t)
          } catch (t) {
            console.error('[Datafeed]: Error processing WebSocket message:', t)
          }
        }),
        (this.ws.onerror = (e) => {
          console.error('[Datafeed]: WebSocket error:', e)
        }),
        (this.ws.onclose = (e) => {
          console.log(`[Datafeed]: WebSocket connection closed: ${e.code} ${e.reason}`),
            e.code !== 1e3 && setTimeout(() => this.initWebSocket(), 5e3)
        })
    } catch (e) {
      console.error('[Datafeed]: Error initializing WebSocket:', e)
    }
  }
  /**
   * Resend all subscription requests
   * When WebSocket connection is re-established, need to resend all subscription requests
   */
  resubscribeAll() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[Datafeed]: Cannot resubscribe, WebSocket not open')
      return
    }
    console.log(`[Datafeed]: Resubscribing to ${this.subscriptions.size} symbols`),
      this.subscriptions.forEach((e, t) => {
        const { symbolInfo: o, resolution: n } = e
        try {
          const a = JSON.parse(o.long_description || '{}'),
            { baseToken: i, quoteToken: c, fromChainId: s, toChainId: l } = a
          if (!i || !c || !s || !l) {
            console.error(`[Datafeed]: Missing token information for ${t}`)
            return
          }
          const p = I(Number(s))
          if (!p) {
            console.error(`[Datafeed]: Chain ID ${s} not supported for ${t}`)
            return
          }
          const m = I(Number(l))
          if (!m) {
            console.error(`[Datafeed]: Chain ID ${l} not supported for ${t}`)
            return
          }
          const S = p.id,
            f = m.id,
            E = T[n],
            C = `datahub@kline@${S}@${i.toLowerCase()}@${E}`,
            D = `datahub@kline@${f}@${c.toLowerCase()}@${E}`
          this.ws.send(
            JSON.stringify({
              method: 'SUBSCRIPTION',
              params: [C],
            }),
          ),
            this.ws.send(
              JSON.stringify({
                method: 'SUBSCRIPTION',
                params: [D],
              }),
            )
        } catch (a) {
          console.error(`[Datafeed]: Error resubscribing for ${t}:`, a)
        }
      })
  }
  /**
   * Asynchronously fetch 24-hour data and return calculated results
   * Get token addresses and chain IDs from window.pcsExtraData
   * @returns Calculated 24-hour data including high, low, close and changes
   */
  async fetch24HrData() {
    try {
      const e = window.pcsExtraData.token0Address,
        t = window.pcsExtraData.token1Address,
        o = window.pcsExtraData.fromChainId,
        n = window.pcsExtraData.toChainId
      if (!e || !t) return console.error('[fetch24HrData]: Missing token addresses'), null
      console.log(`[Datafeed]: Fetching 24hr data for ${e}/${t}`),
        this.api.setPlatform(Number(o), 'from'),
        this.api.setPlatform(Number(n), 'to')
      const a = await this.api.get24HrData(e, 'from'),
        i = await this.api.get24HrData(t, 'to')
      if (!a || !i) return console.error('[Datafeed]: Failed to fetch 24hr data'), null
      let c = a.h / i.h,
        s = a.l / i.l
      c < s && ([c, s] = [s, c])
      const l = a.c / i.c,
        p = a.changes - i.changes
      return (
        console.log('[Datafeed]: 24hr data calculated:', { high: c, low: s, close: l, changes: p }),
        { high: c, low: s, close: l, changes: p }
      )
    } catch (e) {
      return console.error('[Datafeed]: Error fetching 24hr data:', e), null
    }
  }
  /**
   * Process WebSocket received messages
   * @param data - Received message data
   */
  processWebSocketMessage(e) {
    if (typeof e == 'string')
      try {
        e = JSON.parse(e)
      } catch (f) {
        console.error('[Datafeed]: Error parsing WebSocket message:', f)
        return
      }
    if (!e) {
      console.warn('[Datafeed]: Empty WebSocket message')
      return
    }
    if (!e.d || !e.c) {
      console.warn('[Datafeed]: Missing required data fields in message:', e)
      return
    }
    const t = e.c
    let o = ''
    const n = t.split('@')
    if (n.length >= 4) o = n[3].toLowerCase()
    else {
      console.error(`[Datafeed]: Could not extract token address from subscription string: ${t}`)
      return
    }
    if (!e.d || !Array.isArray(e.d.u) || e.d.u.length < 6) {
      console.warn('[Datafeed]: Invalid price data format:', e.d)
      return
    }
    const a = e.d.u,
      i = parseFloat(a[0]),
      c = parseFloat(a[1]),
      s = parseFloat(a[2]),
      l = parseFloat(a[3]),
      p = parseFloat(a[4])
    let m = parseFloat(a[5])
    if ((m < 1e10 && (m *= 1e3), isNaN(i) || isNaN(c) || isNaN(s) || isNaN(l) || isNaN(m))) {
      console.warn('[Datafeed]: Invalid price values after parsing:', {
        open: i,
        high: c,
        low: s,
        close: l,
        volume: p,
        timestamp: m,
      })
      return
    }
    const S = {
      o: i,
      h: c,
      l: s,
      c: l,
      v: p,
      t: m,
    }
    try {
      this.subscriptions.forEach((f, E) => {
        const { symbolInfo: C, onTick: D } = f,
          $ = JSON.parse(C.long_description || '{}'),
          { baseToken: b, quoteToken: B } = $
        if (
          (o === b.toLowerCase() || o === B.toLowerCase()) &&
          (o === b.toLowerCase() ? (f.baseData = S) : (f.quoteData = S), f.baseData && f.quoteData)
        ) {
          const g = f.baseData,
            u = f.quoteData
          if (Math.abs(g.t - u.t) <= 1e3) {
            if (
              !isFinite(g.o) ||
              g.o <= 0 ||
              !isFinite(g.h) ||
              g.h <= 0 ||
              !isFinite(g.l) ||
              g.l <= 0 ||
              !isFinite(g.c) ||
              g.c <= 0 ||
              !isFinite(u.o) ||
              u.o <= 0 ||
              !isFinite(u.h) ||
              u.h <= 0 ||
              !isFinite(u.l) ||
              u.l <= 0 ||
              !isFinite(u.c) ||
              u.c <= 0
            ) {
              console.error(`[Datafeed]: Invalid price data for ${C.name}, skipping update`)
              return
            }
            let d = g.o / u.o,
              r = g.h / u.h,
              w = g.l / u.l
            const k = g.c / u.c
            r < w && ([r, w] = [w, r])
            const y = (g.v + u.v) / 2
            if (
              (f.lastBar &&
                ((d = f.lastBar.close),
                console.log(
                  `[Datafeed]: Applied last close = new open logic for WebSocket. Previous close: ${
                    f.lastBar.close
                  }, Original open: ${g.o / u.o}`,
                )),
              !isFinite(d) || !isFinite(r) || !isFinite(w) || !isFinite(k) || !isFinite(y))
            ) {
              console.error(`[Datafeed]: Calculated invalid price ratio for ${C.name}:`, {
                open: d,
                high: r,
                low: w,
                close: k,
                volume: y,
              })
              return
            }
            const N = {
              time: g.t,
              open: d,
              high: r,
              low: w,
              close: k,
              volume: y,
            }
            ;(f.lastBar = N), D(N)
          }
        }
      })
    } catch (f) {
      console.error('[Datafeed]: Error processing WebSocket kline data:', f)
    }
  }
  /**
   * Cancel real-time data subscription
   * This method is responsible for canceling specific WebSocket subscriptions
   *
   * @param subscriberUID - Unique subscriber identifier
   */
  unsubscribeBars(e) {
    console.log('[Datafeed]: unsubscribeBars() called with', e)
    try {
      if (!this.subscriptions.get(e)) {
        console.warn(`[Datafeed]: Subscription ${e} not found`)
        return
      }
      this.subscriptions.delete(e),
        this.subscriptions.size === 0 &&
          this.ws &&
          (console.log('[Datafeed]: No more subscriptions, closing WebSocket connection'),
          this.ws.close(1e3, 'No active subscriptions'),
          (this.ws = null))
    } catch (t) {
      console.error(`[Datafeed]: Error unsubscribing ${e}:`, t)
    }
  }
  /**
   * Search trading pairs
   * This is a placeholder method, will be implemented later
   */
  searchSymbols() {
    console.log('[Datafeed]: searchSymbols() called')
  }
}
class j {
  constructor(e = {}) {
    P(this, 'config')
    this.config = {
      baseUrl: 'https://pcs.dquery.ai',
      fromPlatform: 'bsc',
      // 默認為 BNB Chain (BSC) 的 CoinMarketCap 平台 displayName
      toPlatform: 'bsc',
      // 默認為 BNB Chain (BSC) 的 CoinMarketCap 平台 displayName
      ...e,
    }
  }
  /**
   * 設置平台/鏈ID
   * @param chainId - 區塊鏈的 chainId
   */
  setPlatform(e, t) {
    const o = I(e)
    o
      ? (t === 'from'
          ? (this.config.fromPlatform = o.displayName.toLowerCase())
          : (this.config.toPlatform = o.displayName.toLowerCase()),
        console.log(`set platform: ${o.name} (ID: ${o.id}, ChainId: ${e})`))
      : (t === 'from' ? (this.config.fromPlatform = 'bsc') : (this.config.toPlatform = 'bsc'),
        console.warn(`set platform: can't find chainId ${e} platform, use default platform BNB Chain`))
  }
  /**
   * 獲取K線數據
   * @param params - K線參數
   */
  async getKLineData(e, t) {
    const o = new URL('/u-kline/v1/k-line/candles', this.config.baseUrl)
    o.searchParams.append(
      'platform',
      t === 'from' ? this.config.fromPlatform.toString() : this.config.toPlatform.toString(),
    ),
      o.searchParams.append('address', e.address),
      o.searchParams.append('interval', e.interval),
      e.limit && o.searchParams.append('limit', e.limit.toString()),
      e.from && o.searchParams.append('from', e.from.toString()),
      e.to && o.searchParams.append('to', e.to.toString())
    try {
      const n = await fetch(o.toString())
      if (!n.ok) throw new Error(`API error: ${n.status}`)
      return await n.json()
    } catch (n) {
      throw (console.error('Failed to fetch K-line data:', n), n)
    }
  }
  /**
   * 將API返回的K線數據轉換為TradingView Bar格式
   * @param data - API返回的K線數據
   */
  convertToTradingViewBars(e) {
    return e.map((t) => {
      const [o, n, a, i, c, s] = t
      return {
        time: s,
        // 時間戳 (毫秒)
        open: o,
        high: n,
        low: a,
        close: i,
        volume: c,
      }
    })
  }
  /**
   * 根據交易對和時間範圍獲取K線數據
   * @param tokenAddress - 代幣地址
   * @param resolution - 時間週期
   * @param from - 開始時間戳 (秒)
   * @param to - 結束時間戳 (秒)
   * @param limit - 限制數量
   */
  /**
   * 將 TradingView 解析度轉換為 API 所需的時間間隔格式
   * @param resolution - TradingView 解析度
   */
  convertResolution(e) {
    const t = T[e]
    return t
      ? {
          '1m': '1min',
          '5m': '5min',
          '15m': '15min',
          '30m': '30min',
          '1h': '1h',
          '4h': '4h',
          '1d': '1d',
          '1w': '1w',
          '1M': '1M',
        }[t] || '5min'
      : (console.warn(`未知的解析度: ${e}，使用默認值 5min`), '5min')
  }
  async getBars(e, t, o, n, a, i) {
    try {
      const c = this.convertResolution(o),
        s = await this.getKLineData(
          {
            address: t,
            interval: c,
            from: n * 1e3,
            // 轉換為毫秒
            to: a * 1e3,
            // 轉換為毫秒
            limit: i,
          },
          e,
        )
      if (s.status.error_code !== '0') throw new Error(`API error: ${s.status.error_message}`)
      return this.convertToTradingViewBars(s.data)
    } catch (c) {
      throw (console.error('Failed to get bars:', c), c)
    }
  }
  /**
   * 獲取代幣 24 小時數據
   * @param tokenAddress - 代幣地址
   * @returns 24小時數據，包含最高價、最低價、當前價格和價格變化百分比
   */
  async get24HrData(e, t) {
    try {
      const o = Math.floor(Date.now() / 1e3),
        n = o - 1440 * 60,
        a = await this.getBars(t, e, '60', n, o, 24)
      if (!a || a.length === 0) throw new Error(`No data available for token ${e}`)
      let i = -1 / 0,
        c = 1 / 0
      a.forEach((m) => {
        m.high > i && (i = m.high), m.low < c && (c = m.low)
      })
      const s = a[a.length - 1].close,
        l = a[0].open,
        p = ((s - l) / l) * 100
      return {
        h: i,
        l: c,
        c: s,
        changes: p,
      }
    } catch (o) {
      throw (console.error('Failed to get 24hr data:', o), o)
    }
  }
}
const x = (h) => new j(h)
function K(h, e) {
  const t = e || x()
  return new J(h, t)
}
const A = 'https://assets.pancakeswap.finance',
  U = `${A}/web/charts/charting_library/`,
  G = `${A}/web/charts/datafeeds/`
function X(h, e = {}) {
  if (!window.TradingView || !window.Datafeeds)
    return (
      console.error(
        'TradingView or Datafeeds not found. Make sure to load the library scripts before using this function.',
      ),
      null
    )
  ;(window.pcsExtraData = window.pcsExtraData || {}),
    (window.pcsExtraData.token0Address =
      window.pcsExtraData.token0Address || '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'),
    (window.pcsExtraData.token1Address =
      window.pcsExtraData.token1Address || '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'),
    (window.pcsExtraData.fromChainId = window.pcsExtraData.fromChainId || 56),
    (window.pcsExtraData.toChainId = window.pcsExtraData.toChainId || 56)
  const t = window.pcsExtraData.fromChainId,
    o = window.pcsExtraData.toChainId,
    n = I(t),
    a = I(o)
  n
    ? console.log(`Using blockchain: ${n.name} (${n.displayName}), Chain ID: ${n.chainId}`)
    : console.warn(`Chain ID ${t} is not supported. Using default BNB Chain (56).`),
    a
      ? console.log(`Using blockchain: ${a.name} (${a.displayName}), Chain ID: ${a.chainId}`)
      : console.warn(`Chain ID ${o} is not supported. Using default BNB Chain (56).`)
  const i = x(),
    c = K({}, i),
    l = {
      ...{
        symbol: 'WBNB/CAKE',
        // Display name, actual data comes from token address in window.TradingView
        interval: '15',
        fullscreen: !1,
        library_path: U,
        locale: 'en',
        datafeed: c,
        // Use our own datafeed
        disabled_features: ['use_localstorage_for_settings'],
        enabled_features: ['study_templates'],
        charts_storage_url: 'https://saveload.tradingview.com',
        charts_storage_api_version: '1.1',
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        theme: 'Light',
      },
      ...e,
      container: typeof h == 'string' ? h : h.id,
    }
  return new window.TradingView.widget(l)
}
function Y(h = U, e = G) {
  return new Promise((t, o) => {
    const n = document.createElement('script')
    ;(n.src = `${h}charting_library.standalone.js`),
      (n.async = !0),
      (n.onload = () => {
        const a = document.createElement('script')
        ;(a.src = `${e}bundle.288f9ba8dc6bb464c778b5c0c8e15d41.js`),
          (a.async = !0),
          (a.onload = () => {
            t({ TradingView: window.TradingView, Datafeeds: window.Datafeeds })
          }),
          (a.onerror = () => o(new Error('Failed to load Datafeeds library'))),
          document.head.appendChild(a)
      }),
      (n.onerror = () => o(new Error('Failed to load TradingView library'))),
      document.head.appendChild(n)
  })
}
function Q() {
  return window.TradingView
}
function Z() {
  return window.Datafeeds
}
const te = {
  createTradingViewWidget: X,
  loadTradingViewLibrary: Y,
  getTradingView: Q,
  getDatafeeds: Z,
  CHAIN_ID_MAP: _,
  getChainInfoByChainId: I,
}
export {
  X as createTradingViewWidget,
  te as default,
  Z as getDatafeeds,
  Q as getTradingView,
  Y as loadTradingViewLibrary,
}
//# sourceMappingURL=pancakeswap-charting-library.es.js.map
