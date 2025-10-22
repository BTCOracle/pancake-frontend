import { RefObject } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import Steps, { StepsRef } from '@/components/Steps'
import { useAppStore } from '@/store'

export default function Stepper({ stepRef, onChange }: { stepRef?: RefObject<StepsRef>; onChange: (step: number) => void }) {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  return (
    <Steps
      variant={isMobile ? 'row-title' : 'column-list'}
      ctrSx={{ height: 'fit-content', width: ['unset', 'clamp(300px, 100%, 500px)'] }}
      steps={[
        { title: t('Step %num%', { num: 1 }), description: t('Select token & fee tier') },
        { title: t('Step %num%', { num: 2 }), description: t('Set initial price & range') },
        { title: t('Step %num%', { num: 3 }), description: t('Enter deposit amount') }
      ]}
      onChange={onChange}
      ref={stepRef}
    />
  )
}
