import { Route } from '@pancakeswap/smart-router'
import { Currency } from '@pancakeswap/swap-sdk-core'

export type RouteDisplayEssentials = Pick<Route, 'path' | 'pools' | 'inputAmount' | 'outputAmount' | 'percent' | 'type'>

export type Pair = [Currency, Currency]
