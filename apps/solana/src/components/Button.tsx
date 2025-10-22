import { ButtonProps as ChakraButtonProps, Button as ChakraButton } from '@chakra-ui/react'
import { forwardRef, useMemo } from 'react'
import { MayArray, MayFunction } from '@pancakeswap/solana-core-sdk'
import { shrinkToValue } from '@/utils/shrinkToValue'

/**
 * migrated from V2, and have pre-defined style
 */
export interface ButtonProps extends Omit<ChakraButtonProps, 'colorScheme'> {
  variant?:
    | 'solid'
    | 'solid-dark' // not shining eye-breaking gradient button
    | 'outline'
    | 'ghost'
    | 'link'
    | 'unstyled'
    | 'capsule'
    | 'capsule-radio'
    | 'rect-rounded-radio'
  validators?: MayArray<{
    /** must return true to pass this validator */
    should: MayFunction<any>
    // used in "connect wallet" button, it's order is over props: disabled
    forceActive?: boolean
    /**  items are button's setting which will apply when corresponding validator has failed */
    fallbackProps?: Omit<ButtonProps, 'validators'>
  }>
}

export default forwardRef(function Button({ validators, ...restProps }: ButtonProps, ref) {
  const mergedProps: Omit<ButtonProps, 'validators'> = useMemo(() => {
    const failedValidator = (Array.isArray(validators) ? validators.length > 0 : validators)
      ? [validators!].flat().find(({ should }) => !shrinkToValue(should))
      : undefined
    return failedValidator
      ? {
          ...restProps,
          ...failedValidator.fallbackProps,
          isDisabled: true,
          isActive: failedValidator.forceActive
        }
      : restProps
  }, [restProps, validators])
  return <ChakraButton ref={ref as any} _hover={{ opacity: '0.65' }} {...mergedProps} />
})
