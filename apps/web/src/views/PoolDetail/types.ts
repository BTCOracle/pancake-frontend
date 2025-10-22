export enum TimeFilter {
  D = 'D',
  W = 'W',
  M = 'M',
  Y = 'Y',
  All = 'All',
}

export const TIME_FILTERS_MAPPING = {
  D: '1D',
  W: '1W',
  M: '1M',
  Y: '1Y',
  All: '1Y',
} as const
