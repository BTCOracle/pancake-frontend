import { get } from './fns'
import memoize from './memoize'

const Latinise = {
  latin_map: {
    τ: 't',
    Τ: 'T',
    '₮': 'T',
  },
}

const latinise = memoize((input: string) => {
  return input.replace(/[^A-Za-z0-9[\] ]/g, (x: string) => get(Latinise, `latin_map.${x}`) || x)
})

export default latinise
