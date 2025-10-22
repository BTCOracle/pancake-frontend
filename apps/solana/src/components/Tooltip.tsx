import { Box, BoxProps, Popover, PopoverArrow, PopoverContent, PopoverProps, PopoverTrigger, Portal, forwardRef } from '@chakra-ui/react'
import { ReactNode, useCallback, useEffect, useMemo, useRef } from 'react'
import { useHover } from '@/hooks/useHover'
import { useOutsideClick } from '@/hooks/useOutsideClick'
import { colors } from '@/theme/cssVariables'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { useAppStore } from '@/store'
import { useDisclosure } from '../hooks/useDelayDisclosure'

export type TooltipHandles = {
  open(): void
  close(): void
}

function PopoverContentWrapper({ usePortal: usePortal_, children: children_ }: { usePortal?: boolean; children?: ReactNode }) {
  if (usePortal_) {
    return <Portal>{children_}</Portal>
  }
  return <>{children_}</>
}

let prevTooltipHandler: TooltipHandles | undefined
/**
 * build-in chakra's Tooltip is **NOT** interactive.Popover is too comlicated, even your usage is just show a text sentences.
 * so have to build a custom tooltip to match the V3's usage
 */
export default forwardRef(function Tooltip(
  {
    isLazy = true,
    usePortal = false,
    label,
    children,
    isOpen,
    defaultIsOpen: defaultTooltipIsOpen,
    contentBoxProps,
    placement = 'top',
    ...restPopoverProps
  }: {
    /** render content only when content is open */
    isLazy?: boolean
    usePortal?: boolean
    label?: ReactNode | ((handlers: TooltipHandles) => ReactNode)
    children?: ReactNode
    isOpen?: boolean
    defaultIsOpen?: boolean
    contentBoxProps?: BoxProps
    placement?: PopoverProps['placement']
  } & Omit<PopoverProps, 'isOpen' | 'label' | 'defaultIsOpen'>,
  ref
) {
  const tooltipBoxRef = useRef<HTMLDivElement>(null)
  const tooltipTriggerRef = useRef<HTMLDivElement>(null)
  const defaultIsOpen = isOpen ?? defaultTooltipIsOpen
  const { isOpen: isTooltipOpen, onOpen: open, onClose: close, onToggle: toggle } = useDisclosure({ defaultIsOpen })
  const isMobile = useAppStore((s) => s.isMobile)
  useOutsideClick({
    enabled: isTooltipOpen,
    ref: [tooltipBoxRef, tooltipTriggerRef],
    handler: () => {
      if (isTooltipOpen) {
        close()
      }
    }
  })
  const tooltipHandlers = useMemo(
    () => ({
      open,
      close
    }),
    [open, close]
  )

  // always has only one tooltip open
  useEffect(() => {
    if (isTooltipOpen && prevTooltipHandler !== tooltipHandlers) {
      prevTooltipHandler?.close()
      prevTooltipHandler = tooltipHandlers
    }
  }, [isTooltipOpen, tooltipHandlers])

  useHover([tooltipTriggerRef, tooltipBoxRef], {
    onHoverStart: () => {
      if (isMobile) return
      open()
    },
    onHoverEnd: () => close({ delay: 300 })
  })

  const renderLabel = useCallback(() => {
    const node = shrinkToValue(label, [tooltipHandlers])
    return node
  }, [label, tooltipHandlers])

  const contentStyle = useMemo(() => {
    return restPopoverProps.variant === 'card'
      ? {
          rounded: 'xl',
          bg: colors.cardBg,
          color: colors.textPrimary,
          border: `1px solid ${colors.cardBorder01}`
        }
      : {
          rounded: 'lg',
          bg: colors.tooltipBg,
          color: colors.tooltipText
        }
  }, [restPopoverProps.variant])

  return (
    <Popover isOpen={isTooltipOpen} placement={placement} defaultIsOpen={defaultIsOpen} isLazy={isLazy} {...restPopoverProps}>
      <PopoverTrigger>
        <Box
          ref={tooltipTriggerRef}
          onClick={(e) => {
            e.stopPropagation()
            toggle()
          }}
          cursor={label ? 'pointer' : undefined}
        >
          {shrinkToValue(children, [tooltipHandlers])}
        </Box>
      </PopoverTrigger>

      <PopoverContentWrapper usePortal={usePortal}>
        <PopoverContent ref={ref}>
          <Box>
            <PopoverArrow />
            <Box
              ref={tooltipBoxRef}
              fontSize="sm"
              py={3}
              px={4}
              {...contentStyle}
              {...contentBoxProps}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              {renderLabel()}
            </Box>
          </Box>
        </PopoverContent>
      </PopoverContentWrapper>
    </Popover>
  )
})
