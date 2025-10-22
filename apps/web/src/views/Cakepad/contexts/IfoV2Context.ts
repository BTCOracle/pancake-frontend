import { createContext } from 'react'
import type { IfoV2ContextType } from '../ifov2.types'

export const IfoV2Context = createContext<IfoV2ContextType | null>(null)
