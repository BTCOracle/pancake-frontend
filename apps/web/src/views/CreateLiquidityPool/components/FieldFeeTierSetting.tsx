import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, ButtonMenu, ButtonMenuItem, FlexGap, PreTitle, QuestionHelper, Text } from '@pancakeswap/uikit'
import { useCallback } from 'react'
import { useFeeTierSettingQueryState } from 'state/infinity/create'

export type FieldFeeTierSettingProps = BoxProps

export const FieldFeeTierSetting: React.FC<FieldFeeTierSettingProps> = ({ ...boxProps }) => {
  const { t } = useTranslation()
  const [feeTierSetting, setFeeTierSetting] = useFeeTierSettingQueryState()
  const handleFeeTierSettingChange = useCallback(
    (index: number) => {
      setFeeTierSetting(index === 0 ? 'static' : 'dynamic')
    },
    [setFeeTierSetting],
  )

  return (
    <Box {...boxProps}>
      <FlexGap gap="4px">
        <PreTitle mb="8px">{t('Fee Tier Setting')}</PreTitle>
        <QuestionHelper
          mb="8px"
          color="secondary"
          placement="auto"
          text={
            <>
              <Text>{t('Static: The fee remains fixed at the specified level once the pool is created.')}</Text>
              <Text mt="12px">
                {t(
                  'Dynamic: The fee can be modified using hook after the pool is created. Initial fee level is set to 0',
                )}
              </Text>
            </>
          }
        />
      </FlexGap>
      <ButtonMenu
        activeIndex={feeTierSetting === 'static' ? 0 : 1}
        onItemClick={handleFeeTierSettingChange}
        variant="subtle"
        fullWidth
      >
        <ButtonMenuItem height="38px">{t('Static')}</ButtonMenuItem>
        <ButtonMenuItem height="38px">{t('Dynamic')}</ButtonMenuItem>
      </ButtonMenu>
    </Box>
  )
}
