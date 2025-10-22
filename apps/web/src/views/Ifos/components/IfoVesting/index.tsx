import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, CardHeader, Flex, IfoNotTokens, Image, Text } from '@pancakeswap/uikit'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'

import Trans from 'components/Trans'

import { PoolIds } from '@pancakeswap/ifos'
import { getHasClaimable } from 'views/Ifos/hooks/getVestingInfo'
import useFetchVestingData from '../../hooks/vesting/useFetchVestingData'
import { VestingStatus } from './types'
import VestingEnded from './VestingEnded'
import TokenInfo from './VestingPeriod/TokenInfo'

const StyleVestingCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  margin: 24px 0 0 0;
  align-self: baseline;
  ${({ theme }) => theme.mediaQueries.xl} {
    max-width: 350px;
    margin: 0 12px 0 12px;
  }
`

const VestingCardBody = styled(CardBody)`
  position: relative;
  z-index: 2;
  overflow-y: auto;
  max-height: 640px;
  padding-bottom: 0;
  border-radius: 0 0 24px 24px;
`

const TokenInfoContainer = styled.div`
  > div {
    margin-bottom: 20px;
  }

  > :last-child {
    margin-bottom: 0px;
  }
`

const IfoVestingStatus = {
  [VestingStatus.NOT_TOKENS_CLAIM]: {
    status: VestingStatus.NOT_TOKENS_CLAIM,
    text: <Trans>You have no tokens available for claiming</Trans>,
    imgUrl: '/images/ifos/vesting/not-tokens.svg',
  },
  [VestingStatus.HAS_TOKENS_CLAIM]: {
    status: VestingStatus.HAS_TOKENS_CLAIM,
    text: <Trans>You have tokens available for claiming now!</Trans>,
    imgUrl: '/images/ifos/vesting/in-vesting-period.svg',
  },
  [VestingStatus.ENDED]: {
    status: VestingStatus.ENDED,
    text: <Trans>No vesting token to claim.</Trans>,
    imgUrl: '/images/ifos/vesting/in-vesting-end.svg',
  },
}

interface IfoVestingProps {
  ifoBasicSaleType?: number
}

const IfoVesting: React.FC<React.PropsWithChildren<IfoVestingProps>> = ({ ifoBasicSaleType }: IfoVestingProps) => {
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const [isFirstTime, setIsFirstTime] = useState(true)
  const { data, fetchUserVestingData } = useFetchVestingData()

  useEffect(() => {
    if (account) {
      setIsFirstTime(true)
      fetchUserVestingData()
    }
  }, [account, fetchUserVestingData, setIsFirstTime])

  const hasClaimable = getHasClaimable([PoolIds.poolBasic, PoolIds.poolUnlimited], data)

  const cardStatus = useMemo(() => {
    if (account) {
      if (hasClaimable) {
        return IfoVestingStatus[VestingStatus.HAS_TOKENS_CLAIM]
      }
      if (!hasClaimable && !isFirstTime) return IfoVestingStatus[VestingStatus.ENDED]
    }
    return IfoVestingStatus[VestingStatus.NOT_TOKENS_CLAIM]
  }, [data, account, isFirstTime, hasClaimable])

  const handleFetchUserVesting = useCallback(() => {
    setIsFirstTime(false)
    fetchUserVestingData()
  }, [fetchUserVestingData])

  return (
    <StyleVestingCard isActive>
      <CardHeader p="16px">
        <Flex justifyContent="space-between" alignItems="center">
          <Box ml="8px">
            <Text fontSize="24px" color="secondary" bold>
              {t('Token Vesting')}
            </Text>
            <Text color="textSubtle" fontSize="14px">
              {cardStatus.text}
            </Text>
          </Box>
          <Image
            ml="8px"
            width={64}
            height={64}
            alt="ifo-vesting-status"
            style={{ minWidth: '64px' }}
            src={cardStatus.imgUrl}
          />
        </Flex>
      </CardHeader>
      <VestingCardBody>
        {cardStatus.status === VestingStatus.NOT_TOKENS_CLAIM && (
          <IfoNotTokens
            participateText={t(
              'Participate in our next IFO. and remember to lock your CAKE to increase your allocation!',
            )}
          />
        )}
        {cardStatus.status === VestingStatus.HAS_TOKENS_CLAIM && (
          <TokenInfoContainer>
            {data && (
              <TokenInfo
                key={data.ifo.id}
                index={0}
                data={data}
                fetchUserVestingData={handleFetchUserVesting}
                ifoBasicSaleType={ifoBasicSaleType}
              />
            )}
          </TokenInfoContainer>
        )}
        {cardStatus.status === VestingStatus.ENDED && <VestingEnded />}
      </VestingCardBody>
    </StyleVestingCard>
  )
}

export default IfoVesting
