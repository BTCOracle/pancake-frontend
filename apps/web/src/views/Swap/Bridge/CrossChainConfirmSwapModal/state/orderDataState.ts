import { atom } from 'jotai'
import { ActiveBridgeOrderMetadata } from '../../types'

export const activeBridgeOrderMetadataAtom = atom<ActiveBridgeOrderMetadata | null>(null)
