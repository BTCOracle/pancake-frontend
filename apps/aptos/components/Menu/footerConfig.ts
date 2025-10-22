import { ContextApi } from '@pancakeswap/localization'
import { FooterLinkType } from '@pancakeswap/uikit'

export const footerLinks: (t: ContextApi['t']) => FooterLinkType[] = (t) => [
  {
    label: t('Ecosystem'),
    items: [
      {
        label: t('Trade'),
        href: '/swap',
      },
      {
        label: t('Earn.verb'),
        href: '/farms',
      },
      {
        label: t('Game'),
        href: 'https://pancakeswap.games/',
      },
      {
        label: t('Play'),
        href: 'https://pancakeswap.finance/prediction',
      },
      {
        label: t('Merchandise'),
        href: 'https://merch.pancakeswap.finance/',
      },
    ],
  },
  {
    label: 'Business',
    items: [
      {
        label: t('CAKE Incentives'),
        href: 'https://docs.pancakeswap.finance/ecosystem-and-partnerships/business-partnerships/syrup-pools-and-farms',
      },
      {
        label: t('Staking Pools'),
        href: 'https://pancakeswap.finance/pools',
      },
      {
        label: t('Token Launches'),
        href: 'https://docs.pancakeswap.finance/ecosystem-and-partnerships/business-partnerships/initial-farm-offerings-ifos',
      },
      {
        label: t('Brand Assets'),
        href: 'https://docs.pancakeswap.finance/ecosystem-and-partnerships/brand',
      },
    ],
  },
  {
    label: t('Developers'),
    items: [
      {
        label: t('Contributing'),
        href: 'https://docs.pancakeswap.finance/developers/contributing',
      },
      {
        label: t('Github'),
        href: 'https://github.com/pancakeswap',
      },
      {
        label: t('Bug Bounty'),
        href: 'https://docs.pancakeswap.finance/developers/bug-bounty',
      },
    ],
  },
  {
    label: t('Support'),
    items: [
      {
        label: t('Get Help'),
        href: 'https://docs.pancakeswap.finance/welcome-to-pancakeswap/contact-us/faq/help',
      },
      {
        label: t('Troubleshooting'),
        href: 'https://docs.pancakeswap.finance/readme/help/troubleshooting',
      },
      {
        label: t('Documentation'),
        href: 'https://docs.pancakeswap.finance/',
      },
      {
        label: t('Audits'),
        href: 'https://docs.pancakeswap.finance/readme/audits',
      },
      {
        label: t('Legacy products'),
        href: 'https://docs.pancakeswap.finance/products/legacy-products',
      },
    ],
  },
  {
    label: t('About'),
    items: [
      {
        label: t('Tokenomics'),
        href: 'https://docs.pancakeswap.finance/governance-and-tokenomics/cake-tokenomics',
      },
      {
        label: t('CAKE Burn Dashboard'),
        href: 'https://pancakeswap.finance/burn-dashboard',
      },
      {
        label: t('Blog'),
        href: 'https://blog.pancakeswap.finance/',
      },
      {
        label: t('Careers'),
        href: 'https://docs.pancakeswap.finance/team/become-a-chef',
      },
      {
        label: t('Terms Of Service'),
        href: 'https://pancakeswap.finance/terms-of-service',
      },
    ],
  },
]
