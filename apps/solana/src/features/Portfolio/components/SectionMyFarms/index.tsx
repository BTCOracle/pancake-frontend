import { Box, Flex, Grid, GridItem, Heading, HStack, Text, useDisclosure } from '@chakra-ui/react'
import { Button } from '@pancakeswap/uikit'
import { useMemo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { CreatePoolEntryDialog } from '@/features/Create/components/CreatePoolEntryDialog'
import useFetchFarmInfoById from '@/hooks/farm/useFetchFarmInfoById'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useCreatedFarmInfo, { FarmCategory } from '@/hooks/portfolio/farm/useCreatedFarmInfo'
import { useStateWithUrl } from '@/hooks/useStateWithUrl'
import { useAppStore } from '@/store/useAppStore'
import { colors } from '@/theme/cssVariables'
import FarmItem from './components/FarmItem'

export type CreateFarmTabValues = FarmCategory

export default function SectionMyCreatedFarms() {
  const { t } = useTranslation()
  const [filterType] = useStateWithUrl(FarmCategory.All, 'create_farm_tab', {
    fromUrl: (v) => v,
    toUrl: (v) => v
  })
  const publicKey = useAppStore((s) => s.publicKey)
  const { formattedData } = useCreatedFarmInfo({ owner: publicKey })

  const filteredData = useMemo(
    () => (filterType === FarmCategory.All ? formattedData : formattedData.filter((f) => f.type === filterType)),
    [formattedData, filterType]
  )
  const { formattedDataMap: farmDataMap } = useFetchFarmInfoById({
    idList: filteredData.filter((f) => f.type === FarmCategory.Standard).map((f) => f.id)
  })
  const { formattedDataMap } = useFetchPoolById({
    idList: filteredData.map((d) => d.id)
  })
  const { isOpen: isCreatePoolDialogOpen, onOpen: openCreatePoolDialog, onClose: closeCreatePoolDialog } = useDisclosure()

  const validFilteredData = filteredData.filter((farm) => {
    return farm.type !== FarmCategory.Clmm || formattedDataMap[farm.id]?.formattedRewardInfos.length !== 0
  })

  const hasValidFarm = Boolean(validFilteredData?.length)

  if (!hasValidFarm) return null
  return (
    <Box pt="20px">
      <Mobile>
        <HStack justifyContent="space-between" mt={6}>
          <Text>{t('My created farms')}</Text>
          <Button onClick={openCreatePoolDialog} size="xs" height="1.5rem" minHeight="1.5rem" px={3}>
            {t('Create Farm')}
          </Button>
          <CreatePoolEntryDialog isOpen={isCreatePoolDialogOpen} onClose={closeCreatePoolDialog} defaultType="standard-farm" />
        </HStack>
      </Mobile>
      <Desktop>
        <Grid
          flexGrow={1}
          gridTemplate={[
            `
          "title  .     " auto
          "tabs   action" auto / 1fr 1fr
        `,
            `
          "title title " auto
          "tabs  action" auto / 1fr 1fr
        `
          ]}
          columnGap={3}
          rowGap={[3, 2]}
          mb={3}
          mt={6}
          alignItems="center"
        >
          <GridItem area="title">
            <Heading id="my-created-farm" fontSize={['lg', 'xl']} fontWeight="500" color={colors.textPrimary}>
              {t('My created farms')}
            </Heading>
          </GridItem>
          <GridItem area="action" justifySelf="right">
            <>
              <Button onClick={openCreatePoolDialog} size={['sm', 'md']}>
                {t('Create Farm')}
              </Button>
              <CreatePoolEntryDialog isOpen={isCreatePoolDialogOpen} onClose={closeCreatePoolDialog} defaultType="standard-farm" />
            </>
          </GridItem>
        </Grid>
      </Desktop>

      <Flex direction="column" gap={4} mt={4}>
        {validFilteredData.map((farm) => (
          <FarmItem key={`farm-${farm.id}`} {...farm} standardFarm={farmDataMap[farm.id]} clmmData={formattedDataMap[farm.id]} />
        ))}
      </Flex>
    </Box>
  )
}
