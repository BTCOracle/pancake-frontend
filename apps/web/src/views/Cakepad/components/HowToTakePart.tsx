import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, Flex, Heading, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { safeGetAddress } from 'utils'
import { useMemo } from 'react'
import useIfo from '../hooks/useIfo'

const SectionWrapper = styled(Box)`
  background: ${({ theme }) =>
    theme.isDark
      ? 'linear-gradient(112deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(112deg, #F2ECF2 0%, #E8F2F6 100%)'};
  padding: 48px 0;
`

const StyledHeading = styled(Heading)`
  color: ${({ theme }) => theme.colors.secondary};
  font-feature-settings: 'liga' off;
  font-family: Kanit;
  font-size: 40px;
  font-style: normal;
  font-weight: 600;
  line-height: 120%;
  letter-spacing: -0.4px;

  ${({ theme }) => theme.mediaQueries.xs} {
    font-size: 32px;
  }
`

const StyledCard = styled(Card)`
  background: ${({ theme }) => theme.colors.card};
  width: 100%;
  max-width: 460px;
`

const StepNumber = styled(Box)<{ $fill: string }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme, $fill }) => theme.colors[$fill]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 64px;
    height: 64px;
  }
`

const BulletList = styled.ul`
  list-style-type: disc;
  padding-left: 20px;
  margin: 0;
  li {
    margin-bottom: 8px;
  }
`

const StepCard = ({
  stepNumber,
  title,
  items,
  circleFill,
}: {
  stepNumber: number
  title: string
  items: string[]
  circleFill: string
}) => {
  return (
    <StyledCard>
      <CardBody p="24px">
        <StepNumber $fill={circleFill}>
          <Text fontSize="24px" fontWeight="bold" color="invertedContrast">
            {stepNumber}
          </Text>
        </StepNumber>
        <Heading as="h3" fontSize="24px" mb="16px" color="secondary">
          {title}
        </Heading>
        <BulletList>
          {items.map((item) => (
            <li key={item}>
              <Text as="span" color="textSubtle" lineHeight="1.5">
                {item}
              </Text>
            </li>
          ))}
        </BulletList>
      </CardBody>
    </StyledCard>
  )
}

const HowToTakePart: React.FC = () => {
  const { t } = useTranslation()
  const { pools: pools_, config } = useIfo()

  const pools = useMemo(
    () => (config.contractAddress && safeGetAddress(config.contractAddress) ? pools_ : config.presetData?.pools ?? []),
    [pools_, config.presetData],
  )

  const stakeSymbols = useMemo(
    () => pools?.map((pool) => pool.stakeCurrency?.symbol).filter(Boolean) as string[],
    [pools],
  )

  const commitTokensText =
    stakeSymbols.length === 1
      ? `$${stakeSymbols[0]}`
      : stakeSymbols.length >= 2
      ? `$${stakeSymbols[0]} or $${stakeSymbols[1]}`
      : '$CAKE'

  return (
    <SectionWrapper id="cakepad-how-to">
      <Flex flexDirection="column" alignItems="center" mb="40px">
        <StyledHeading as="h2" textAlign="center">
          {t('How to Take Part')}
        </StyledHeading>
      </Flex>

      <Flex
        flexDirection={['column', 'column', 'row']}
        justifyContent="center"
        alignItems={['center', 'center', 'flex-start']}
        style={{ gap: '40px' }}
        px="16px"
      >
        <StepCard
          stepNumber={1}
          title={t('Commit %symbol%', { symbol: commitTokensText })}
          circleFill="secondary"
          items={[
            t('Anyone with %symbol% can take part — no KYC required.', { symbol: commitTokensText }),
            t('When the CAKE.PAD event is live, simply commit your %symbol% tokens.', { symbol: commitTokensText }),
            t(
              'You can commit as much %symbol% as you like. Your final token allocation will depend on how much you commit compared to the total pool.',
              { symbol: commitTokensText },
            ),
          ]}
        />

        <StepCard
          stepNumber={2}
          title={t('Claim your tokens')}
          circleFill="secondary"
          items={[
            t('After the CAKE.PAD event ends, you can claim the CAKE.PAD tokens you purchased.'),
            t(
              'If the CAKE.PAD event is oversubscribed (total committed amount > raise goal), unspent %symbol% will be refunded.',
              {
                symbol: commitTokensText,
              },
            ),
            t(
              'A participation fee (0.05%–1%) applies only when the CAKE.PAD event is oversubscribed. The fee decreases as the oversubscription % rises and is deducted from your refunded %symbol%.',
              { symbol: commitTokensText },
            ),
          ]}
        />
      </Flex>
    </SectionWrapper>
  )
}

export default HowToTakePart
