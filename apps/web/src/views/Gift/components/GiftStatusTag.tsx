import { Tag } from '@pancakeswap/uikit'
import { GiftStatus } from '../types'

const getStatusVariant = (status: GiftStatus) => {
  switch (status) {
    case GiftStatus.PENDING:
      return 'warning'
    case GiftStatus.CLAIMED:
      return 'success'
    case GiftStatus.CANCELLED:
      return 'failure'
    case GiftStatus.EXPIRED:
      return 'textDisabled'
    case GiftStatus.REQUESTED_CLAIM:
      return 'warning'
    case GiftStatus.UNCLAIMABLE:
      return 'failure'
    default:
      return 'primary'
  }
}

const getStatusText = (status: GiftStatus) => {
  switch (status) {
    case GiftStatus.PENDING:
      return 'Pending'
    case GiftStatus.CLAIMED:
      return 'Claimed'
    case GiftStatus.CANCELLED:
      return 'Cancelled'
    case GiftStatus.EXPIRED:
      return 'Expired'
    case GiftStatus.REQUESTED_CLAIM:
      return 'Requested'
    case GiftStatus.UNCLAIMABLE:
      return 'Unclaimable'
    default:
      return status
  }
}

export const GiftStatusTag = ({ status }: { status: GiftStatus }) => {
  return (
    <Tag variant={getStatusVariant(status)} scale="sm" outline>
      {getStatusText(status)}
    </Tag>
  )
}
