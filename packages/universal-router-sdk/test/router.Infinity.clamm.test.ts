import { ChainId } from '@pancakeswap/chains'
import { ACTIONS, decodePoolKey, POOL_TYPE } from '@pancakeswap/infinity-sdk'
import { CurrencyAmount, ERC20Token, Ether, Percent, TradeType, ZERO_ADDRESS } from '@pancakeswap/sdk'
import { InfinityClPool, MSG_SENDER, SmartRouter } from '@pancakeswap/smart-router'
import { ADDRESS_ZERO } from '@pancakeswap/v3-sdk'
import { isHex, parseEther, stringify } from 'viem'
import { beforeEach, describe, expect, it } from 'vitest'
import { PancakeSwapUniversalRouter } from '../src'
import { ACTION_CONSTANTS } from '../src/constants'
import { PancakeSwapOptions } from '../src/entities/types'
import { EncodedMultiSwapInParams, EncodedMultiSwapOutParams, EncodedSingleSwapOutParams } from '../src/infinityTypes'
import { CommandType } from '../src/router.types'
import { decodeUniversalCalldata } from '../src/utils/calldataDecode'
import { currencyAddressInfinity } from '../src/utils/currencyAddressInfinity'
import { fixtureAddresses } from './fixtures/address'
import { buildInfinityTrade } from './utils/buildTrade'
import {
  testInfinitySettleAction,
  testInfinitySingleSwapAction,
  testInfinityTakeAction,
  testPerm2TransferFromCommand,
  testSweepCommand,
  testUnwrapCommand,
  testWrapETHCommand,
} from './utils/commandTestUtils'
import { TEST_RECIPIENT_ADDRESS } from './utils/consts'

const swapOptions = (options: Partial<PancakeSwapOptions>): PancakeSwapOptions => {
  let slippageTolerance = new Percent(5, 100)
  if (options.fee) slippageTolerance = slippageTolerance.add(options.fee.fee)
  return {
    slippageTolerance,
    ...options,
  }
}

describe('PancakeSwap Universal Router Infinity-Cl Pool Command Generation Test', () => {
  const chainId = ChainId.ETHEREUM
  const liquidity = parseEther('1000')

  let ETHER: Ether
  let USDC: ERC20Token
  let CAKE: ERC20Token

  let ETH_CAKE_CL_INFI: InfinityClPool
  let ETH_USDC_CL_INFI: InfinityClPool
  let WETH_USDC_CL_INFI: InfinityClPool
  expect.addSnapshotSerializer({
    serialize(val) {
      return stringify(decodeUniversalCalldata(val), null, 2)
    },
    test(val) {
      return val && isHex(val)
    },
  })

  beforeEach(async () => {
    ;({ ETHER, CAKE, USDC, ETH_CAKE_CL_INFI, ETH_USDC_CL_INFI, WETH_USDC_CL_INFI } = await fixtureAddresses(
      chainId,
      liquidity,
    ))
  })

  describe('Infinity-CL', () => {
    it('should encode a single exactInput ETH-CAKE CL swap zeroForOne', async () => {
      const amountIn = parseEther('0.01')
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER, amountIn)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, parseEther('1'))
      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [ETH_CAKE_CL_INFI])

      const options = swapOptions({})

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()

      expect(BigInt(value)).toEqual(amountIn)
      // expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[0].args.length).toEqual(0)
      const actions = decodedCommands[0].actions!

      // CL_SWAP_EXACT_IN_SINGLE
      expect(actions[0].action).toEqual(ACTIONS[ACTIONS.CL_SWAP_EXACT_IN_SINGLE])
      expect(actions[0].args[0].name).toEqual('params')
      const encoded = actions[0].args[0].value as any
      const poolKey = decodePoolKey(encoded.poolKey, 'CL')
      expect(poolKey.currency0).toEqual(currencyAddressInfinity(inputAmount.currency))
      expect(poolKey.currency1).toEqual(currencyAddressInfinity(outputAmount.currency))

      // SETTLE
      testInfinitySettleAction(actions[1], ETHER, amountIn, true)

      // TAKE
      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a single exactInput ETH-CAKE CL swap zeroForOne ( payerIsUser = false ) ', async () => {
      const amountIn = parseEther('0.01')
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER, amountIn)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, parseEther('1'))
      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [ETH_CAKE_CL_INFI])

      const options = swapOptions({
        payerIsUser: false,
      })

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()

      expect(BigInt(value)).toEqual(0n)
      // expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[0].args.length).toEqual(0)
      const actions = decodedCommands[0].actions!

      // SETTLE
      testInfinitySettleAction(actions[0], ETHER, amountIn, false)

      // CL_SWAP_EXACT_IN_SINGLE
      expect(actions[1].action).toEqual(ACTIONS[ACTIONS.CL_SWAP_EXACT_IN_SINGLE])
      expect(actions[1].args[0].name).toEqual('params')
      const encoded = actions[1].args[0].value as any
      const poolKey = decodePoolKey(encoded.poolKey, 'CL')
      expect(poolKey.currency0).toEqual(currencyAddressInfinity(inputAmount.currency))
      expect(poolKey.currency1).toEqual(currencyAddressInfinity(outputAmount.currency))

      // TAKE
      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a single exactInput CAKE->ETH CL swap oneForZero', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000n)
      const outputAmount = CurrencyAmount.fromRawAmount(ETHER, 50n)
      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [ETH_CAKE_CL_INFI])

      const options = swapOptions({})

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()

      expect(BigInt(value)).toEqual(0n)
      // expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[0].args.length).toEqual(0)
      const actions = decodedCommands[0].actions!

      // CL_SWAP_EXACT_IN_SINGLE
      expect(actions[0].action).toEqual(ACTIONS[ACTIONS.CL_SWAP_EXACT_IN_SINGLE])
      expect(actions[0].args[0].name).toEqual('params')
      const encoded = actions[0].args[0].value as any
      const poolKey = decodePoolKey(encoded.poolKey, 'CL')
      expect(poolKey.currency1).toEqual(currencyAddressInfinity(inputAmount.currency))
      expect(poolKey.currency0).toEqual(currencyAddressInfinity(outputAmount.currency))

      testInfinitySettleAction(actions[1], CAKE, 10000n, true)

      testInfinityTakeAction(actions[2], ETHER, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a single exactInput edge case for wrap-out CAKE->WETH CL swap oneForZero', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000n)
      const outputAmount = CurrencyAmount.fromRawAmount(ETHER.wrapped, 50n)
      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [ETH_CAKE_CL_INFI])

      const options = swapOptions({})

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const minOut = SmartRouter.minimumAmountOut(trade, options.slippageTolerance)

      expect(BigInt(value)).toEqual(0n)
      // expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[0].args.length).toEqual(0)
      const actions = decodedCommands[0].actions!

      // CMD#0: InfinitySwap
      // #Action 0: SWAP
      testInfinitySingleSwapAction(
        POOL_TYPE.CLAMM,
        actions[0],
        ETHER,
        CAKE,
        10000n,
        SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient,
        false,
      )

      testInfinitySettleAction(actions[1], CAKE, 10000n, true)
      testInfinityTakeAction(actions[2], ETHER, ACTION_CONSTANTS.ADDRESS_THIS, ACTION_CONSTANTS.OPEN_DELTA)

      // CMD#1: WRAP
      testWrapETHCommand(decodedCommands[1], ACTION_CONSTANTS.ADDRESS_THIS, BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE))

      // CMD#2: SWEEP
      testSweepCommand(decodedCommands[2], ETHER.wrapped.address, ACTION_CONSTANTS.MSG_SENDER, minOut.quotient)
    })

    it('should encode a single exactOutput ETH_CAKE CL swap zeroForOne', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER, 50)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)
      const trade = buildInfinityTrade(TradeType.EXACT_OUTPUT, inputAmount, outputAmount, [ETH_CAKE_CL_INFI])

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
      expect(actions[0].action).toEqual(ACTIONS[ACTIONS.CL_SWAP_EXACT_OUT_SINGLE])
      expect(actions[0].args[0].name).toEqual('params')
      const swapParams = actions[0].args[0].value as EncodedSingleSwapOutParams

      const poolKey = decodePoolKey(swapParams.poolKey, 'CL')
      expect(poolKey.currency0).toEqual(currencyAddressInfinity(inputAmount.currency))
      expect(poolKey.currency1).toEqual(currencyAddressInfinity(outputAmount.currency))
      expect(swapParams.amountOut).toEqual(outputAmount.quotient)
      expect(swapParams.amountInMaximum).toEqual(maximumAmountIn)

      // SETTLE_ALL
      testInfinitySettleAction(actions[1], ETHER, maximumAmountIn, true)
      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
      testInfinityTakeAction(actions[3], ETHER, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a single exactOutput CAKE-ETH CL swap OneForZero', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)
      const outputAmount = CurrencyAmount.fromRawAmount(ETHER, 30)
      const trade = buildInfinityTrade(TradeType.EXACT_OUTPUT, inputAmount, outputAmount, [ETH_CAKE_CL_INFI])

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

      testInfinitySettleAction(actions[1], CAKE, maximumAmountIn, true)
      testInfinityTakeAction(actions[2], ETHER, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
      testInfinityTakeAction(actions[3], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a multi-hop exactInput in Infinity: CAKE->ETH->USDC', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 1000)

      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [
        ETH_CAKE_CL_INFI,
        ETH_USDC_CL_INFI,
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
      expect(actions[0].action).toEqual(ACTIONS[ACTIONS.CL_SWAP_EXACT_IN])

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

      // ACTION #1 SETTLE ALL
      testInfinitySettleAction(actions[1], CAKE, 10000n, true)
      testInfinityTakeAction(actions[2], USDC, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a multi-hop exactOutput in Infinity: USDC->ETH->CAKE', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(USDC, 1000)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)

      const trade = buildInfinityTrade(TradeType.EXACT_OUTPUT, inputAmount, outputAmount, [
        ETH_USDC_CL_INFI,
        ETH_CAKE_CL_INFI,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
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
      // ACTION #1 SETTLE
      testInfinitySettleAction(actions[1], USDC, maxInAmount, true)

      // ACTION #2 TAKE ALL
      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should encode a multi-hop exactInput in Infinity: USDC->WETH->CAKE(via ETH->CAKE Pool)', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(USDC, 1000)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, 10000)

      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [
        WETH_USDC_CL_INFI,
        ETH_CAKE_CL_INFI,
      ])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      const maxInAmount = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient
      const minOutAmount = SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(0n)
      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(3) // INFI_SWAP - UNWRAP - INFI_SWAP

      // ACTION #0
      const cmd0 = decodedCommands[0]
      expect(cmd0.command).toEqual(CommandType[CommandType.INFI_SWAP])
      const swapParams1 = cmd0.actions![0].args[0].value as EncodedMultiSwapInParams
      expect(swapParams1.amountIn).toEqual(maxInAmount)
      expect(swapParams1.amountOutMinimum).toEqual(0n)

      // ACTION #1
      const cmd1 = decodedCommands[1]
      expect(cmd1.command).toEqual(CommandType[CommandType.UNWRAP_WETH])

      // Action #2
      const cmd2 = decodedCommands[2]
      expect(cmd2.command).toEqual(CommandType[CommandType.INFI_SWAP])
      const swapParams2 = cmd2.actions![1].args[0].value as EncodedMultiSwapInParams
      expect(swapParams2.amountOutMinimum).toEqual(minOutAmount)
    })

    it('should encode a edge-case single exactInput WBNB->CAKE via tBNB-CAKE-InfinityCL pool', async () => {
      const amountIn = parseEther('0.01')
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER.wrapped, amountIn)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, parseEther('1'))
      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [ETH_CAKE_CL_INFI])

      const options = swapOptions({})

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const maxIn = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient
      const minOut = SmartRouter.minimumAmountOut(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(0n)

      const decodedCommands = decodeUniversalCalldata(calldata)

      testPerm2TransferFromCommand(decodedCommands[0], ETHER.wrapped, ACTION_CONSTANTS.ADDRESS_THIS, maxIn)
      testUnwrapCommand(decodedCommands[1], ACTION_CONSTANTS.ADDRESS_THIS, maxIn)
      const actions = decodedCommands[2].actions!
      expect(actions.length).toEqual(3)
      testInfinitySettleAction(actions[0], ETHER, maxIn, false)
      testInfinitySingleSwapAction(POOL_TYPE.CLAMM, actions[1], ETHER, CAKE, maxIn, minOut, true)
      testInfinityTakeAction(actions[2], CAKE, MSG_SENDER, ACTION_CONSTANTS.OPEN_DELTA)
    })

    it('should wrap return changes for exactOutput WETH->USDC swap', async () => {
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER.wrapped, 50n)
      const outputAmount = CurrencyAmount.fromRawAmount(USDC, 1000n)
      const trade = buildInfinityTrade(TradeType.EXACT_OUTPUT, inputAmount, outputAmount, [ETH_USDC_CL_INFI])

      const options = swapOptions({})
      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const maxIn = SmartRouter.maximumAmountIn(trade, options.slippageTolerance).quotient

      expect(BigInt(value)).toEqual(0n)

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands.length).toEqual(4)

      testPerm2TransferFromCommand(decodedCommands[0], ETHER.wrapped, ACTION_CONSTANTS.ADDRESS_THIS, maxIn)
      testUnwrapCommand(decodedCommands[1], ACTION_CONSTANTS.ADDRESS_THIS, maxIn)
      expect(decodedCommands[2].command).toEqual(CommandType[CommandType.INFI_SWAP])
      testWrapETHCommand(decodedCommands[3], MSG_SENDER, BigInt(ACTION_CONSTANTS.CONTRACT_BALANCE))
    })
  })

  describe('Infinity-CL-advanced', () => {
    it('should encode a single exactInput ETH-CAKE CL swap zeroForOne with custom recipient', async () => {
      const amountIn = parseEther('0.01')
      const inputAmount = CurrencyAmount.fromRawAmount(ETHER, amountIn)
      const outputAmount = CurrencyAmount.fromRawAmount(CAKE, parseEther('1'))
      const trade = buildInfinityTrade(TradeType.EXACT_INPUT, inputAmount, outputAmount, [ETH_CAKE_CL_INFI])

      const options = swapOptions({
        recipient: TEST_RECIPIENT_ADDRESS,
      })

      const { calldata, value } = PancakeSwapUniversalRouter.swapERC20CallParameters(trade, options)
      expect(calldata).toMatchSnapshot()
      const minOut = SmartRouter.minimumAmountOut(trade, options.slippageTolerance)

      expect(BigInt(value)).toEqual(amountIn)
      // expect(calldata).toMatchSnapshot()

      const decodedCommands = decodeUniversalCalldata(calldata)

      expect(decodedCommands[0].command).toEqual(CommandType[CommandType.INFI_SWAP])
      expect(decodedCommands[0].args.length).toEqual(0)
      const actions = decodedCommands[0].actions!

      // CL_SWAP_EXACT_IN_SINGLE
      expect(actions[0].action).toEqual(ACTIONS[ACTIONS.CL_SWAP_EXACT_IN_SINGLE])
      expect(actions[0].args[0].name).toEqual('params')
      const encoded = actions[0].args[0].value as any
      const poolKey = decodePoolKey(encoded.poolKey, 'CL')
      expect(poolKey.currency0).toEqual(currencyAddressInfinity(inputAmount.currency))
      expect(poolKey.currency1).toEqual(currencyAddressInfinity(outputAmount.currency))

      // SETTLE
      testInfinitySettleAction(actions[1], ETHER, amountIn, true)

      // TAKE
      testInfinityTakeAction(actions[2], CAKE, TEST_RECIPIENT_ADDRESS, ACTION_CONSTANTS.OPEN_DELTA)
    })
  })
})
