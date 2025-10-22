import { Box, Flex, Grid, GridItem, HStack, Link, Text, useDisclosure } from '@chakra-ui/react'
import { ApiClmmConfigInfo, ApiV3Token, solToWSol } from '@pancakeswap/solana-core-sdk'
import { useCallback, useRef, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { shallow } from 'zustand/shallow'
import BN from 'bn.js'
import Decimal from 'decimal.js'

import { useEvent } from '@/hooks/useEvent'
import PanelCard from '@/components/PanelCard'
import { StepsRef } from '@/components/Steps'
import SubPageNote from '@/components/SubPageNote'
import PreviewDepositModal from '@/features/Clmm/components/PreviewDepositModal'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { CreatePoolBuildData, useAppStore, useClmmStore } from '@/store'
import { colors } from '@/theme/cssVariables/colors'
import { genCSS2GridTemplateColumns, genCSS3GridTemplateColumns } from '@/theme/detailConfig'
import { debounce, exhaustCall } from '@/utils/functionMethods'
import { routeBack } from '@/utils/routeTools'
import { solToWSolToken } from '@/utils/token'
import useBirdeyeTokenPrice from '@/hooks/token/useBirdeyeTokenPrice'
import {
  logGTMCreatelpCmfDepEvent,
  logGTMCreatelpSuccessEvent,
  logGTMSolErrorLogEvent,
  logGTMV3lpStepEvent
} from '@/utils/report/curstomGTMEventTracking'

import SelectPoolTokenAndFee from './components/SelectPoolTokenAndFee'
import SetPriceAndRange from './components/SetPriceAndRange'
import Stepper from './components/Stepper'
import TokenAmountPairInputs from './components/TokenAmountInput'
import CreateSuccessModal from './components/CreateSuccessModal'
import CreateSuccessWithLockModal from './components/CreateSuccessWithLockModal'

export default function CreateClmmPool() {
  const isMobile = useAppStore((s) => s.isMobile)
  const wallet = useAppStore((s) => s.wallet)
  const { t } = useTranslation()
  const [createClmmPool, openPositionAct] = useClmmStore((s) => [s.createClmmPool, s.openPositionAct], shallow)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const { isOpen: isSuccessModalOpen, onOpen: onOpenSuccessModal, onClose: onCloseSuccessModal } = useDisclosure()
  const [step, setStep] = useState(0)
  const [baseIn, setBaseIn] = useState(true)
  const [createPoolData, setCreatePoolData] = useState<CreatePoolBuildData | undefined>()
  const [isTxSending, setIsTxSending] = useState(false)
  const debounceSetBuildData = debounce((data: CreatePoolBuildData) => setCreatePoolData(data), 150)

  const { data: tokenPrices, isLoading: isPriceLoading } = useBirdeyeTokenPrice({
    mintList: [createPoolData?.extInfo.mockPoolInfo.mintA.address, createPoolData?.extInfo.mockPoolInfo.mintB.address]
  })

  const currentCreateInfo = useRef<{
    token1?: ApiV3Token
    token2?: ApiV3Token
    config?: ApiClmmConfigInfo
    price: string
    tickLower?: number
    tickUpper?: number
    priceLower?: string
    priceUpper?: string
    amount1?: string
    amount2?: string
    liquidity?: BN
    inputA: boolean
    isFullRange?: boolean
  }>({
    inputA: true,
    price: ''
  })

  const stepsRef = useRef<StepsRef>(null)

  const handleEdit = useCallback((step_: number) => {
    stepsRef.current?.setActiveStep(step_)
  }, [])

  const handleStep1Confirm = useCallback(
    ({ token1, token2, ammConfig }: { token1: ApiV3Token; token2: ApiV3Token; ammConfig: ApiClmmConfigInfo }) => {
      logGTMV3lpStepEvent('1')
      onLoading()
      currentCreateInfo.current.token1 = solToWSolToken(token1)
      currentCreateInfo.current.token2 = solToWSolToken(token2)
      currentCreateInfo.current.config = ammConfig
      createClmmPool({
        config: ammConfig,
        token1: solToWSolToken(token1),
        token2: solToWSolToken(token2),
        price: '1',
        forerunCreate: true
      })
        .then(({ buildData }) => {
          if (!buildData) return
          setBaseIn(solToWSol(token1.address).equals(solToWSol(buildData?.extInfo.mockPoolInfo?.mintA.address || '')))
          setCreatePoolData(buildData)
          stepsRef.current?.goToNext()
        })
        .finally(offLoading)
    },
    [createClmmPool, offLoading, onLoading]
  )

  const handlePriceChange = useCallback(
    ({ price }: { price: string }) => {
      const { token1, token2, config } = currentCreateInfo.current
      if (!token1 || !token2 || !config) return
      createClmmPool({ config, token1, token2, price: price && new Decimal(price).gt(0) ? price : '1', forerunCreate: true }).then(
        ({ buildData }) => {
          debounceSetBuildData(buildData)
        }
      )
    },
    [createClmmPool, debounceSetBuildData]
  )

  const handleStep2Confirm = useEvent(
    (props: { price: string; tickLower: number; tickUpper: number; priceLower: string; priceUpper: string; isFullRange?: boolean }) => {
      logGTMV3lpStepEvent('2')
      stepsRef.current?.goToNext()
      currentCreateInfo.current = {
        ...currentCreateInfo.current,
        ...props
      }
    }
  )

  const handleStep3Confirm = useCallback(
    ({ inputA, liquidity, amount1, amount2 }: { inputA: boolean; liquidity: BN; amount1: string; amount2: string }) => {
      logGTMV3lpStepEvent('3')
      currentCreateInfo.current.inputA = inputA
      currentCreateInfo.current.liquidity = liquidity
      currentCreateInfo.current.amount1 = amount1
      currentCreateInfo.current.amount2 = amount2
      onOpen()
    },
    [onOpen]
  )

  const handleSwitchBase = useCallback(
    (baseIn_: boolean) => {
      const [token1, token2] = [currentCreateInfo.current.token1, currentCreateInfo.current.token2]
      currentCreateInfo.current.token1 = token2
      currentCreateInfo.current.token2 = token1
      setBaseIn(baseIn_)
    },
    [setBaseIn]
  )

  const handleChangeStep = useCallback((newStep: number) => {
    setStep(newStep)
  }, [])

  const handleCreateAndOpen = useEvent(
    exhaustCall(async () => {
      logGTMCreatelpCmfDepEvent('V3', true)
      setIsTxSending(true)
      const { token1, token2, config, price } = currentCreateInfo.current
      const { buildData } = await createClmmPool({
        config: config!,
        token1: token1!,
        token2: token2!,
        price,
        forerunCreate: true
      })

      if (!buildData) return

      const [mintAAmount, mintBAmount] = [
        new Decimal(currentCreateInfo.current.amount1!).mul(10 ** buildData.extInfo.mockPoolInfo.mintA.decimals).toFixed(0),
        new Decimal(currentCreateInfo.current.amount2!).mul(10 ** buildData.extInfo.mockPoolInfo.mintB.decimals).toFixed(0)
      ]

      openPositionAct({
        t,
        poolInfo: buildData.extInfo.mockPoolInfo,
        poolKeys: buildData.extInfo.address,
        tickLower: Math.min(currentCreateInfo.current.tickLower!, currentCreateInfo.current.tickUpper!),
        tickUpper: Math.max(currentCreateInfo.current.tickLower!, currentCreateInfo.current.tickUpper!),
        base: currentCreateInfo.current.inputA ? 'MintA' : 'MintB',
        baseAmount: currentCreateInfo.current.inputA ? mintAAmount : mintBAmount,
        otherAmountMax: currentCreateInfo.current.inputA ? mintBAmount : mintAAmount,
        createPoolBuildData: buildData,
        onSent: () => {
          logGTMCreatelpSuccessEvent({
            walletAddress: wallet?.adapter.publicKey?.toString() ?? '',
            version: 'V3',
            isCreate: true,
            token0: token1?.address ?? '',
            token1: token2?.address ?? '',
            token0Amt: mintAAmount,
            token1Amt: mintBAmount,
            feeTier: `${(config?.tradeFeeRate ?? 0) / 1000}%`
          })
        },
        onConfirmed: () => {
          onOpenSuccessModal()
        },
        onFinally: () => setIsTxSending(false),
        onError(e) {
          logGTMSolErrorLogEvent({
            action: 'Create Liquidity Pool Fail',
            e
          })
        }
      })
    })
  )
  const friendlySentence = [
    t('First, select tokens & fee tier'),
    t('Next, set initial token price & position price range'),
    t('Last, please enter token deposit amount')
  ][step]

  const needToShowSelectPoolToken = isMobile ? step === 0 : step >= 0
  const needToShowSetPriceAndRange = isMobile ? step === 1 : step >= 1
  const needToShowTokenAmountInput = isMobile ? step === 2 : step >= 2

  return (
    <>
      <Grid
        gridTemplate={[
          `
            "back  " auto
            "step  " auto
            "panel " auto
            "note  " minmax(80px, 1fr) / 1fr  
          `,
          `
            "back word  " auto
            "step panel " auto
            "note panel " 1fr / ${genCSS2GridTemplateColumns({ rightLeft: 344, center: 500 })}
          `,
          `
            "back word  " auto
            "step panel " auto
            "note panel " 1fr / ${genCSS2GridTemplateColumns({ rightLeft: 344, center: 500 })}
          `,
          `
            "back word  . " auto
            "step panel . " auto
            "note panel . " 1fr / ${genCSS3GridTemplateColumns({ rightLeft: 344, center: 500 })}
          `
        ]}
        columnGap={[4, '5%']}
        rowGap={[4, '2vh']}
        mt={[2, 8]}
      >
        {/* left */}
        <GridItem area="back">
          <Flex>
            <HStack cursor="pointer" onClick={routeBack} color={colors.textTertiary} fontWeight="500" fontSize={['md', 'xl']}>
              <ChevronLeftIcon />
              <Text color={colors.primary60}>{t('Back')}</Text>
            </HStack>
          </Flex>
        </GridItem>

        <GridItem area="step">
          <Stepper stepRef={stepsRef} onChange={handleChangeStep} />
        </GridItem>

        <GridItem area="note">
          <Box w={['unset', 'clamp(300px, 100%, 500px)']}>
            <SubPageNote
              title={t('Please Note')}
              description={
                <Text>
                  {t('This tool is for advanced users. For detailed instructions, read the guide for')}
                  <Link isExternal color={colors.primary60} href="https://docs.pancakeswap.finance/earn/pancakeswap-pools">
                    {' '}
                    {t('CLMM pools')}
                  </Link>
                </Text>
              }
            />
          </Box>
        </GridItem>

        <GridItem area="word" display={['none', 'unset']}>
          <Text whiteSpace="pre-line" w="fit-content" cursor="pointer" color={colors.textSecondary} fontWeight="600" fontSize="xl">
            {friendlySentence}
          </Text>
        </GridItem>

        <GridItem area="panel">
          <Flex flexDirection="column" gap={3}>
            <SelectPoolTokenAndFee
              isLoading={isLoading}
              show={needToShowSelectPoolToken}
              initState={currentCreateInfo.current}
              completed={step > 0}
              onConfirm={handleStep1Confirm}
              onEdit={handleEdit}
            />
            {needToShowSetPriceAndRange ? (
              <SetPriceAndRange
                initState={{
                  currentPrice: createPoolData?.extInfo.mockPoolInfo.price.toString() || currentCreateInfo.current.price,
                  priceRange: [currentCreateInfo.current.priceLower || '', currentCreateInfo.current.priceUpper || '']
                }}
                completed={step > 1}
                token1={currentCreateInfo.current.token1!}
                token2={currentCreateInfo.current.token2!}
                tokenPrices={tokenPrices || {}}
                isPriceLoading={isPriceLoading}
                tempCreatedPool={createPoolData?.extInfo.mockPoolInfo}
                baseIn={baseIn}
                onPriceChange={handlePriceChange}
                onSwitchBase={handleSwitchBase}
                onConfirm={handleStep2Confirm}
                onEdit={handleEdit}
              />
            ) : null}

            {needToShowTokenAmountInput ? (
              <PanelCard px={[3, 6]} py={[3, 4]} fontSize="sm" fontWeight="500" color={colors.textSubtle}>
                <TokenAmountPairInputs
                  baseIn={baseIn}
                  tempCreatedPool={createPoolData!.extInfo.mockPoolInfo}
                  tokenPrices={tokenPrices || {}}
                  priceLower={currentCreateInfo.current.priceLower!}
                  priceUpper={currentCreateInfo.current.priceUpper!}
                  tickLower={currentCreateInfo.current.tickLower!}
                  tickUpper={currentCreateInfo.current.tickUpper!}
                  onConfirm={handleStep3Confirm}
                />
              </PanelCard>
            ) : null}
          </Flex>
        </GridItem>
      </Grid>
      {createPoolData && isOpen ? (
        <PreviewDepositModal
          tokenPrices={tokenPrices || {}}
          isOpen={isOpen}
          isSending={isTxSending}
          isFullRange={currentCreateInfo.current.isFullRange}
          isCreatePool
          pool={createPoolData.extInfo.mockPoolInfo}
          baseIn={baseIn}
          onConfirm={handleCreateAndOpen}
          onClose={onClose}
          tokenAmount={[currentCreateInfo.current.amount1 || '0', currentCreateInfo.current.amount2 || '1']}
          priceRange={[currentCreateInfo.current.priceLower || '2', currentCreateInfo.current.priceUpper || '3']}
        />
      ) : null}
      {currentCreateInfo.current.isFullRange ? (
        <CreateSuccessWithLockModal isOpen={isSuccessModalOpen} onClose={onCloseSuccessModal} />
      ) : (
        <CreateSuccessModal isOpen={isSuccessModalOpen} onClose={onCloseSuccessModal} />
      )}
    </>
  )
}
