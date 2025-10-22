import { Box, Flex, Grid, GridItem, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import { Input } from '@pancakeswap/uikit'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SelectSingleEventHandler } from 'react-day-picker'

import Button from '@/components/Button'
import { DatePick, HourPick, MinutePick } from '@/components/DateTimePicker'
import { colors } from '@/theme/cssVariables'
import { getUTCOffset } from '@/utils/date'
import { MIN_DURATION_DAYS, MAX_DURATION_DAYS } from '@/store/configs/farm'
import ResponsiveModal from './ResponsiveModal'

dayjs.extend(utc)

export type FarmPeriodModalProps = {
  isOpen: boolean
  onConfirm: (start: number, end: number) => void
  onClose: () => void
  farmStart: number | undefined
  farmDuration?: number
}

export default function FarmDatePickerModal({
  isOpen,
  onConfirm,
  onClose,
  farmStart,
  farmDuration = MIN_DURATION_DAYS
}: FarmPeriodModalProps) {
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState<Date>(dayjs(farmStart).toDate())
  const [startHour, setStartHour] = useState(dayjs(farmStart).hour())
  const [startMinute, setStartMinute] = useState<number>(
    dayjs(farmStart)
      .add(farmStart ? 0 : 15, 'minutes')
      .minute()
  )
  const [durationDays, setDurationDays] = useState<string | number>(farmDuration)
  const [hours, setHours] = useState<string[]>([])

  const endDate = useMemo(() => {
    return dayjs(startDate)
      .add(durationDays ? Number(durationDays) : 0, 'day')
      .format('YYYY/MM/DD')
  }, [startDate, durationDays])

  const onDateSelect: SelectSingleEventHandler = useCallback(
    (_, selected) => {
      setStartDate(dayjs(selected).hour(startHour).minute(startMinute).toDate())
    },
    [startHour, startMinute]
  )

  const onDurationChange = useCallback((valString: string, valueAsNumber: number) => {
    setDurationDays(valString ? valueAsNumber : valString)
  }, [])

  const handleConfirm = useCallback(() => {
    const newDate = new Date(startDate.valueOf())
    onConfirm(startDate.valueOf(), newDate.setDate(newDate.getDate() + (durationDays ? Number(durationDays) : MIN_DURATION_DAYS)).valueOf())
  }, [startDate, durationDays, onConfirm])

  useEffect(() => {
    setStartDate((val) => dayjs(val).hour(startHour).minute(startMinute).toDate())
  }, [startHour, startMinute])

  useEffect(() => {
    const today = dayjs()
    const isToday = today.isSame(startDate, 'day')
    if (isToday) {
      const currentHour = today.hour()
      const hours: string[] = Array.from({ length: 24 - currentHour }, (_, idx) => (idx + currentHour).toString().padStart(2, '0'))
      setHours(hours)
    } else {
      setHours([])
    }
  }, [startDate])

  return (
    <ResponsiveModal size="2xl" title={t('Farm period')} isOpen={isOpen} onClose={onClose} propOfModalContent={{ borderRadius: '20px' }}>
      <Grid
        gridTemplate={[
          `
          "calendar" auto
          "time    " auto
          "duration" auto
          "end     " auto / 1fr
        `,
          `
          "calendar time    " 1fr
          "calendar duration" 1fr
          "calendar end     " 1fr / auto 240px
        `
        ]}
        columnGap={5}
        rowGap={[4, 0]}
      >
        <GridItem area="calendar">
          <SimpleGrid autoFlow="row" gap={[4, 3]}>
            <Title value={t('Start on')} />
            <Box>
              <DatePick mode="single" selected={startDate} onSelect={onDateSelect} required />
            </Box>
          </SimpleGrid>
        </GridItem>

        <GridItem area="time">
          <SimpleGrid autoFlow={['column', 'row']} templateColumns={['20% 1fr', 'unset']} gap={[4, 3]} alignItems="center">
            <Title value={t('Start at')} />
            <HStack spacing={3}>
              <HourPick
                sx={{ flex: 1 }}
                value={startHour}
                defaultValues={hours}
                onChange={setStartHour}
                contentSx={{ borderRadius: '16px' }}
              />
              <MinutePick sx={{ flex: 1 }} value={startMinute} onChange={setStartMinute} contentSx={{ borderRadius: '16px' }} />
            </HStack>
          </SimpleGrid>
        </GridItem>

        <GridItem area="duration">
          <SimpleGrid autoFlow={['column', 'row']} templateColumns={['20% 1fr', 'unset']} gap={[4, 3]} alignItems="center">
            <Title value={t('Duration')} />
            <Input
              value={durationDays}
              onInput={(e) => onDurationChange(e.currentTarget.value, Number(e.currentTarget.value))}
              placeholder="0.0"
              min={MIN_DURATION_DAYS}
              max={MAX_DURATION_DAYS}
              step={1}
              style={{ textAlign: 'right' }}
            />
          </SimpleGrid>
          <Text color={colors.textSubtle} fontSize="xs" mt={1} textAlign="right">
            {t(`Enter value between %min% and %max%`, { min: MIN_DURATION_DAYS, max: MAX_DURATION_DAYS })}
          </Text>
        </GridItem>

        <GridItem area="end">
          <SimpleGrid
            h="full"
            justifyContent="center"
            alignItems="center"
            border={`1px solid ${colors.cardBorder01}`}
            bg={colors.cardSecondary}
            borderRadius="20px"
            py={4}
            gap={1}
            columnGap={4}
            gridTemplate={[
              `
              "label  label" auto
              "date   time " auto / auto auto
            `,
              `
              "label" auto
              "date " auto
              "time " auto / auto
            `
            ]}
          >
            <Text gridArea="label" textAlign="center" fontSize="sm" fontWeight={600}>
              {t('Farm will end at')}
            </Text>
            <Text gridArea="date" width="100%" textAlign={['right', 'center']} fontWeight={600}>
              {endDate}
            </Text>
            <Text gridArea="time" textAlign="center" color={colors.textSubtle} fontWeight={400} fontSize="sm">
              {dayjs(startDate)
                .add(durationDays ? Number(durationDays) : 0, 'day')
                .format('HH:mm')}{' '}
              (UTC{getUTCOffset()})
            </Text>
          </SimpleGrid>
        </GridItem>
      </Grid>

      <Flex justifyContent="space-between" mt={8} gap={3}>
        <Button width="100%" onClick={onClose} variant="outline">
          {t('Cancel')}
        </Button>
        <Button
          width="100%"
          isDisabled={
            Number.isNaN(Number(durationDays)) ||
            Number(durationDays) < MIN_DURATION_DAYS ||
            Number(durationDays) > MAX_DURATION_DAYS ||
            dayjs(startDate).isBefore(dayjs(), 'minute')
          }
          onClick={handleConfirm}
        >
          {t('Confirm')}
        </Button>
      </Flex>
    </ResponsiveModal>
  )
}

function Title({ value }: { value: string }) {
  return (
    <Text fontWeight="medium" fontSize="sm">
      {value}
    </Text>
  )
}
