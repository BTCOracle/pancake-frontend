import { atom } from 'jotai'
import { OrderStatus } from '../../types/orders.types'

// Page cursor storage for consistent navigation
export interface PageCursor {
  startCursor: string | null
  endCursor: string | null
}

// Cursor-based pagination state
export const currentCursorAtom = atom<string | null>(null)
export const pageCursorsAtom = atom<Map<number, PageCursor>>(new Map()) // Store cursors for each page
export const paginationDirectionAtom = atom<'forward' | 'backward' | null>(null)

// Page number tracking
export const currentPageAtom = atom<number>(1)

// Order status filter state
export const filterOrderStatusAtom = atom<OrderStatus | undefined>(undefined)

// Derived atoms for navigation
export const canGoBackAtom = atom((get) => {
  const currentPage = get(currentPageAtom)
  return currentPage > 1
})

// Reset pagination action atom
export const resetPaginationAtom = atom(null, (get, set) => {
  set(currentCursorAtom, null)
  set(pageCursorsAtom, new Map())
  set(paginationDirectionAtom, null)
  set(currentPageAtom, 1)
})

// Toggle open filter action atom
export const toggleOpenFilterAtom = atom(null, (get, set) => {
  const current = get(filterOrderStatusAtom)
  set(filterOrderStatusAtom, current === OrderStatus.Open ? undefined : OrderStatus.Open)
  // Reset pagination when filter changes
  set(resetPaginationAtom)
})
