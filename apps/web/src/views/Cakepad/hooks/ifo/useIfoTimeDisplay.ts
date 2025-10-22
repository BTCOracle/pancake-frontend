import { useMemo } from 'react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(timezone)

export const useIfoTimeDisplay = (timestamp?: number) => {
  return useMemo(() => {
    if (!timestamp) {
      return { date: '--', time: '--' }
    }
    return {
      date: dayjs.unix(timestamp).format('DD-MM-YYYY'),
      time: dayjs.unix(timestamp).tz('Asia/Singapore').format('HH:mm'),
    }
  }, [timestamp])
}

export default useIfoTimeDisplay
