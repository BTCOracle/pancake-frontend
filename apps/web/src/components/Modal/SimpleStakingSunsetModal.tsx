import { useTranslation } from '@pancakeswap/localization'
import { LinkExternal, Text, useModal } from '@pancakeswap/uikit'
import { useCallback, useEffect, useMemo } from 'react'

import { Trans } from 'components/CustomTrans'
import DisclaimerModal from 'components/DisclaimerModal'
import { useUserAcknowledgement } from 'hooks/useUserAcknowledgement'
import { useStakedPools, useStakedPositionsByUser } from 'views/FixedStaking/hooks/useStakedPools'

export function SimpleStakingSunsetModal() {
  const { t } = useTranslation()
  const [ack, setACK] = useUserAcknowledgement('simple-staking-sunset-v1')
  const onConfirm = useCallback(() => setACK(true), [setACK])

  const displayPools = useStakedPools()

  const displayPoolsIndex = useMemo(() => displayPools.map((p) => p.poolIndex), [displayPools])

  const stakedPositions = useStakedPositionsByUser(displayPoolsIndex)

  const [onOptionsConfirmModalPresent] = useModal(
    <DisclaimerModal
      bodyMaxWidth={['100%', '100%', '100%', '740px']}
      bodyMaxHeight="80vh"
      modalHeader={t('Action Required: Simple Staking Product Retirement')}
      header={
        <>
          <Text mt="1.5rem">
            <Trans
              text={t(
                `Our %page% Product will retire on %time%, at 00:00 UTC. Please ensure you withdraw all your funds before this date.`,
              )}
              data={{
                page: (
                  <LinkExternal bold style={{ display: 'inline-flex' }} showExternalIcon={false} href="/simple-staking">
                    {t('Simple Staking')}
                  </LinkExternal>
                ),
                time: 'March 10th, 2025',
              }}
            />
          </Text>
          <Text mt="1.5rem">
            {t(
              `This is part of our ongoing efforts to streamline offerings and focus on more sustainable, impactful products for our community.`,
            )}
          </Text>
          <Text mt="1.5rem">{t('To withdraw your funds:')}</Text>
          <Text mt="0.5rem">
            1️⃣{' '}
            <Trans
              text={t(`Visit the %page%`)}
              data={{
                page: (
                  <LinkExternal bold style={{ display: 'inline-flex' }} showExternalIcon={false} href="/simple-staking">
                    {t('Simple Staking Dashboard')}
                  </LinkExternal>
                ),
              }}
            />
          </Text>
          <Text mt="0.5rem">2️⃣ {t('Connect your wallet')}</Text>
          <Text mt="0.5rem">3️⃣ {t('Select your stake and withdraw')}</Text>
          <Text mt="1.5rem">
            <LinkExternal
              bold
              style={{ display: 'inline-flex' }}
              showExternalIcon
              href="https://blog.pancakeswap.finance/articles/action-required-simple-staking-product-retirement"
            >
              {t('Learn more here')}
            </LinkExternal>
          </Text>
        </>
      }
      id="simple-staking-sunset-modal"
      checks={[
        {
          key: 'checkbox',
          content: t(`I've read and understood the following update.`),
        },
      ]}
      onSuccess={onConfirm}
    />,
    false,
    false,
    'affiliateSunsetModal',
  )

  useEffect(() => {
    if (stakedPositions.length > 0 && ack === false) {
      onOptionsConfirmModalPresent()
    }
  }, [stakedPositions, ack, onOptionsConfirmModalPresent])

  return null
}
