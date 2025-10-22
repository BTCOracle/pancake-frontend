import { Box, Flex, HStack, SystemStyleObject, Text, useSteps } from '@chakra-ui/react'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { CircleCheckForStep } from '@/icons/misc/CircleCheckFill'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'

type StepItem = {
  title: string
  description: string
}

type StepsProps = {
  /** @default 'column-list' */
  variant?: 'column-list' | 'row-title'
  ctrSx?: SystemStyleObject
  steps: StepItem[]
  /** change this will set active step value */
  currentIndex?: number
  onChange?: (step: number) => void
}

export type StepsRef = {
  goTo: (stepIndex: number) => void
  goToNext: () => void
  goToPrevious: () => void
  setActiveStep: (step: number) => void
}

function Steps({ currentIndex, variant, ctrSx, steps, onChange }: StepsProps, ref: React.Ref<StepsRef>) {
  const {
    activeStep: activeStepIndex,
    goToNext,
    goToPrevious,
    isIncompleteStep,
    isCompleteStep,
    setActiveStep
  } = useSteps({
    index: currentIndex,
    count: steps.length
  })

  const activeStep: StepItem | undefined = steps[activeStepIndex]

  useEffect(() => {
    onChange?.(activeStepIndex)
  }, [onChange, activeStepIndex])

  useImperativeHandle(
    ref,
    () => ({
      goTo: setActiveStep,
      goToNext,
      setActiveStep,
      goToPrevious
    }),
    [goToNext, setActiveStep, goToPrevious]
  )

  if (steps.length > 0) {
    return variant === 'row-title' ? (
      <Box>
        <HStack {...panelCard} px="16px" py="8px" justifyContent="space-between" alignItems="center">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex
            const isComplete = isCompleteStep(idx)
            return (
              <>
                <Flex key={`stepper-${step.title}`} data-active={isActive} align="center" opacity={isActive || isComplete ? '1' : '0.7'}>
                  <Box minW={10} h={10} p="5px" borderRadius="full">
                    <Flex
                      justify="center"
                      align="center"
                      w="full"
                      h="full"
                      borderRadius="full"
                      bg={colors.stepHoofBg}
                      fontWeight="600"
                      fontSize="lg"
                      color={isActive || isComplete ? colors.textPrimary : colors.textSubtle}
                    >
                      {idx + 1}
                    </Flex>
                  </Box>
                  <Flex direction="column" justify="center" gap={1}>
                    <Text
                      fontSize="sm"
                      fontWeight={600}
                      color={isActive || isComplete ? colors.textPrimary : colors.textSubtle}
                      lineHeight="normal"
                      whiteSpace="nowrap"
                    >
                      {step.title}
                    </Text>
                  </Flex>
                </Flex>
              </>
            )
          })}
        </HStack>
        <Text color={colors.textSecondary} fontWeight={600} fontSize="xl" align="center" pt={4}>
          {activeStep.description}
        </Text>
      </Box>
    ) : (
      <Flex {...panelCard} direction="column" overflow="hidden" w="full" sx={ctrSx}>
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIndex
          const isComplete = isCompleteStep(idx)
          const isIncomplete = isIncompleteStep(idx)
          return (
            <Box key={`stepper-${step.title}`} position="relative" py={7} px={9}>
              <Flex
                className="stpe"
                opacity={isIncomplete ? 0.7 : 1}
                cursor={isIncomplete ? 'default' : 'pointer'}
                onClick={
                  isIncomplete
                    ? undefined
                    : () => {
                        setActiveStep(idx)
                      }
                }
              >
                <Box minW="50px" h="50px" p="5px" borderRadius="25px">
                  <Flex
                    justify="center"
                    align="center"
                    w="full"
                    h="full"
                    borderRadius="25px"
                    bg={colors.stepHoofBg}
                    fontWeight="600"
                    fontSize="2xl"
                    color={isActive || isComplete ? colors.textPrimary : colors.textSubtle}
                  >
                    {idx + 1}
                  </Flex>
                </Box>
                <Flex pl={1} direction="column" justify="center" gap={1}>
                  <Text
                    fontSize="md"
                    fontWeight={600}
                    color={isActive || isComplete ? colors.textPrimary : colors.textSubtle}
                    lineHeight="normal"
                  >
                    {step.title}
                  </Text>
                  <Text color={colors.textSubtle} fontSize="sm" fontWeight={500} lineHeight="normal">
                    {step.description}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          )
        })}
      </Flex>
    )
  }

  return null
}

export default forwardRef(Steps)
