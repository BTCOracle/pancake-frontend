import { ChainId } from '@pancakeswap/chains'
import { ERC20Token, WETH9 } from '@pancakeswap/sdk'
import { BUSD, USDC, USDT } from './common'

export const monadTestnetTokens = {
  weth: WETH9[ChainId.MONAD_TESTNET],
  busd: BUSD[ChainId.MONAD_TESTNET],
  usdc: USDC[ChainId.MONAD_TESTNET],
  usdt: USDT[ChainId.MONAD_TESTNET],
  wmon: new ERC20Token(
    ChainId.MONAD_TESTNET,
    '0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701',
    18,
    'WMON',
    'Wrapped Monad',
    'https://www.monad.xyz/',
  ),
}
