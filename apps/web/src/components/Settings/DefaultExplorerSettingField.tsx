import React from 'react'
import { Button, Text, Image, Box, Flex, QuestionHelper } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'
import { useAtom } from 'jotai'
import { solanaExplorerAtom, supportedExplorers } from '@pancakeswap/utils/user'

const ExplorerContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`

const FieldContainer = styled.div`
  width: 100%;
`

export const DefaultExplorerSettingField: React.FC = () => {
  const { t } = useTranslation()
  const [currentExplorer, setCurrentExplorer] = useAtom(solanaExplorerAtom)

  return (
    <FieldContainer>
      <Flex mb="12px">
        <Text>{t('Default Explorer')}</Text>
        <QuestionHelper text={t('Select preferred block explorer')} placement="top" ml="4px" />
      </Flex>

      <ExplorerContainer>
        {supportedExplorers.map((explorer) => (
          <Button
            startIcon={
              <Box height={18} width={18}>
                <Image src={explorer.icon} height={18} width={18} alt={explorer.name} />
              </Box>
            }
            key={explorer.name}
            scale="sm"
            variant={currentExplorer.host === explorer.host ? 'primary' : 'tertiary'}
            onClick={() => setCurrentExplorer(explorer.host)}
          >
            {explorer.name}
          </Button>
        ))}
      </ExplorerContainer>
    </FieldContainer>
  )
}
