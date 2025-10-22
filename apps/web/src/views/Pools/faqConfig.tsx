import { Link } from '@pancakeswap/uikit'
import { FaqConfig } from 'components/PinnedFAQButton'
import Trans from 'components/Trans'
import { styled } from 'styled-components'

const InlineLink = styled(Link)`
  display: inline;
`

const faqConfig: FaqConfig[] = [
  {
    title: <Trans>What are Syrup Pools?</Trans>,
    description: [
      <Trans
        i18nKey="syrup-pools-desc"
        i18nTemplate="Syrup Pools let you stake CAKE to earn rewards. By depositing CAKE into a Syrup Pool, you can receive tokens from partner projects, depending on the pool."
      />,
    ],
  },
  {
    title: <Trans>How do I stake CAKE in Syrup Pools?</Trans>,
    description: [
      <>
        <Trans
          i18nKey="syrup-pools-instructions"
          i18nTemplate="Go to the <0>Syrup Pools</0> section on PancakeSwap, choose a pool, and deposit CAKE. Your rewards will start accumulating automatically. You can unstake your CAKE anytime."
          components={[<strong key="0" />]}
        />
      </>,
    ],
  },
  {
    title: <Trans>What rewards can I earn from Syrup Pools?</Trans>,
    description: [
      <ul key="rewards-list">
        <Trans
          i18nKey="rewards-list"
          i18nTemplate='<0>Partner Token Pools</0>: Earn tokens from partner projects by staking CAKE (e.g., Stake CAKE to earn PEPE). <1>Rewards must be claimed manually by clicking the "Harvest" button under "Details" for each pool.</1>'
          components={[<strong key="0" />, <li key="1" />]}
        />
      </ul>,
    ],
  },
  {
    title: <Trans>Are there any fees for staking or unstaking?</Trans>,
    description: [
      <>
        <Trans
          i18nKey="fees-description"
          i18nTemplate="There are <0>no platform fees</0> for staking or unstaking in Syrup Pools. However, <1>standard blockchain gas fees</1> will still apply when making transactions, such as depositing, harvesting rewards, or unstaking CAKE."
          components={[<strong key="0" />, <strong key="1" />]}
        />
      </>,
    ],
  },
  {
    title: <Trans>What happens if I don&apos;t claim my rewards?</Trans>,
    description: [
      <>
        <Trans
          i18nKey="unclaimed-rewards"
          i18nTemplate='Your rewards will continue to accumulate while your CAKE remains staked. You can claim them at any time by clicking the "<0>Harvest</0>" button.'
          components={[<strong key="0" />]}
        />
      </>,
    ],
  },
  {
    title: <Trans>I still have CAKE staked in the old Auto or Manual CAKE Pools. What should I do?</Trans>,
    description: [
      <>
        <Trans
          i18nKey="legacy-pools"
          i18nTemplate="The <0>Auto CAKE and Manual CAKE Pools</0> have been upgraded to <1>veCAKE</1> staking. If you still have CAKE staked in the legacy pools, you'll need to <2>migrate to veCAKE</2> to continue earning rewards. <3>Learn how to migrate here</3>"
          components={[
            <strong key="0" />,
            <strong key="1" />,
            <strong key="2" />,
            <InlineLink
              key="3"
              target="_blank"
              rel="noreferrer"
              href="https://docs.pancakeswap.finance/products/vecake/migrate-from-cake-pool"
            />,
          ]}
        />
      </>,
    ],
  },
]

export default faqConfig
