import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from '@pancakeswap/localization'
import useFetchOwnerIdo from '@/hooks/portfolio/useFetchOwnerIdo'
import useFetchIdoKeys from '@/hooks/portfolio/useFetchIdoKeys'
import { colors } from '@/theme/cssVariables/colors'
import { useAppStore } from '@/store'
import IdoRowItem from './components/IdoRowItem'

export default function SectionAcceleraytor() {
  const { t } = useTranslation()

  const publicKey = useAppStore((s) => s.publicKey)
  const { formattedData, isLoading } = useFetchOwnerIdo({
    owner: publicKey?.toString()
  })
  const { dataMap: keysDataMap } = useFetchIdoKeys({ idList: formattedData.map((d) => d.poolId) })
  if ((!isLoading && !formattedData.length) || formattedData.length === 0) return null

  return (
    <Box pt="20px">
      <Heading id="acceleraytor" fontSize={['lg', 'xl']} fontWeight="500" mb={[3, 4]} mt={6} color={colors.textPrimary}>
        {t('Acceleraytor')}
      </Heading>
      <Text color={colors.textSecondary} fontSize={['sm', 'md']} mb={2}>
        {t('You have unclaimed funds from AcceleRaytor. Remaining funds can be claimed below.')}
      </Text>
      <VStack align="stretch" spacing={3}>
        {formattedData.map((data) => (
          <IdoRowItem key={data.poolId} idoKeys={keysDataMap[data.poolId]} {...data} />
        ))}
      </VStack>
    </Box>
  )
}
