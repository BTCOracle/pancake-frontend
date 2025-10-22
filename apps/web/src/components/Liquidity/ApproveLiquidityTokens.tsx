import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { Box, Button, Dots, FlexGap, Link, Message, MessageText } from '@pancakeswap/uikit'
import { CurrencyField as Field } from 'utils/types'
import { styled } from 'styled-components'
import { Address } from 'viem'

const InlineLink = styled(Link)`
  display: inline-flex;
  text-decoration: underline;
  color: #d67e0a;
`

interface ApproveLiquidityTokensProps {
  currencies: {
    [Field.CURRENCY_A]?: Currency
    [Field.CURRENCY_B]?: Currency
  }
  shouldShowApprovalGroup: boolean

  showFieldAApproval: boolean
  requireRevokeA: boolean
  isApprovingA: boolean
  isRevokingA: boolean
  approveACallback: () => Promise<{ hash: Address } | undefined>
  revokeACallback: () => Promise<{ hash: Address } | undefined>

  showFieldBApproval: boolean
  requireRevokeB: boolean
  isApprovingB: boolean
  isRevokingB: boolean
  approveBCallback: () => Promise<{ hash: Address } | undefined>
  revokeBCallback: () => Promise<{ hash: Address } | undefined>
}

/**
 * Approve Liquidity Tokens with support for Permit2 states
 */
export default function ApproveLiquidityTokens({
  shouldShowApprovalGroup,
  showFieldAApproval,
  isApprovingA,
  isRevokingA,
  approveACallback,
  revokeACallback,
  currencies,
  showFieldBApproval,
  isApprovingB,
  isRevokingB,
  approveBCallback,
  revokeBCallback,
  requireRevokeA,
  requireRevokeB,
}: ApproveLiquidityTokensProps) {
  const { t } = useTranslation()

  // Revokes are needed for USDT on Ethereum, BUSD on BSC Testnet and USDC on Goerli
  const anyRevokeNeeded = requireRevokeA || requireRevokeB

  return shouldShowApprovalGroup ? (
    <Box>
      {anyRevokeNeeded && (
        <Message mb="8px" variant="warning">
          <MessageText>
            <span>
              {t('USDT on Ethereum requires resetting approval when spending allowances are too low.')}{' '}
              <InlineLink
                external
                fontSize={14}
                href="https://docs.pancakeswap.finance/products/pancakeswap-exchange/faq#why-do-i-need-to-reset-approval-on-usdt-before-enabling-approving"
              >
                {t('Learn More')}
                {' >>'}
              </InlineLink>
            </span>
          </MessageText>
        </Message>
      )}
      <FlexGap flexDirection="column" gap="8px">
        {showFieldAApproval &&
          (requireRevokeA ? (
            <Button onClick={revokeACallback} disabled={isRevokingA} width="100%">
              {isRevokingA ? (
                <Dots>{t('Reset Approval on USDT', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Dots>
              ) : (
                t('Reset Approval on USDT', { asset: currencies[Field.CURRENCY_A]?.symbol })
              )}
            </Button>
          ) : (
            <Button onClick={approveACallback} disabled={isApprovingA} width="100%">
              {isApprovingA ? (
                <Dots>{t('Enabling %asset%', { asset: currencies[Field.CURRENCY_A]?.symbol })}</Dots>
              ) : (
                t('Enable %asset%', { asset: currencies[Field.CURRENCY_A]?.symbol })
              )}
            </Button>
          ))}
        {showFieldBApproval &&
          (requireRevokeB ? (
            <Button onClick={revokeBCallback} disabled={isRevokingB} width="100%">
              {isRevokingB ? (
                <Dots>{t('Reset Approval on USDT', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Dots>
              ) : (
                t('Reset Approval on USDT', { asset: currencies[Field.CURRENCY_B]?.symbol })
              )}
            </Button>
          ) : (
            <Button onClick={approveBCallback} disabled={isApprovingB} width="100%">
              {isApprovingB ? (
                <Dots>{t('Enabling %asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })}</Dots>
              ) : (
                t('Enable %asset%', { asset: currencies[Field.CURRENCY_B]?.symbol })
              )}
            </Button>
          ))}
      </FlexGap>
    </Box>
  ) : null
}
