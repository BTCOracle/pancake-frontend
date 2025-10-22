/* eslint-disable react/no-unescaped-entities */
import { ChainId } from '@pancakeswap/chains'
import { Trans } from '@pancakeswap/localization'
import { Box } from '@pancakeswap/uikit'
import { ASSET_CDN } from 'config/constants/endpoints'
import { ReactNode } from 'react'
import type { Address } from 'viem'

export type IDOFAQs = Array<{ title: ReactNode; description: ReactNode }>

export type IDOConfig = {
  id: string
  icon: string
  projectUrl: string
  chainId: ChainId
  bannerUrl: string
  tgeTitle: ReactNode
  tgeSubtitle: ReactNode
  description: ReactNode
  ineligibleContent?: ReactNode
  contractAddress: Address
  faqs?: IDOFAQs
}

export const idoConfigDict: Record<string, IDOConfig> = {
  myshell: {
    id: 'myshell',
    icon: '/images/ido/myshell.png',
    projectUrl: 'https://myshell.ai/',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/myshell-banner.png`,
    contractAddress: '0x0D54115eF8474C48103A1e3b41464BF3dB00E4B2',
    tgeTitle: <Trans>MyShell's Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <Trans>
        MyShell is an AI creator platform for everyone to build, share, and own AI agents. Our vision is to create a
        unified platform that provides product-driven value for web2 users and offers the crypto community participating
        ownership in practical AI applications, bridging the gap between frontier AI applications and blockchain
        technology.
      </Trans>
    ),
  },
  bubblemaps: {
    id: 'bubblemaps',
    projectUrl: 'https://bubblemaps.io/',
    icon: '/images/ido/bubblemaps.png',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/bubblemaps-banner.png`,
    contractAddress: '0xb330A50d27341730b7B3fD285B150e5742C3b090',
    tgeTitle: <Trans>Bubblemaps's Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <>
        <Trans>
          Bubblemaps is a crypto analytical tool turning blockchain data into a powerful visual experience. It shows
          connections between a token’s holders and helps identify team wallets, VCs, and insiders—making it easier to
          understand the tokenomics and spot potential risks.
        </Trans>
        <br />
        <br />
        Website:{' '}
        <a href="https://bubblemaps.io/" target="_blank" rel="noreferrer noopener">
          https://bubblemaps.io/
        </a>
        <br />
        <br />
        X:{' '}
        <a href="https://x.com/bubblemaps" target="_blank" rel="noreferrer noopener">
          https://x.com/bubblemaps
        </a>
        <br />
        <br />
        <Trans> What can Bubblemaps do? </Trans>
        <br />
        <Trans>
          Investigate wallets, reveal connections, and see through the noise of blockchain data. For more detailed case
          studies of Bubblemaps capabilities, please refer to the following link:
        </Trans>{' '}
        <a href="https://bubblemaps.io/case-studies" target="_blank" rel="noreferrer noopener">
          https://bubblemaps.io/case-studies
        </a>
      </>
    ),
    faqs: [
      {
        title: <Trans>1. When can I claim my tokens?</Trans>,
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: <Trans>2. How many tokens will I receive?</Trans>,
        description: (
          <Trans>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </Trans>
        ),
      },
      {
        title: <Trans>3. Will I receive a refund if the pool is oversubscribed?</Trans>,
        description: (
          <Trans>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </Trans>
        ),
      },
      {
        title: <Trans>4. Which regions or countries are restricted from participating in this event?</Trans>,
        description: (
          <>
            <Trans>
              The following nationalities are currently not eligible to participate in Binance-exclusive TGEs:
            </Trans>
            <ul>
              <li>
                <b>
                  <Trans>Binance Wallet users</Trans>
                </b>{' '}
                <Trans>
                  from the following nationalities are currently not eligible to participate in this event: United
                  States, Poland, Belgium, Kazakhstan, Bahrain, UAE, Australia, Japan, New Zealand, Argentina, Brazil,
                  Colombia, Sweden, Indonesia, Thailand, Canada, Iran, Cuba, North Korea, Syria, Russia, Ukraine,
                  Belarus.
                </Trans>
              </li>
              <li>
                <b>
                  <Trans>PancakeSwap users</Trans>
                </b>{' '}
                <Trans>
                  from the following nationalities are currently not eligible to participate in this event: Belarus,
                  Myanmar, Côte d'Ivoire, Cuba, Iran, Iraq, Liberia, Sudan, Syria, Zimbabwe, Congo (Kinshasa), North
                  Korea.
                </Trans>
              </li>
            </ul>
            <br />
            <Trans>Please ensure you comply with the eligibility requirements before participating.</Trans>
          </>
        ),
      },
    ],
  },
  bedrock: {
    id: 'bedrock',
    projectUrl: 'https://www.bedrock.technology/',
    icon: '/images/ido/bedrock.png',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/bedrock-banner.png`,
    contractAddress: '0xA7082d7935830e476932196D241D5Db60529B4Af',
    tgeTitle: <Trans>Bedrock's Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <>
        <Trans>
          Bedrock is a multi-asset liquid restaking protocol that enables Bitcoin staking through uniBTC. uniBTC allows
          holders to earn rewards while maintaining liquidity, unlocking new yield opportunities in Bitcoin’s 1 trillion
          market cap. With a cutting-edge approach to BTCFi 2.0, Bedrock is redefining Bitcoin’s role in DeFi — and
          extending liquid restaking across 12+ blockchains for BTC, ETH, and DePIN assets.
        </Trans>
        <br />
        <br />
        Website:{' '}
        <a href="https://www.bedrock.technology" target="_blank" rel="noreferrer noopener">
          https://www.bedrock.technology
        </a>
        <br />
        <br />
        X:{' '}
        <a href="https://x.com/Bedrock_DeFi" target="_blank" rel="noreferrer noopener">
          https://x.com/Bedrock_DeFi
        </a>
        <br />
      </>
    ),
    faqs: [
      {
        title: <Trans>1. When can I claim my tokens?</Trans>,
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: <Trans>2. How many tokens will I receive?</Trans>,
        description: (
          <Trans>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </Trans>
        ),
      },
      {
        title: <Trans>3. Will I receive a refund if the pool is oversubscribed?</Trans>,
        description: (
          <Trans>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </Trans>
        ),
      },
    ],
  },
  particle: {
    id: 'particle',
    projectUrl: 'https://particle.network/',
    icon: '/images/ido/particle.png',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/particle-banner.png`,
    contractAddress: '0x935de2dBc611F4b01b2D8b14AE5c58d940d2f719',
    tgeTitle: <Trans>Particle Network's Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <>
        <Trans>
          Particle Network is the largest chain abstraction infrastructure for Web3. Its core technology, Universal
          Accounts, represents the solution to Web3's user, data, and liquidity fragmentation, giving users a single
          account and balance across all chains.
        </Trans>
        <Trans>
          The Particle Chain, Particle Network’s L1 blockchain, acts as the engine powering Universal Accounts. To
          showcase this innovation, Particle has already released the chain-agnostic Mainnet dApp — UniversalX. With it,
          users can trade using tokens from any chain, combining their assets across all ecosystems and paying gas with
          any token.
        </Trans>
        <br />
        <br />
        Website:{' '}
        <a href="https://particle.network/" target="_blank" rel="noreferrer noopener">
          https://particle.network/
        </a>
        <br />
        <br />
        X:{' '}
        <a href="https://x.com/ParticleNtwrk" target="_blank" rel="noreferrer noopener">
          https://x.com/ParticleNtwrk
        </a>
        <br />
      </>
    ),
    faqs: [
      {
        title: <Trans>1. When can I claim my tokens?</Trans>,
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: <Trans>2. How many tokens will I receive?</Trans>,
        description: (
          <Trans>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </Trans>
        ),
      },
      {
        title: <Trans>3. Will I receive a refund if the pool is oversubscribed?</Trans>,
        description: (
          <Trans>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </Trans>
        ),
      },
    ],
  },
  kiloex: {
    id: 'kiloex',
    projectUrl: 'https://www.kiloex.io/',
    icon: '/images/ido/kiloex.png',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/kiloex-banner.png`,
    contractAddress: '0x61222059aAC449252949B3911AC1e325966F31eC',
    tgeTitle: <Trans>KiloEx's Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <>
        <Trans>
          KiloEx is building the next generation of user-friendly perpetual DEX fully integrated with LSTfi.
        </Trans>
        <br />
        <Trans>
          KiloEx platform provides traders with lightning-fast trades, real-time tracking of market activity, and an
          intuitive trading experience, while offering liquidity providers risk-neutral positions and LP-friendly
          solutions.
        </Trans>
        <br />
        <br />
        Website:{' '}
        <a href="https://www.kiloex.io/" target="_blank" rel="noreferrer noopener">
          https://www.kiloex.io/
        </a>
        <br />
        <br />
        X:{' '}
        <a href="https://x.com/KiloEx_perp" target="_blank" rel="noreferrer noopener">
          https://x.com/KiloEx_perp
        </a>
        <br />
      </>
    ),
    faqs: [
      {
        title: <Trans>1. When can I claim my tokens?</Trans>,
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: <Trans>2. How many tokens will I receive?</Trans>,
        description: (
          <Trans>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </Trans>
        ),
      },
      {
        title: <Trans>3. Will I receive a refund if the pool is oversubscribed?</Trans>,
        description: (
          <Trans>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </Trans>
        ),
      },
    ],
  },
  pump: {
    id: 'pump',
    projectUrl: 'https://pumpbtc.xyz/',
    icon: '/images/ido/pump.svg',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/purgent-banner.png`,
    contractAddress: '0x2b1CaFd7aD06A548B13E2CfCaC4775FC4c3891AC',
    tgeTitle: <Trans>Purgent's Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <>
        <Trans>
          PumpBTC is building an modular, multi-chain, AI-driven staking and liquidity operating system that seamlessly
          integrates with DeFi to help Bitcoin holders maximize returns.
        </Trans>
        <br />
        <br />
        <Trans>Website</Trans>:{' '}
        <a href="https://mainnet.pumpbtc.xyz/" target="_blank" rel="noreferrer noopener">
          https://mainnet.pumpbtc.xyz/
        </a>
        <br />
        X:{' '}
        <a href="https://x.com/Pumpbtcxyz" target="_blank" rel="noreferrer noopener">
          https://x.com/Pumpbtcxyz
        </a>
        <br />
      </>
    ),
    faqs: [
      {
        title: <Trans>1. When can I claim my tokens?</Trans>,
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: <Trans>2. How many tokens will I receive?</Trans>,
        description: (
          <Trans>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </Trans>
        ),
      },
      {
        title: <Trans>3. Will I receive a refund if the pool is oversubscribed?</Trans>,
        description: (
          <Trans>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </Trans>
        ),
      },
    ],
  },
  stakestone: {
    id: 'stakestone',
    projectUrl: 'https://stakestone.io/',
    icon: '/images/ido/stakestone.svg', // Token Icon updated from provided assets
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/stakestone-banner.png`, // Updated Banner URL
    contractAddress: '0xf87c2D0869e4864788e3EfF1f0354d9d3B19907b', // Updated IDO Contract Address
    tgeTitle: <Trans>StakeStone Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <>
        <Trans>
          StakeStone is a decentralized omnichain liquidity infrastructure protocol designed to transform how liquidity
          is acquired, distributed, and utilized across blockchain ecosystems. Its core mission is to deliver efficient,
          sustainable, and organic liquidity flows that adapt to the needs of an increasingly modular and multi-chain
          DeFi landscape.
        </Trans>
        <br />
        <br />
        <Trans>
          StakeStone powers a growing suite of products including STONE (yield-bearing liquid ETH), SBTC and STONEBTC
          (liquid and yield-generating BTC assets), and LiquidityPad, a customizable liquidity vault platform for
          emerging chains. Together, these offerings form the foundation of StakeStone’s Omnichain Liquidity Layer,
          enabling frictionless capital deployment and value accrual across ecosystems.
        </Trans>
        <br />
        <br />
        <Trans>Website</Trans>:{' '}
        <a href="https://stakestone.io/" target="_blank" rel="noreferrer noopener">
          https://stakestone.io/
        </a>
        <br />
        X:{' '}
        <a href="https://x.com/Stake_Stone" target="_blank" rel="noreferrer noopener">
          https://x.com/Stake_Stone
        </a>
        <br />
      </>
    ),
    faqs: [
      {
        title: <Trans>1. When can I claim my tokens?</Trans>,
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: <Trans>2. How many tokens will I receive?</Trans>,
        description: (
          <Trans>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </Trans>
        ),
      },
      {
        title: <Trans>3. Will I receive a refund if the pool is oversubscribed?</Trans>,
        description: (
          <Trans>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </Trans>
        ),
      },
    ],
  },
  mindnetwork: {
    id: 'mindnetwork',
    projectUrl: 'https://www.mindnetwork.xyz/',
    icon: '/images/ido/mindnetwork.svg',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/mindnetwork-banner.png`,
    contractAddress: '0x000D84716E4ffeFFa96Bb70F9a1a2C233586e0F3',
    tgeTitle: <Trans>Mind Network's Token Generation Event</Trans>,
    tgeSubtitle: <Trans>Exclusively via Binance Keyless Wallet</Trans>,
    description: (
      <>
        <Trans>
          Mind Network pioneers quantum-resistant Fully Homomorphic Encryption (FHE) infrastructure, powering a fully
          encrypted internet through secure data and AI computation. In collaboration with industry leaders, Mind
          Network is establishing HTTPZ — a Zero Trust Internet Protocol — to set new standards for trusted AI and
          encrypted on-chain data processing in Web3 and AI ecosystems.
        </Trans>
        <br />
        <br />
        Website:
        <a href="https://www.mindnetwork.xyz/" target="_blank" rel="noreferrer noopener">
          https://www.mindnetwork.xyz/
        </a>
        <br />
        X:
        <a href="https://x.com/mindnetwork_xyz" target="_blank" rel="noreferrer noopener">
          https://x.com/mindnetwork_xyz
        </a>
      </>
    ),
    faqs: [
      {
        title: <Trans>1. When can I claim my tokens?</Trans>,
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: <Trans>2. How many tokens will I receive?</Trans>,
        description: (
          <Trans>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </Trans>
        ),
      },
      {
        title: <Trans>3. Will I receive a refund if the pool is oversubscribed?</Trans>,
        description: (
          <Trans>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </Trans>
        ),
      },
      {
        title: <>4. Which participants are eligible to take part in this event?</>,
        description: (
          <Box style={{ lineHeight: '1.5rem' }}>
            Participant Eligibility:
            <br />
            To qualify, participants must maintain a minimum daily asset value of $100 in Binance accounts for 7
            consecutive days before the TGE start date. Check your eligibility on the PancakeSwap TGE event page.
            <br />
            <br />
            <ul style={{ listStyle: 'circle', listStylePosition: 'inside' }}>
              <li>Snapshot Period:</li>
              <br />
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '1.4rem' }}>
                April 3, 2025, 23:59:59 UTC – April 9, 2025, 23:59:59 UTC
              </ol>
              <br />
              <li>Snapshot Aggregated Assets:</li>
              <br />
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '1.4rem' }}>
                <li>
                  Assets in Binance Wallet (Keyless): Listed Binance Spot tokens and Alpha tokens, but excluded LSD-type
                  tokens.
                </li>
                <br />
                <li>Assets in Binance Exchange Account.</li>
              </ol>
              <br />
              <li>Examples</li>
              <br />
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '1.4rem' }}>
                <li>
                  User A has a daily asset value of $50 in Binance Wallet (Keyless), and a daily asset value of $50 in
                  Binance Exchange Account for 7 consecutive days before the TGE start date. He/She is eligible.
                </li>
                <br />
                <li>
                  User B has a daily asset value of $100 in Binance Wallet (Keyless), and a daily asset value of $0 in
                  Binance Exchange Account for 7 consecutive days before the TGE start date. He/She is eligible.
                </li>
                <br />
                <li>
                  User C has a daily asset value of $0 in Binance Wallet (Keyless), and a daily asset value of $100 in
                  Binance Exchange Account for 7 consecutive days before the TGE start date. He/She is eligible.
                </li>
                <br />
              </ol>
              <li>Important Notes: </li>
              <br />
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '1.4rem' }}>
                Binance reserves the right to modify event rules and criteria at any time without prior notice. All rule
                interpretations are solely at Binance’s discretion. Participants are strongly advised to verify the
                latest rules via official channels before participating.
              </ol>
            </ul>
          </Box>
        ),
      },
    ],
  },
  lorenzoprotocol: {
    id: 'lorenzoprotocol',
    projectUrl: 'https://lorenzo-protocol.xyz/',
    icon: '/images/ido/lorenzo.svg',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/lorenzo-banner.svg`,
    contractAddress: '0x8f62d34113A1dE746eAac3b1F2D4CEeC9d393027',
    tgeTitle: `Lorenzo's Token Generation Event`,
    tgeSubtitle: 'Exclusively via Binance Keyless Wallet',
    description: (
      <>
        <Trans>
          Lorenzo Protocol is described as an institutional-grade on-chain asset management platform that structures and
          deploys yield-optimized fund vaults, effectively channeling on-chain liquidity into the most competitive yield
          opportunities.
        </Trans>
        <br />
        <br />
        Website: &nbsp;
        <a href="https://lorenzo-protocol.xyz/" target="_blank" rel="noreferrer noopener">
          https://lorenzo-protocol.xyz/
        </a>
        <br />
        <br />
        X: &nbsp;
        <a href="https://x.com/LorenzoProtocol" target="_blank" rel="noreferrer noopener">
          https://x.com/LorenzoProtocol
        </a>
      </>
    ),
    faqs: [
      {
        title: '1: Which participants are eligible to take part in this event?',
        description: (
          <>
            Participant Eligibility: To qualify, participants must have purchased Binance Alpha tokens through Binance
            Wallet (Keyless) or Spot/Funding accounts on Binance Exchange within the 30-day period preceding the TGE
            start date.
            <ul>
              <li>Valid Purchase Period: March 19, 2025, 00:00:00 to April 17, 2025, 23:59:59 (UTC)</li>
              {/* <li>How to check eligibility: Visit the TGE event page.</li> */}

              <li> Examples: </li>
              <br />
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '1.4rem' }}>
                <li>
                  User A purchased Binance Alpha tokens through Binance Wallet (Keyless) on April 5, 2025. He/She is
                  eligible.
                </li>
                <br />
                <li>
                  User B purchased Binance Alpha tokens through Spot/Funding accounts on Binance Exchange on April 7,
                  2025. He/She is eligible.
                </li>
                <br />
                <li>
                  User C purchased Binance Alpha tokens via Binance Wallet (Keyless) on March 2, 2025, which is before
                  the snapshot period. He/She is not eligible.
                </li>
                <br />
                <li>
                  User D purchased “X” token via Binance Wallet (Keyless) on April 5, 2025, but “X” token was officially
                  listed on Binance Alpha on April 7. He/She is not eligible.
                </li>
              </ol>
              <br />
              <li>Important Notes:</li>
              <br />
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '1.4rem' }}>
                <li>
                  Binance reserves the right to modify event rules and criteria at any time without prior notice. All
                  rule interpretations are solely at Binance’s discretion. Participants are strongly advised to verify
                  the latest rules via official channels before participating.
                </li>
                <br />
                <li>
                  Alpha token purchases are only considered valid after the token is officially listed on Binance, and
                  users can verify their detailed purchase records in their Binance Wallet (Keyless) or Spot/Funding
                  accounts on the Binance Exchange.
                </li>
              </ol>
            </ul>
          </>
        ),
      },
      {
        title: '2: When can I claim my tokens?',
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '3. How many tokens will I receive?',
        description: (
          <>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </>
        ),
      },
      {
        title: '4. Will I receive a refund if the pool is oversubscribed?',
        description: (
          <>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </>
        ),
      },
    ],
  },
  hyperlane_0421: {
    id: 'hyperlane_0421',
    projectUrl: 'https://hyperlane.xyz/',
    icon: '/images/ido/hyper.svg',
    chainId: ChainId.BSC,
    bannerUrl: `${ASSET_CDN}/web/ido/hyperlane-banner.svg`,
    contractAddress: '0x445162BC2B73EC0631486F70A4a716e7ea2d9A4e',
    tgeTitle: `Hyperlane's Token Generation Event`,
    tgeSubtitle: 'Exclusively via Binance Keyless Wallet',
    ineligibleContent: (
      <>
        Unfortunately you do not meet the participation requirements this time. Participants must have purchased at
        least $20 worth of Binance Alpha tokens via Binance Wallet (Keyless) or through Spot/Funding accounts on Binance
        Exchange from March 22, 2025, 00:00:00 to April 20, 2025, 23:59:59 (UTC).
      </>
    ),
    description: (
      <>
        Hyperlane is a permissionless interoperability protocol for cross-chain communication across different
        blockchain environments. It enables message passing and asset transfers across different chains without relying
        on centralized intermediaries or requiring any permissions.
        <br />
        <br />
        Website: &nbsp;
        <a href="https://hyperlane.xyz/" target="_blank" rel="noreferrer noopener">
          https://hyperlane.xyz/
        </a>
        <br />
        <br />
        X: &nbsp;
        <a href="https://x.com/Hyperlane" target="_blank" rel="noreferrer noopener">
          https://x.com/Hyperlane
        </a>
      </>
    ),
    faqs: [
      {
        title: '1: Which participants are eligible to take part in this event?',
        description: (
          <>
            Participant Eligibility: To qualify, participants must have purchased at least $20 worth of Binance Alpha
            tokens via Binance Wallet (Keyless) or through Spot/Funding accounts on Binance Exchange from March 22,
            2025, 00:00:00 to April 20, 2025, 23:59:59 (UTC).
            <ul>
              <li>
                Alpha token purchases are only considered valid after the token is officially listed on Binance, and
                users can verify their detailed purchase records in their Binance Wallet (Keyless) or Spot/Funding
                accounts on the Binance Exchange.
              </li>
              {/* <li>How to check eligibility: Visit the TGE event page.</li> */}

              <li> Examples: </li>
              <br />
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '1.4rem' }}>
                <li>
                  User A Purchased $20 worth of Binance Alpha tokens via Binance Wallet (Keyless) on April 5, 2025.
                  He/She is eligible.
                </li>
                <br />
                <li>
                  User B purchased $10 through Binance Spot/Funding Account and $10 via Binance Wallet (Keyless) on
                  April 7, 2025, and is eligible.
                </li>
                <br />
                <li>
                  User C purchased Binance Alpha tokens via Binance Wallet (Keyless) on March 13, 2025, which is before
                  the snapshot period. He/She is not eligible.
                </li>
                <br />
                <li>
                  User D purchased “X” token via Binance Wallet (Keyless) on April 5, 2025, but “X” token was officially
                  listed on Binance Alpha on April 7. He/She is not eligible.
                </li>
              </ol>
              <br />
              <li>Important Notes:</li>
              <br />
              <ol style={{ listStyle: 'decimal', listStylePosition: 'inside', marginLeft: '1.4rem' }}>
                <li>
                  Binance reserves the right to modify event rules and criteria at any time without prior notice. All
                  rule interpretations are solely at Binance’s discretion. Participants are strongly advised to verify
                  the latest rules via official channels before participating.
                </li>
                <br />
              </ol>
            </ul>
          </>
        ),
      },
      {
        title: '2: When can I claim my tokens?',
        description: (
          <>
            <Trans>
              You can claim your tokens immediately once the TGE ends by clicking the Claim button. Alternatively, you
              can return to the TGE page at any time afterward to claim your tokens—there is no fixed claim period.
            </Trans>
            <Trans>On the TGE page, you will also find key details, including:</Trans>
            <ul>
              <li>
                <Trans>The number of tokens available for claiming</Trans>
              </li>
              <li>
                <Trans>The TGE duration</Trans>
              </li>
              <li>
                <Trans>The total amount of BNB subscribed</Trans>
              </li>
              <li>
                <Trans>The total amount of refunded BNB (if applicable)</Trans>
              </li>
              <li>
                <Trans>The TGE status (e.g., oversubscribed or not)</Trans>
              </li>
            </ul>
          </>
        ),
      },
      {
        title: '3. How many tokens will I receive?',
        description: (
          <>
            During the TGE, users can subscribe up to a maximum of 3 BNB. The final token allocation is determined based
            on the proportion of BNB a user contributed relative to the total BNB subscribed by all participants at the
            time the sale ends.
          </>
        ),
      },
      {
        title: '4. Will I receive a refund if the pool is oversubscribed?',
        description: (
          <>
            Yes. If the TGE is oversubscribed, any excess BNB that was not used to purchase tokens will be automatically
            refunded to your wallet when you claim your tokens.
          </>
        ),
      },
    ],
  },
}
