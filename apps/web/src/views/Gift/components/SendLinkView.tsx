import { useTranslation } from '@pancakeswap/localization'
import { CurrencyAmount, NativeCurrency, Token } from '@pancakeswap/sdk'
import { Button, copyText, FlexGap, useToast } from '@pancakeswap/uikit'
import { NoteContainer } from 'components/NoteContainer'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useCalculateTotalCostCreateGift } from '../hooks/useCalculateTotalCostCreateGift'
import { generateClaimLink } from '../utils/generateClaimLink'
import { ShareGiftLinkButton } from './ShareGiftLinkButton'

export function SendLinkView({
  tokenAmount,
  nativeAmount,
  code,
}: {
  tokenAmount: CurrencyAmount<Token | NativeCurrency>
  nativeAmount?: CurrencyAmount<NativeCurrency>
  code: string
}) {
  const { t } = useTranslation()
  const claimLink = generateClaimLink({ code })
  const { toastSuccess } = useToast()

  const totalUsd = useCalculateTotalCostCreateGift({ tokenAmount, nativeAmount })

  const giftShareText = t(
    `Just sent you %totalUsd%! 🎉 Tap this link and to claim it: 👉 %claimLink%

Please connect your wallet to claim it!

Alternatively, you can manually enter the code %code% on PancakeSwap wallet to claim.`,
    {
      code,
      claimLink,
      totalUsd: formatDollarAmount(totalUsd),
    },
  )

  return (
    <>
      <NoteContainer mb="16px" p="8px">
        <pre style={{ textWrap: 'unset' }}>{giftShareText}</pre>
      </NoteContainer>

      <FlexGap flexDirection="row" gap="8px">
        <ShareGiftLinkButton text={giftShareText} claimLink={claimLink} />

        <Button
          variant="danger"
          width="100%"
          onClick={() => {
            copyText(giftShareText)
            toastSuccess(t('Claim code'), t('Copied!'))
          }}
        >
          {t('Copy')}
        </Button>
      </FlexGap>
    </>
  )
}
