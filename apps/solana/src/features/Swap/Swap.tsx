import { AtomBox, FlexGap } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { VStack, useClipboard } from '@chakra-ui/react'
import { RAYMint, SOLMint } from '@pancakeswap/solana-core-sdk'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'

import { SlippageAdjuster } from '@/components/SlippageAdjuster'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import useResponsive from '@/hooks/useResponsive'
import { useAppStore, useTokenStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { getMintPriority } from '@/utils/token'
import { getVHExpression } from '../../theme/cssValue/getViewportExpression'
import { SwapPanel } from './components/SwapPanel'
import { getSwapPairCache, setSwapPairCache } from './util'

const SwapPage = styled(AtomBox)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
  padding-bottom: 0;
  background: ${colors.gradientBubblegum};
  background-size: auto;
`

export default function Swap() {
  // const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
  const [inputMint, setInputMint] = useState<string>(PublicKey.default.toBase58())
  const [outputMint, setOutputMint] = useState<string>(RAYMint.toBase58())
  const [isPCChartShown, setIsPCChartShown] = useState<boolean>(true)
  const [isMobileChartShown, setIsMobileChartShown] = useState<boolean>(false)
  const [isChartLeft, setIsChartLeft] = useState<boolean>(true)
  const { isMobile } = useResponsive()
  const publicKey = useAppStore((s) => s.publicKey)
  const connected = useAppStore((s) => s.connected)
  const [directionReverse, setDirectionReverse] = useState<boolean>(false)
  const [selectedTimeType, setSelectedTimeType] = useState<TimeType>('15m')
  const [cacheLoaded, setCacheLoaded] = useState(false)
  const untilDate = useRef(Math.floor(Date.now() / 1000))
  const swapPanelRef = useRef<HTMLDivElement>(null)
  const klineRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const { onCopy, setValue } = useClipboard('')
  const [isBlinkReferralActive, setIsBlinkReferralActive] = useState(false)
  const solMintAddress = SOLMint.toBase58()

  const baseMint = directionReverse ? outputMint : inputMint
  const quoteMint = directionReverse ? inputMint : outputMint
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const baseToken = useMemo(() => tokenMap.get(baseMint), [tokenMap, baseMint])
  const quoteToken = useMemo(() => tokenMap.get(quoteMint), [tokenMap, quoteMint])
  const [isDirectionNeedReverse, setIsDirectionNeedReverse] = useState<boolean>(false)

  useEffect(() => {
    const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
    if (cacheInput) setInputMint(cacheInput)
    if (cacheOutput && cacheOutput !== cacheInput) setOutputMint(cacheOutput)
    setCacheLoaded(true)
  }, [])
  useEffect(() => {
    // preserve swap chart default direction on page refresh by mint priority
    if (cacheLoaded) {
      if (getMintPriority(baseMint) > getMintPriority(quoteMint)) {
        setDirectionReverse(true)
      }
    }
  }, [cacheLoaded])
  // reset directionReverse when inputMint or outputMint changed
  useIsomorphicLayoutEffect(() => {
    if (!cacheLoaded) return
    if (isDirectionNeedReverse) {
      setDirectionReverse(true)
      setIsDirectionNeedReverse(false)
    } else {
      setDirectionReverse(false)
    }

    setSwapPairCache({
      inputMint,
      outputMint
    })
  }, [inputMint, outputMint, cacheLoaded])

  useIsomorphicLayoutEffect(() => {
    if (klineRef.current) {
      const swapPanelHeight = swapPanelRef.current?.getBoundingClientRect().height
      const height = Number(swapPanelHeight) > 500 ? `${swapPanelHeight}px` : '522px'
      klineRef.current.style.height = height
    }
  }, [])

  useEffect(() => {
    // inputMint === solMintAddress || outputMint === solMintAddress ? setIsBlinkReferralActive(true) : setIsBlinkReferralActive(false)
    setIsBlinkReferralActive(true)
    const def = PublicKey.default.toString()
    const _inputMint = inputMint === def ? 'sol' : inputMint
    const _outputMint = outputMint === def ? 'sol' : outputMint
    const href = `https://raydium.io/swap/?inputMint=${_inputMint}&outputMint=${_outputMint}`
    const walletAddress = publicKey?.toBase58()
    const copyUrl = connected ? `${href}&referrer=${walletAddress}` : href
    setValue(copyUrl)
  }, [inputMint, outputMint, connected, publicKey])

  return (
    <SwapPage>
      <VStack
        mx={['unset', 'auto']}
        mt={[0, getVHExpression([0, 800], [32, 1300])]}
        width={!isMobile && isPCChartShown ? 'min(100%, 1300px)' : undefined}
        height="100%"
        overflow="auto"
      >
        <FlexGap
          gap="16px"
          height="100%"
          width="full"
          alignItems="flex-start"
          flexDirection="column"
          justifyContent={['flex-start', null, null, 'center']}
          mt={[0, null, null, '-50px']}
        >
          <FlexGap justifyContent="flex-end" width="100%" alignItems="center" gap="10px">
            <SlippageAdjuster />
          </FlexGap>
          <AtomBox ref={swapPanelRef}>
            <SwapPanel
              onInputMintChange={setInputMint}
              onOutputMintChange={setOutputMint}
              onDirectionNeedReverse={() => setIsDirectionNeedReverse((b) => !b)}
            />
          </AtomBox>
        </FlexGap>
      </VStack>
    </SwapPage>
  )
}
