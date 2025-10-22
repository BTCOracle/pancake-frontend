import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import { CHAIN_IDS } from 'utils/wagmi'
import { BridgeView } from 'views/BridgeView'

const BridgePage = dynamic(() => Promise.resolve(BridgeView), {
  ssr: false,
}) as NextPageWithLayout

BridgePage.chains = CHAIN_IDS
BridgePage.screen = true

export default BridgePage
