/**
 * used in main page hero part
 */

import { Text, VStack } from '@chakra-ui/react'
import { useAppStore } from '@/store'
import { heroGridientColorCSSBlock } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'

export default function PageHeroTitle({ title, description }: { title: string; description?: string }) {
  const isMobile = useAppStore((s) => s.isMobile)
  return (
    <VStack align="flex-start" gap="8px">
      {isMobile ? null : <Text {...heroGridientColorCSSBlock}>{title}</Text>}
      {description && (
        <Text fontSize={['sm', 'md']} color={colors.textSubtle}>
          {description}
        </Text>
      )}
    </VStack>
  )
}
