import { PoolIds } from '@pancakeswap/ifos'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, Progress, Tag, Text } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import { useCurrentBlock } from 'state/block/hooks'
import { styled } from 'styled-components'
import useGetPublicIfoV3Data from 'views/Ifos/hooks/v3/useGetPublicIfoData'
import { VestingData } from 'views/Ifos/hooks/vesting/fetchUserWalletIfoData'

import { useQuery } from '@tanstack/react-query'
import { getVestingInfo } from 'views/Ifos/hooks/getVestingInfo'
import { isBasicSale } from '../../../hooks/v7/helpers'
import Claim from './Claim'

const WhiteCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  padding: 12px;
  border-radius: 12px;
  margin: 8px 0 20px 0;
`

const StyleTag = styled(Tag)<{ isPrivate: boolean }>`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme, isPrivate }) => (isPrivate ? theme.colors.gradientBlue : theme.colors.gradientViolet)};
`

interface InfoProps {
  poolId: PoolIds
  data: VestingData
  fetchUserVestingData: () => void
  ifoBasicSaleType?: number
}

const Info: React.FC<React.PropsWithChildren<InfoProps>> = ({
  poolId,
  data,
  fetchUserVestingData,
  ifoBasicSaleType,
}) => {
  const { t } = useTranslation()
  const { vestingStartTime } = data.userVestingData
  const { vestingInformationDuration } = data.userVestingData[poolId]
  const { isVestingInitialized, isVestingOver, received, claimable, remaining, percentage } = getVestingInfo(
    poolId,
    data,
  )

  const labelText =
    poolId === PoolIds.poolUnlimited
      ? t('Public IFO')
      : isBasicSale(ifoBasicSaleType)
      ? t('Basic IFO')
      : t('Private IFO')

  const currentBlock = useCurrentBlock()
  const publicIfoData = useGetPublicIfoV3Data(data.ifo)
  const { fetchIfoData: fetchPublicIfoData, isInitialized: isPublicIfoDataInitialized } = publicIfoData
  useQuery({
    queryKey: ['fetchPublicIfoData', currentBlock, data?.ifo?.id],
    queryFn: async () => fetchPublicIfoData(currentBlock),
    enabled: Boolean(!isPublicIfoDataInitialized && currentBlock),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const { cliff } = publicIfoData[poolId]?.vestingInformation || {}
  const currentTimeStamp = Date.now()
  const timeCliff = vestingStartTime === 0 ? currentTimeStamp : (vestingStartTime + (cliff ?? 0)) * 1000
  const timeVestingEnd = (vestingStartTime + vestingInformationDuration) * 1000

  if (claimable === '0' && remaining === '0') {
    return null
  }

  return (
    <>
      <Flex justifyContent="space-between">
        <Text style={{ alignSelf: 'center' }} fontSize="12px" bold color="secondary" textTransform="uppercase">
          {t('Vesting Schedule')}
        </Text>
        <StyleTag isPrivate={poolId === PoolIds.poolBasic}>{labelText}</StyleTag>
      </Flex>
      <Flex justifyContent="space-between" mt="8px">
        <Text style={{ alignSelf: 'center' }} fontSize="12px" bold color="secondary" textTransform="uppercase">
          {cliff === 0 ? t('Vesting Start') : t('Cliff')}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {dayjs(timeCliff).format('MM/DD/YYYY HH:mm')}
        </Text>
      </Flex>
      <Flex justifyContent="space-between">
        <Text style={{ alignSelf: 'center' }} fontSize="12px" bold color="secondary" textTransform="uppercase">
          {t('Vesting end')}
        </Text>
        <Text fontSize="12px" color="textSubtle">
          {dayjs(timeVestingEnd).format('MM/DD/YYYY HH:mm')}
        </Text>
      </Flex>
      <WhiteCard>
        <Progress primaryStep={percentage.receivedPercentage} secondaryStep={percentage.amountAvailablePercentage} />
        <Flex>
          <Flex flexDirection="column" mr="8px">
            <Text fontSize="14px">{received}</Text>
            <Text fontSize="14px" color="textSubtle">
              {t('Received')}
            </Text>
          </Flex>
          <Flex flexDirection="column">
            <Text fontSize="14px">{claimable}</Text>
            <Text fontSize="14px" color="textSubtle">
              {t('Claimable')}
            </Text>
          </Flex>
          <Flex flexDirection="column" ml="auto">
            <Text fontSize="14px" textAlign="right">
              {isVestingOver ? '-' : remaining}
            </Text>
            <Text fontSize="14px" color="textSubtle">
              {t('Remaining')}
            </Text>
          </Flex>
        </Flex>
        <Claim
          poolId={poolId}
          data={data}
          enabled={isVestingOver}
          claimableAmount={claimable}
          isVestingInitialized={isVestingInitialized}
          fetchUserVestingData={fetchUserVestingData}
        />
      </WhiteCard>
    </>
  )
}

export default Info
