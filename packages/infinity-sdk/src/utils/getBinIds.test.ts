import { expect, test } from 'vitest'
import { getBinIds } from './getBinIds'

test('get bin ids', () => {
  expect(getBinIds(100, 3)).toStrictEqual([99, 100, 101])
  expect(getBinIds(100, 4)).toStrictEqual([98, 99, 100, 101])
})
