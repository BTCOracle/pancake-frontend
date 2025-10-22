import { ChainId } from '@pancakeswap/chains'
import { ACTION_CONSTANTS, ACTIONS, decodePoolKey } from '@pancakeswap/infinity-sdk'
import { CurrencyAmount, ERC20Token, Ether, Percent, TradeType, ZERO_ADDRESS } from '@pancakeswap/sdk'
import { InfinityBinPool, MSG_SENDER, SmartRouter } from '@pancakeswap/smart-router'
import { ADDRESS_ZERO } from '@pancakeswap/v3-sdk'
import { isHex, parseEther, stringify } from 'viem'
import { beforeEach, describe, expect, it } from 'vitest'
import { PancakeSwapUniversalRouter } from '../src'
import { PancakeSwapOptions } from '../src/entities/types'
import { EncodedMultiSwapInParams, EncodedMultiSwapOutParams, EncodedSingleSwapOutParams } from '../src/infinityTypes'
import { CommandType } from '../src/router.types'
import { decodeUniversalCalldata } from '../src/utils/calldataDecode'
import { currencyAddressInfinity } from '../src/utils/currencyAddressInfinity'
import { fixtureAddresses } from './fixtures/address'
import { buildInfinityTrade } from './utils/buildTrade'
import { testInfinitySettleAction, testInfinityTakeAction } from './utils/commandTestUtils'

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

describe('PancakeSwap Universal Router Infinity-Bin Pool Command Generation Test', () => {
  const chainId = ChainId.ETHEREUM
  const liquidity = parseEther('1000')

  let ETHER: Ether
  let USDC: ERC20Token
  let CAKE: ERC20Token
  let ETH_CAKE_BIN_INFI: InfinityBinPool
  let ETH_USDC_BIN_INFI: InfinityBinPool

  expect.addSnapshotSerializer({
    serialize(val) {
      return stringify(decodeUniversalCalldata(val), null, 2)
    },
    test(val) {
      return val && isHex(val)
    },
  })

  beforeEach(async () => {
    ;({ ETHER, CAKE, USDC, ETH_CAKE_BIN_INFI, ETH_USDC_BIN_INFI } = await fixtureAddresses(chainId, liquidity))
  })

  describe('Infinity-BIN', () => {
    it('should encode a single exactInput ETH-CAKE BIN swap zeroForOne', async () => {
      const amountIn = parseEther('0.01')
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER, amountIn)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, parseEther('1'))
      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [ETH_CAKE_BIN_INFI])

      const options = swapOptions({})

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const maxIn = SmartRouter.maximumAmountIn(trade, options.slippageTolerance)

      expect(BigInt(value)).toEqual(amountIn)

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[0].args.length).toEqual(0)
      const actions = decodedCommands[0].actions!

      // CL_SWAP_EXACT_IN_SINGLE
      expect(actions[0].action).toEqual(ACTIONS[ACTIONS.BIN_SWAP_EXACT_IN_SINGLE])
      expect(actions[0].args[0].name).toEqual('params')
      const encoded = actions[0].args[0].value as any
      const poolKey = decodePoolKey(encoded.poolKey, 'Bin')
      expect(poolKey.currency0).toEqual(currencyAddressInfinity(inputAmount.currency))
      expect(poolKey.currency1).toEqual(currencyAddressInfinity(outputAmount.currency))

      testInfinitySettleAction(actions[1], ETHER, maxIn.quotient, true)
      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a single exactInput CAKE->ETH BIN swap oneForZero', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000n)
      const outputAmount = CurrencyAmount.fromRawAmount(ETHER, 50n)
      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [ETH_CAKE_BIN_INFI])

      const options = swapOptions({})

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()

      expect(BigInt(value)).toEqual(0n)

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[0].args.length).toEqual(0)
      const actions = decodedCommands[0].actions!

      // CL_SWAP_EXACT_IN_SINGLE
      expect(actions[0].action).toEqual(ACTIONS[ACTIONS.BIN_SWAP_EXACT_IN_SINGLE])
      expect(actions[0].args[0].name).toEqual('params')
      const encoded = actions[0].args[0].value as any
      const poolKey = decodePoolKey(encoded.poolKey, 'CL')
      expect(poolKey.currency1).toEqual(currencyAddressInfinity(inputAmount.currency))
      expect(poolKey.currency0).toEqual(currencyAddressInfinity(outputAmount.currency))

      // SETTLE_ALL
      testInfinitySettleAction(actions[1], CAKE, inputAmount.quotient, true)

      // TAKE
      testInfinityTakeAction(actions[2], ETHER, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a single exactOutput ETH_CAKE BIN swap zeroForOne', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER, 50)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)
      const trade = buildInfinityTrade(TradeType.EXACT_OUTPUT, inputAmount, outputAmount, [ETH_CAKE_BIN_INFI])

      const options = swapOptions({})

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()

      // const minOut = SmartRouter.minimumAmountOut(trade, options.slippageTolerance)
      const maximumAmountIn = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(maximumAmountIn)
      // expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[0].args.length).toEqual(0)
      const actions = decodedCommands[0].actions!

      // CL_SWAP_EXACT_IN_SINGLE
      expect(actions[0].action).toEqual(ACTIONS[ACTIONS.BIN_SWAP_EXACT_OUT_SINGLE])
      expect(actions[0].args[0].name).toEqual('params')
      const swapParams = actions[0].args[0].value as EncodedSingleSwapOutParams

      const poolKey = decodePoolKey(swapParams.poolKey, 'CL')
      expect(poolKey.currency0).toEqual(currencyAddressInfinity(inputAmount.currency))
      expect(poolKey.currency1).toEqual(currencyAddressInfinity(outputAmount.currency))
      expect(swapParams.amountOut).toEqual(outputAmount.quotient)
      expect(swapParams.amountInMaximum).toEqual(maximumAmountIn)

      testInfinitySettleAction(actions[1], ETHER, maximumAmountIn, true)
      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
      testInfinityTakeAction(actions[3], ETHER, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a single exactOutput CAKE-ETH BIN swap OneForZero', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)
      const outputAmount = CurrencyAmount.fromRawAmount(ETHER, 30)
      const trade = buildInfinityTrade(TradeType.EXACT_OUTPUT, inputAmount, outputAmount, [ETH_CAKE_BIN_INFI])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const maximumAmountIn = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(0n)

      const decodedCommands = decodeUniversalCalldata(calldata)
      expect(decodedCommands.length).toEqual(1)
      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      const actions = decodedCommands[0].actions!
      expect(actions.length).toEqual(4)

      // ACTION #0
      const swapParams = actions[0].args[0].value as EncodedSingleSwapOutParams
      expect(swapParams.zeroForOne).toEqual(false)
      expect(swapParams.poolKey.currency0).toEqual(ADDRESS_ZERO)
      expect(swapParams.poolKey.currency1).toEqual(inputAmount.currency.address)
      expect(swapParams.amountOut).toEqual(outputAmount.quotient)
      expect(swapParams.amountInMaximum).toEqual(maximumAmountIn)

      // ACTION #1
      testInfinitySettleAction(actions[1], CAKE, maximumAmountIn, true)
      testInfinityTakeAction(actions[2], ETHER, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
      testInfinityTakeAction(actions[3], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a multi-hop exactInput in Infinity BIN: CAKE->ETH->USDC', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 1000)

      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [
        ETH_CAKE_BIN_INFI,
        ETH_USDC_BIN_INFI,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const minOutAmount = SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(0n)
      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(1)
      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      const actions = decodedCommands[0].actions!
      expect(actions.length).toEqual(3)

      // ACTION #0
      const swapParams = actions[0].args[0].value as EncodedMultiSwapInParams
      expect(swapParams.currencyIn).toEqual(CAKE.address)
      expect(swapParams.amountIn).toEqual(10000n)
      expect(swapParams.amountOutMinimum).toEqual(minOutAmount)

      //  PATH[0]
      const path0 = swapParams.path[0]
      expect(path0.intermediateCurrency).toEqual(ZERO_ADDRESS)

      // PATH[1]
      const path1 = swapParams.path[1]
      expect(path1.intermediateCurrency).toEqual(USDC.address)

      testInfinitySettleAction(actions[1], CAKE, 10000n, true)
      testInfinityTakeAction(actions[2], USDC, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a multi-hop exactOutput in Infinity BIN: USDC->ETH->CAKE', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(USDC, 1000)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)

      const trade = buildInfinityTrade(TradeType.EXACT_OUTPUT, inputAmount, outputAmount, [
        ETH_USDC_BIN_INFI,
        ETH_CAKE_BIN_INFI,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const maxInAmount = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(0n)
      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(1)
      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      const actions = decodedCommands[0].actions!

      // ACTION #0
      const swapParams = actions[0].args[0].value as EncodedMultiSwapOutParams
      expect(swapParams.amountInMaximum).toEqual(maxInAmount)
      expect(swapParams.amountOut).toEqual(10000n)

      //  PATH[0]
      const path0 = swapParams.path[0]
      expect(path0.intermediateCurrency).toEqual(USDC.address)

      // PATH[1]
      const path1 = swapParams.path[1]
      expect(path1.intermediateCurrency).toEqual(ZERO_ADDRESS)

      testInfinitySettleAction(actions[1], USDC, maxInAmount, true)
      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
      testInfinityTakeAction(actions[3], USDC, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })
  })
})
