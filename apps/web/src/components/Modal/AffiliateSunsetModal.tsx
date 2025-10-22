import { useTranslation } from '@pancakeswap/localization'
import { LinkExternal, Text, useModal } from '@pancakeswap/uikit'
import { Trans } from 'components/CustomTrans'
import { useCallback, useEffect } from 'react'

import DisclaimerModal from 'components/DisclaimerModal'
import { useUserIsInAffiliateListData } from 'hooks/useAffiliateSunsetList'
import { useUserAcknowledgement } from 'hooks/useUserAcknowledgement'

export function AffiliateSunsetModal() {
  const { t } = useTranslation()
  const isInList = useUserIsInAffiliateListData()
  const [ack, setACK] = useUserAcknowledgement('affiliate-referral-sunset-v2')
  const onConfirm = useCallback(() => setACK(true), [setACK])

  const [onOptionsConfirmModalPresent] = useModal(
    <DisclaimerModal
      bodyMaxWidth={['100%', '100%', '100%', '740px']}
      bodyMaxHeight="80vh"
      modalHeader={t('Important Update: Closure of the PancakeSwap Affiliate Program')}
      header={
        <>
          <Text mt="1.5rem">
            {t(`The PancakeSwap Affiliate Program will officially close on %time%`, {
              time: 'December 31, 2024',
            })}
          </Text>
          <Text mt="1.5rem">
            <Trans
              text={t(
                `Please %claim% any pending trading discounts before this date, as discount redemptions will no longer be available after that.`,
              )}
              data={{
                claim: (
                  <LinkExternal
                    bold
                    style={{ display: 'inline-flex' }}
                    showExternalIcon={false}
                    href="/affiliates-program/dashboard"
                  >
                    {t('claim')}
                  </LinkExternal>
                ),
              }}
            />
          </Text>
          <Text mt="1.5rem">
            {t(
              'If you were referred by an affiliate who enabled commission sharing, please note that trading discounts from their referral link ended on November 25, 2024, and you will no longer receive discounts from this date onwards.',
            )}
          </Text>
          <Text mt="1.5rem">
            {t('Thank you for your understanding and being a valued PancakeSwap community member.')}
          </Text>
        </>
      }
      id="affiliate-sunset-modal"
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
    if (isInList && ack === false) {
      onOptionsConfirmModalPresent()
    }
  }, [isInList, ack, onOptionsConfirmModalPresent])

  return null
}
