import { Box, QuestionHelperV2, RowBetween, ScanLink, Text, TextWithUnderline } from '@pancakeswap/uikit'
import { formatTimestamp, Precision } from '@pancakeswap/utils/formatTimestamp'
import { ChainLinkSupportChains } from 'state/info/constant'
import { getBlockExploreLink } from 'utils'
import { isAddress } from 'viem/utils'
import { shortenAddress } from 'views/V3Info/utils'

export function GiftInfoTimestamp({
  text,
  timestamp,
  toolipText,
}: {
  text: string
  timestamp: string
  toolipText?: string
}) {
  return (
    <RowBetween>
      {toolipText ? (
        <QuestionHelperV2 text={toolipText} placement="top">
          <TextWithUnderline color="textSubtle" small>
            {text}
          </TextWithUnderline>
        </QuestionHelperV2>
      ) : (
        <Text color="textSubtle" small>
          {text}
        </Text>
      )}
      <Text small>
        {formatTimestamp(new Date(timestamp).getTime(), {
          precision: Precision.MINUTE,
        })}
      </Text>
    </RowBetween>
  )
}

export function GiftInfoTxn({ text, txnHash, chainId }: { text: string; txnHash: string; chainId: number }) {
  return (
    <RowBetween>
      <Text color="textSubtle" small>
        {text}
      </Text>
      <ScanLink
        useBscCoinFallback={ChainLinkSupportChains.includes(chainId)}
        href={getBlockExploreLink(txnHash, 'transaction', chainId)}
      />
    </RowBetween>
  )
}

export function GiftInfoAddress({
  text,
  address,
  toolipText,
}: {
  text: string
  address?: string | null
  toolipText?: string
}) {
  return (
    <RowBetween>
      {toolipText ? (
        <QuestionHelperV2 text={toolipText} placement="top">
          <TextWithUnderline color="textSubtle" small>
            {text}
          </TextWithUnderline>
        </QuestionHelperV2>
      ) : (
        <Text color="textSubtle" small>
          {text}
        </Text>
      )}
      {address && isAddress(address) ? (
        <QuestionHelperV2 text={address} placement="top">
          <Text small>{address && isAddress(address) ? shortenAddress(address) : '-'}</Text>
        </QuestionHelperV2>
      ) : (
        <Text small>-</Text>
      )}
    </RowBetween>
  )
}

export function GiftInfoDescription({ text, description }: { text: string; description: string }) {
  return (
    <Box mb="16px">
      <Text bold mb="8px">
        {text}
      </Text>
      <Text color="textSubtle" small>
        {description}
      </Text>
    </Box>
  )
}
