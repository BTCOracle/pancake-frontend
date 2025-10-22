import { createContext } from 'react'
import { ObserveFn } from '@/hooks/useIntersectionObserver'

export const ListContext = createContext<{ observeFn?: ObserveFn<any> }>({})
