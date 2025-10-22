import { useTranslation } from '@pancakeswap/localization'
import { Box, Button, ButtonMenu, ButtonMenuItem, Flex, Input, ModalV2, Text } from '@pancakeswap/uikit'
import React, { useCallback, useState } from 'react'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { ChainId } from '@pancakeswap/chains'
import { PriorityLevel, PriorityMode, useSolanaPriorityFee } from './hooks/useSolanaPriorityFee'

interface SolanaPriorityFeeModalProps {
  isOpen: boolean
  onDismiss: () => void
  onSave?: (fee: number) => void
}

export const SolanaPriorityFeeModal: React.FC<SolanaPriorityFeeModalProps> = ({ isOpen, onDismiss, onSave }) => {
  const { t } = useTranslation()
  const {
    feeConfig,
    priorityLevel,
    priorityMode,
    transactionFee,
    currentFee,
    isFeeTooLow,
    updatePriorityLevel,
    updatePriorityMode,
    updateTransactionFee,
    fetchPriorityFee,
  } = useSolanaPriorityFee()

  // Local state for editing
  const [tempPriorityLevel, setTempPriorityLevel] = useState(priorityLevel)
  const [tempPriorityMode, setTempPriorityMode] = useState(priorityMode)
  const [tempFee, setTempFee] = useState(transactionFee.toString())

  // Get SOL price for USD display
  const nativeCurrency = useNativeCurrency(ChainId.BSC) // Temporarily use BSC, need SOLANA chainId in actual use
  const { data: solPrice } = useCurrencyUsdPrice(nativeCurrency)

  const handleSave = useCallback(() => {
    const feeValue = parseFloat(tempFee)

    if (Number.isNaN(feeValue) || feeValue <= 0) {
      return
    }

    updatePriorityLevel(tempPriorityLevel)
    updatePriorityMode(tempPriorityMode)
    updateTransactionFee(feeValue)

    onSave?.(feeValue)
    onDismiss()
  }, [
    tempPriorityLevel,
    tempPriorityMode,
    tempFee,
    updatePriorityLevel,
    updatePriorityMode,
    updateTransactionFee,
    onSave,
    onDismiss,
  ])

  const handleRefresh = useCallback(async () => {
    await fetchPriorityFee()
  }, [fetchPriorityFee])

  // Calculate USD value
  const feeUsdValue = solPrice ? (currentFee * solPrice).toFixed(4) : '0.00'
  const tempFeeUsdValue = solPrice ? (parseFloat(tempFee) * solPrice).toFixed(4) : '0.00'

  return (
    <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
      <Box p="24px" maxWidth="400px" width="100%">
        {/* Title */}
        <Flex alignItems="center" justifyContent="space-between" mb="16px">
          <Text fontSize="20px" fontWeight="600">
            {t('Transaction Priority Fee')}
          </Text>
          <Button variant="text" scale="sm" onClick={handleRefresh}>
            🔄
          </Button>
        </Flex>

        <Text fontSize="14px" color="textSubtle" mb="20px">
          {t(
            'Priority fees are paid to Solana validators to prioritize your transaction. Higher fees result in faster processing.',
          )}
        </Text>

        {/* Priority Mode Toggle */}
        <Box mb="20px">
          <Text fontSize="14px" fontWeight="600" mb="12px">
            {t('Priority Mode')}
          </Text>
          <ButtonMenu
            scale="sm"
            variant="subtle"
            onItemClick={(index) => setTempPriorityMode(index)}
            activeIndex={tempPriorityMode}
            fullWidth
          >
            <ButtonMenuItem>{t('Max Cap')}</ButtonMenuItem>
            <ButtonMenuItem>{t('Exact Fee')}</ButtonMenuItem>
          </ButtonMenu>
          <Text fontSize="12px" color="textSubtle" mt="8px">
            {tempPriorityMode === PriorityMode.MaxCap
              ? t('Auto-optimize fees with a maximum cap to prevent overpaying.')
              : t('Use the exact fee amount specified below.')}
          </Text>
        </Box>

        {/* Priority Level (only shown in Max Cap mode) */}
        {tempPriorityMode === PriorityMode.MaxCap && (
          <Box mb="20px">
            <Text fontSize="14px" fontWeight="600" mb="12px">
              {t('Priority Level')}
            </Text>
            <ButtonMenu
              scale="sm"
              variant="subtle"
              onItemClick={(index) => setTempPriorityLevel(index)}
              activeIndex={tempPriorityLevel}
              fullWidth
            >
              <ButtonMenuItem>
                <Flex flexDirection="column" alignItems="center">
                  <Text fontSize="14px">{t('Fast')}</Text>
                  <Text fontSize="10px" color="textSubtle">
                    {(feeConfig[PriorityLevel.Fast] || 0).toFixed(6)} SOL
                  </Text>
                </Flex>
              </ButtonMenuItem>
              <ButtonMenuItem>
                <Flex flexDirection="column" alignItems="center">
                  <Text fontSize="14px">{t('Turbo')}</Text>
                  <Text fontSize="10px" color="textSubtle">
                    {(feeConfig[PriorityLevel.Turbo] || 0).toFixed(6)} SOL
                  </Text>
                </Flex>
              </ButtonMenuItem>
              <ButtonMenuItem>
                <Flex flexDirection="column" alignItems="center">
                  <Text fontSize="14px">{t('Ultra')}</Text>
                  <Text fontSize="10px" color="textSubtle">
                    {(feeConfig[PriorityLevel.Ultra] || 0).toFixed(6)} SOL
                  </Text>
                </Flex>
              </ButtonMenuItem>
            </ButtonMenu>
          </Box>
        )}

        {/* Fee Input */}
        <Box mb="20px">
          <Flex justifyContent="space-between" alignItems="center" mb="8px">
            <Text fontSize="14px" fontWeight="600">
              {tempPriorityMode === PriorityMode.MaxCap ? t('Max Cap') : t('Exact Fee')}
            </Text>
            <Text fontSize="12px" color="textSubtle">
              ≈ ${tempFeeUsdValue}
            </Text>
          </Flex>
          <Input
            type="number"
            value={tempFee}
            onChange={(e) => setTempFee(e.target.value)}
            placeholder={t('Enter amount in SOL')}
            step="0.000001"
            min="0"
          />
        </Box>

        {/* Warning message */}
        {isFeeTooLow && parseFloat(tempFee) < (feeConfig[PriorityLevel.Fast] || 0.000001) && (
          <Box bg="warning" borderRadius="12px" p="12px" mb="16px">
            <Text fontSize="14px" color="warningContrast">
              {t('Your fee is below the recommended minimum. This may result in slower transaction processing.')}
            </Text>
          </Box>
        )}

        {/* Current fee preview */}
        <Box bg="backgroundAlt" borderRadius="12px" p="16px" mb="20px">
          <Text fontSize="14px" color="textSubtle" mb="8px">
            {t('Current Priority Fee')}
          </Text>
          <Flex justifyContent="space-between" alignItems="center">
            <Text fontSize="16px" fontWeight="600">
              {currentFee.toFixed(6)} SOL
            </Text>
            <Text fontSize="14px" color="textSubtle">
              ≈ ${feeUsdValue}
            </Text>
          </Flex>
        </Box>

        {/* Action buttons */}
        <Flex style={{ gap: '12px' }}>
          <Button variant="secondary" onClick={onDismiss} width="100%">
            {t('Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            width="100%"
            disabled={Number.isNaN(parseFloat(tempFee)) || parseFloat(tempFee) <= 0}
          >
            {t('Save')}
          </Button>
        </Flex>
      </Box>
    </ModalV2>
  )
}
