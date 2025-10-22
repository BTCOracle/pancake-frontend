import { Trans } from '@pancakeswap/localization'
import { Balance, Flex, Skeleton, Text } from '@pancakeswap/uikit'
import { getBalanceNumber, getFullDisplayBalance } from '@pancakeswap/utils/formatBalance'
import BigNumber from 'bignumber.js'
import { useCakePrice } from 'hooks/useCakePrice'

interface RewardBracketDetailProps {
  cakeAmount: BigNumber
  rewardBracket: number
  numberWinners?: string
  isBurn?: boolean
  isHistoricRound?: boolean
  isLoading?: boolean
}

const RewardBracketDetail: React.FC<React.PropsWithChildren<RewardBracketDetailProps>> = ({
  rewardBracket,
  cakeAmount,
  numberWinners,
  isHistoricRound,
  isBurn,
  isLoading,
}) => {
  const cakePrice = useCakePrice()

  const getRewardText = () => {
    const numberMatch = rewardBracket + 1
    if (isBurn) {
      return <Trans>Burn</Trans>
    }
    if (rewardBracket === 5) {
      return <Trans i18nKey="Match all %numberMatch%" values={{ numberMatch }} />
    }
    return <Trans i18nKey="Match first %numberMatch%" values={{ numberMatch }} />
  }

  return (
    <Flex flexDirection="column">
      {isLoading ? (
        <Skeleton mb="4px" mt="8px" height={16} width={80} />
      ) : (
        <Text bold color={isBurn ? 'failure' : 'secondary'}>
          {getRewardText()}
        </Text>
      )}
      <>
        {isLoading || cakeAmount.isNaN() ? (
          <Skeleton my="4px" mr="10px" height={20} width={110} />
        ) : (
          <Balance fontSize="20px" bold unit=" CAKE" value={getBalanceNumber(cakeAmount)} decimals={0} />
        )}
        {isLoading || cakeAmount.isNaN() ? (
          <>
            <Skeleton mt="4px" mb="16px" height={12} width={70} />
          </>
        ) : (
          <Balance
            fontSize="12px"
            color="textSubtle"
            prefix="~$"
            value={getBalanceNumber(cakeAmount.times(cakePrice))}
            decimals={0}
          />
        )}
        {isHistoricRound && cakeAmount && (
          <>
            {numberWinners && numberWinners !== '0' && (
              <Text fontSize="12px" color="textSubtle">
                {getFullDisplayBalance(cakeAmount.div(parseInt(numberWinners, 10)), 18, 2)} CAKE <Trans>each</Trans>
              </Text>
            )}
            <Text fontSize="12px" color="textSubtle">
              {numberWinners} <Trans>Winning Tickets</Trans>
            </Text>
          </>
        )}
      </>
    </Flex>
  )
}

export default RewardBracketDetail
