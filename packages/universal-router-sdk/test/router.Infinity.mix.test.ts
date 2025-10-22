import { ChainId } from '@pancakeswap/chains'
import { POOL_TYPE } from '@pancakeswap/infinity-sdk'
import {
  CurrencyAmount,
  ERC20Token,
  Ether,
  Pair,
  Percent,
  TradeType,
  Route as V2Route,
  Trade as V2Trade,
  ZERO_ADDRESS,
} from '@pancakeswap/sdk'
import { InfinityBinPool, InfinityClPool, PoolType, SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router'
import { Pool } from '@pancakeswap/v3-sdk'
import { isHex, parseEther, stringify } from 'viem'
import { beforeEach, describe, expect, it } from 'vitest'
import { PancakeSwapUniversalRouter } from '../src'
import { ACTION_CONSTANTS, ADDRESS_THIS, MSG_SENDER } from '../src/constants'
import { PancakeSwapOptions } from '../src/entities/types'
import { EncodedSingleSwapInParams } from '../src/infinityTypes'
import { CommandType } from '../src/router.types'
import { decodeUniversalCalldata } from '../src/utils/calldataDecode'
import { fixtureAddresses } from './fixtures/address'
import { buildMixedRouteTradeInfinity, buildV2Trade } from './utils/buildTrade'
import {
  testInfinitySettleAction,
  testInfinitySingleSwapAction,
  testInfinityTakeAction,
  testV2SwapExactInCommand,
  testWrapETHCommand,
} from './utils/commandTestUtils'

const TEST_FEE_RECIPIENT_ADDRESS = '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' as const

const swapOptions = (options: Partial<PancakeSwapOptions>): PancakeSwapOptions => {
  let slippageTolerance = new Percent(5, 100)
  if (options.fee) slippageTolerance = slippageTolerance.add(options.fee.fee)
  return {
    slippageTolerance,
    ...options,
  }
}

const TEST_FEE = 500n

const feeOptions = {
  recipient: TEST_FEE_RECIPIENT_ADDRESS,
  fee: new Percent(TEST_FEE, 10000n),
}

describe('PancakeSwap Universal Mixed Router Command Generation Test', () => {
  const chainId = ChainId.ETHEREUM
  const liquidity = parseEther('1000')

  let ETHER: Ether
  let USDC: ERC20Token
  let USDT: ERC20Token
  let CAKE: ERC20Token
  let WETH_USDC_V2: Pair
  let USDC_USDT_V2: Pair
  let WETH_USDC_V3_MEDIUM: Pool
  let WETH_USDC_V3_LOW: Pool
  let USDC_USDT_V3_LOW: Pool
  let ETH_CAKE_CL_INFI: InfinityClPool
  let WETH_CAKE_CL_INFI: InfinityClPool
  let USDC_CAKE_V2: Pair
  let CAKE_USDC_CL_INFI: InfinityClPool
  let ETH_CAKE_BIN_INFI: InfinityBinPool

  expect.addSnapshotSerializer({
    serialize(val) {
      return stringify(decodeUniversalCalldata(val), null, 2)
    },
    test(val) {
      return val && isHex(val)
    },
  })

  beforeEach(async () => {
    ;({
      ETHER,
      CAKE,
      USDC,
      USDT,
      WETH_USDC_V2,
      USDC_USDT_V2,
      USDC_USDT_V3_LOW,
      WETH_USDC_V3_LOW,
      WETH_USDC_V3_MEDIUM,
      WETH_CAKE_CL_INFI,
      ETH_CAKE_CL_INFI,
      USDC_CAKE_V2,
      CAKE_USDC_CL_INFI,
      ETH_CAKE_BIN_INFI,
    } = await fixtureAddresses(chainId, liquidity))
  })

  describe('mixed', () => {
    it('should encodes USDC->CAKE through mixed swaps v3(WETH->USDC) -> Infinity native(ETH->CAKE)', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(USDC, 10000n)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 500n)
      const trade = await buildMixedRouteTradeInfinity(inputAmount, outputAmount, TradeType.EXACT_INPUT, [
        WETH_USDC_V3_LOW,
        ETH_CAKE_CL_INFI,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const amountOutMin = SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient
      expect(BigInt(value)).toEqual(0n)

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(3)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.V3_SWAP_EXACT_IN])
      expect(decodedCommands[1].command).toEqual(CommandType[CommandType.UNWRAP_WETH])
      expect(decodedCommands[2].command).toEqual(CommandType[CommandType.INFI_SWAP])

      // COMMAND #1 V3_SWAP_EXACT_IN
      expect(decodedCommands[0].args[0].name).toEqual('recipient')
      expect(decodedCommands[0].args[0].value).toEqual(ADDRESS_THIS)
      expect(decodedCommands[0].args[1].name).toEqual('amountIn')
      expect(decodedCommands[0].args[1].value).toEqual(10000n)
      expect(decodedCommands[0].args[2].name).toEqual('amountOutMin')
      expect(decodedCommands[0].args[2].value).toEqual(0n)

      // COMMAND #2 UNWRAP_WETH
      expect(decodedCommands[1].args[0].name).toEqual('recipient')
      expect(decodedCommands[1].args[0].value).toEqual(ADDRESS_THIS)
      expect(decodedCommands[1].args[1].name).toEqual('amountMin')
      expect(decodedCommands[1].args[1].value).toEqual(0n)

      // COMMAND #3 INFI_SWAP
      const actions = decodedCommands[2].actions!
      expect(actions.length).toEqual(3)

      testInfinitySettleAction(actions[0], ETHER, BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE), false)

      const swapParams = actions[1].args[0].value as EncodedSingleSwapInParams
      expect(swapParams.amountIn).toEqual(ACTION_CONSTANTS.OPEN_DELTA)
      expect(swapParams.amountOutMinimum).toEqual(amountOutMin)
      expect(swapParams.zeroForOne).toEqual(true)
      expect(swapParams.poolKey.currency0).toEqual(ZERO_ADDRESS)
      expect(swapParams.poolKey.currency1).toEqual(CAKE.address)

      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode USDC->CAKE through mixed swaps v3(WETH->USDC) -> Infinity non-native(WETH->CAKE)', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(USDC, 10000n)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 500n)
      const trade = await buildMixedRouteTradeInfinity(inputAmount, outputAmount, TradeType.EXACT_INPUT, [
        WETH_USDC_V3_LOW,
        WETH_CAKE_CL_INFI,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const amountOutMin = SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient
      expect(BigInt(value)).toEqual(0n)

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(2)
      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.V3_SWAP_EXACT_IN])
      expect(decodedCommands[1].command).toEqual(CommandType[CommandType.INFI_SWAP])

      // COMMAND #1 V3_SWAP_EXACT_IN
      expect(decodedCommands[0].args[0].name).toEqual('recipient')
      expect(decodedCommands[0].args[0].value).toEqual(ADDRESS_THIS)
      expect(decodedCommands[0].args[1].name).toEqual('amountIn')
      expect(decodedCommands[0].args[1].value).toEqual(10000n)
      expect(decodedCommands[0].args[2].name).toEqual('amountOutMin')
      expect(decodedCommands[0].args[2].value).toEqual(0n)

      // COMMAND #2 INFI_SWAP
      const actions = decodedCommands[1].actions!
      expect(actions.length).toEqual(3)

      testInfinitySettleAction(actions[0], ETHER.wrapped, BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE), false)

      const swapParams = actions[1].args[0].value as EncodedSingleSwapInParams
      expect(swapParams.amountIn).toEqual(ACTION_CONSTANTS.OPEN_DELTA)
      expect(swapParams.amountOutMinimum).toEqual(amountOutMin)
      expect(swapParams.zeroForOne).toEqual(true)
      expect(swapParams.poolKey.currency0).toEqual(ETHER.wrapped.address)
      expect(swapParams.poolKey.currency1).toEqual(CAKE.address)

      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode CAKE->USDC through mixed swaps Infinity(WETH-CAKE) -> v3(WETH-USDC)', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 50n)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 10000n)
      const trade = await buildMixedRouteTradeInfinity(inputAmount, outputAmount, TradeType.EXACT_INPUT, [
        WETH_CAKE_CL_INFI,
        WETH_USDC_V3_MEDIUM,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      expect(BigInt(value)).toEqual(0n)
      const maximumAmountIn = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(2)
      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[1].command).toEqual(CommandType[CommandType.V3_SWAP_EXACT_IN])

      // COMMAND #1 INFI_SWAP
      const actions = decodedCommands[0].actions!
      expect(actions.length).toEqual(3)

      const swapParams = actions[0].args[0].value as EncodedSingleSwapInParams
      expect(swapParams.amountIn).toEqual(50n)
      expect(swapParams.amountOutMinimum).toEqual(0n)
      expect(swapParams.zeroForOne).toEqual(false)
      expect(swapParams.poolKey.currency0).toEqual(ETHER.wrapped.address)
      expect(swapParams.poolKey.currency1).toEqual(CAKE.address)

      testInfinitySettleAction(actions[1], CAKE, 50n, true)
      testInfinityTakeAction(actions[2], ETHER.wrapped, ADDRESS_THIS, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode CAKE->USDC through mixed swaps Infinity(ETH-CAKE) -> v3(WETH-USDC)', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 50n)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 10000n)
      const trade = await buildMixedRouteTradeInfinity(inputAmount, outputAmount, TradeType.EXACT_INPUT, [
        ETH_CAKE_CL_INFI,
        WETH_USDC_V3_LOW,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      const minAmountOut = SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient
      const maximumAmountIn = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(0n)
      expect(calldata).toMatchSnapshot()
      expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(3)
      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[1].command).toEqual(CommandType[CommandType.WRAP_ETH])
      expect(decodedCommands[2].command).toEqual(CommandType[CommandType.V3_SWAP_EXACT_IN])

      // COMMAND #0 INFI_SWAP
      const actions = decodedCommands[0].actions!
      expect(actions.length).toEqual(3)

      const swapParams = actions[0].args[0].value as EncodedSingleSwapInParams
      expect(swapParams.amountIn).toEqual(50n)
      expect(swapParams.amountOutMinimum).toEqual(0n)

      testInfinitySettleAction(actions[1], CAKE, 50n, true)
      testInfinityTakeAction(actions[2], ETHER, ADDRESS_THIS, ACTION_CONSTANTS.OPEN_DELTA)

      // COMMAND #1 WRAP_ETH
      expect(decodedCommands[1].args[0].name).toEqual('recipient')
      expect(decodedCommands[1].args[0].value).toEqual(ADDRESS_THIS)
      expect(decodedCommands[1].args[1].name).toEqual('amountMin')
      expect(decodedCommands[1].args[1].value).toEqual(BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE))

      // COMMAND #2 V3_SWAP_EXACT_IN
      expect(decodedCommands[2].args[0].name).toEqual('recipient')
      expect(decodedCommands[2].args[0].value).toEqual(MSG_SENDER)
      expect(decodedCommands[2].args[1].name).toEqual('amountIn')
      expect(decodedCommands[2].args[1].value).toEqual(BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE))
      expect(decodedCommands[2].args[2].name).toEqual('amountOutMin')
      expect(decodedCommands[2].args[2].value).toEqual(minAmountOut)
      expect(decodedCommands[2].args[4].name).toEqual('payerIsUser')
      expect(decodedCommands[2].args[4].value).toEqual(false)
    })

    it('label: should encode CAKE->USDC through mixed swaps Infinity(ETH-CAKE) -> v3(WETH-USDC) payerIsUser=false', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 50n)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 10000n)
      const trade = await buildMixedRouteTradeInfinity(inputAmount, outputAmount, TradeType.EXACT_INPUT, [
        ETH_CAKE_CL_INFI,
        WETH_USDC_V3_LOW,
      ])

      const options = swapOptions({
        payerIsUser: false,
      })
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      const minAmountOut = SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient
      const maximumAmountIn = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(0n)
      expect(calldata).toMatchSnapshot()
      expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(3)
      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[1].command).toEqual(CommandType[CommandType.WRAP_ETH])
      expect(decodedCommands[2].command).toEqual(CommandType[CommandType.V3_SWAP_EXACT_IN])

      // COMMAND #0 INFI_SWAP
      const actions = decodedCommands[0].actions!
      expect(actions.length).toEqual(3)

      //   Action #0 SETTLE
      testInfinitySettleAction(actions[0], CAKE, maximumAmountIn, false)

      const swapParams = actions[1].args[0].value as EncodedSingleSwapInParams
      expect(swapParams.amountIn).toEqual(50n)
      expect(swapParams.amountOutMinimum).toEqual(0n)

      testInfinityTakeAction(actions[2], ETHER, ADDRESS_THIS, ACTION_CONSTANTS.OPEN_DELTA)

      // COMMAND #1 WRAP_ETH
      expect(decodedCommands[1].args[0].name).toEqual('recipient')
      expect(decodedCommands[1].args[0].value).toEqual(ADDRESS_THIS)
      expect(decodedCommands[1].args[1].name).toEqual('amountMin')
      expect(decodedCommands[1].args[1].value).toEqual(BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE))

      // COMMAND #2 V3_SWAP_EXACT_IN
      expect(decodedCommands[2].args[0].name).toEqual('recipient')
      expect(decodedCommands[2].args[0].value).toEqual(MSG_SENDER)
      expect(decodedCommands[2].args[1].name).toEqual('amountIn')
      expect(decodedCommands[2].args[1].value).toEqual(BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE))
      expect(decodedCommands[2].args[2].name).toEqual('amountOutMin')
      expect(decodedCommands[2].args[2].value).toEqual(minAmountOut)
      expect(decodedCommands[2].args[4].name).toEqual('payerIsUser')
      expect(decodedCommands[2].args[4].value).toEqual(false)
    })

    it('should encode mixed consecutive Infinity swaps, ETH->CAKE(InfinityBin)->USDC(InfinityCl)', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER, 50n)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 10000n)
      const trade = await buildMixedRouteTradeInfinity(inputAmount, outputAmount, TradeType.EXACT_INPUT, [
        ETH_CAKE_BIN_INFI,
        CAKE_USDC_CL_INFI,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const decodedCommands = decodeUniversalCalldata(calldata)
      expect(calldata).toMatchSnapshot()

      expect(decodedCommands.length).toEqual(1)
      const actions = decodedCommands[0].actions!

      expect(actions.length).toEqual(4)
      testInfinitySingleSwapAction(POOL_TYPE.Bin, actions[0], ETHER, CAKE, 50n, ACTION_CONSTANTS.OPEN_DELTA, true)
      testInfinitySettleAction(actions[1], ETHER, 50n, true)
      testInfinitySingleSwapAction(
        POOL_TYPE.CLAMM,
        actions[2],
        CAKE,
        USDC,
        ACTION_CONSTANTS.OPEN_DELTA,
        SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient,
        true,
      )
      testInfinityTakeAction(actions[3], USDC, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode CAKE->USDC through mixed swaps Infinity(WET-CAKE) -> v2(WETH-USDC)', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 50n)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 10000n)
      const trade = await buildMixedRouteTradeInfinity(inputAmount, outputAmount, TradeType.EXACT_INPUT, [
        ETH_CAKE_CL_INFI,
        WETH_USDC_V2,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      expect(BigInt(value)).toEqual(0n)

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(3)
      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[1].command).toEqual(CommandType[CommandType.WRAP_ETH])
      expect(decodedCommands[2].command).toEqual(CommandType[CommandType.V2_SWAP_EXACT_IN])

      // COMMAND #1 INFI_SWAP
      const actions = decodedCommands[0].actions!
      expect(actions.length).toEqual(3)

      const swapParams = actions[0].args[0].value as EncodedSingleSwapInParams
      expect(swapParams.amountIn).toEqual(50n)
      expect(swapParams.amountOutMinimum).toEqual(0n)
      expect(swapParams.zeroForOne).toEqual(false)
      expect(swapParams.poolKey.currency0).toEqual(ZERO_ADDRESS)
      expect(swapParams.poolKey.currency1).toEqual(CAKE.address)

      testInfinitySettleAction(actions[1], CAKE, 50n, true)
      testInfinityTakeAction(actions[2], Ether.onChain(ChainId.BSC), ADDRESS_THIS, ACTION_CONSTANTS.OPEN_DELTA)
    })
  })

  describe('multi-router', () => {
    it('should encode multi-router partial needs wrap through v2/Infinity, WETH->USDC(v2)', async () => {
      // Need wrap, & v2 in beginning
      const amountIn = 1000n
      const v2TradeRoute = new V2Trade(
        new V2Route([WETH_USDC_V2], ETHER, USDC),
        CurrencyAmount.fromRawAmount(ETHER, amountIn),
        TradeType.EXACT_INPUT,
      )

      const v2Trade = buildV2Trade(v2TradeRoute, [
        {
          type: PoolType.V2,
          reserve0: WETH_USDC_V2.reserve0,
          reserve1: WETH_USDC_V2.reserve1,
        },
      ])

      // no need wrap
      const inputInfinity = CurrencyAmount.fromRawAmount(ETHER, amountIn)
      const outputInfinity = CurrencyAmount.fromRawAmount(USDC, 10000n)

      // v2 in middle
      const infinityTrade = await buildMixedRouteTradeInfinity(inputInfinity, outputInfinity, TradeType.EXACT_INPUT, [
        ETH_CAKE_CL_INFI,
        USDC_CAKE_V2,
      ])

      const trade: SmartRouterTrade<TradeType.EXACT_INPUT> = {
        tradeType: TradeType.EXACT_INPUT,
        inputAmount: CurrencyAmount.fromRawAmount(ETHER, amountIn * 2n),
        outputAmount: CurrencyAmount.fromRawAmount(USDC, amountIn * 100n),
        routes: [...v2Trade.routes, ...infinityTrade.routes],
        gasEstimate: 0n,
        gasEstimateInUSD: CurrencyAmount.fromRawAmount(ETHER, amountIn),
      }

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(4)

      // COMMAND #1 WRAP_ETH
      testWrapETHCommand(decodedCommands[0], ADDRESS_THIS, amountIn)

      // COMMAND #2 V2_SWAP_EXACT_IN
      testV2SwapExactInCommand(
        decodedCommands[1],
        MSG_SENDER,
        amountIn,
        SmartRouter.minimumAmountOut(v2Trade, options.slippageTolerance).quotient,
        false,
      )

      // COMMAND #3 INFI_SWAP
      expect(decodedCommands[2].command).toEqual(CommandType[CommandType.INFI_SWAP])
      testInfinitySingleSwapAction(
        POOL_TYPE.CLAMM,
        decodedCommands[2].actions![0],
        ETHER,
        CAKE,
        inputInfinity.quotient,
        ACTION_CONSTANTS.OPEN_DELTA,
        true,
      )

      // COMMAND #4 V2_SWAP_EXACT_IN
      testV2SwapExactInCommand(
        decodedCommands[3],
        MSG_SENDER,
        BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE),
        SmartRouter.minimumAmountOut(infinityTrade, options.slippageTolerance).quotient,
        false,
      )
    })
  })
})
