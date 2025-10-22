import { Box } from '@chakra-ui/react'
import { ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { ListContext } from '@/provider'
import VirtualBox from './VirtualBox'

type ListItemStatus = {
  isIntersecting: boolean
}

export default function ListItem({ children }: { children?: ReactNode | ((status: ListItemStatus) => ReactNode) }) {
  const itemRef = useRef<HTMLElement>()

  const [isIntersecting, setIsIntersecting] = useState(true)
  const { observeFn } = useContext(ListContext) ?? {}

  const status = useMemo(
    () => ({
      isIntersecting
    }),
    [isIntersecting]
  )

  useEffect(() => {
    if (!itemRef.current) return
    observeFn?.(itemRef.current, ({ entry: { isIntersecting: isIntersecting_ } }) => {
      setIsIntersecting(isIntersecting_)
    })
  }, [itemRef, observeFn])

  return (
    <VirtualBox show={isIntersecting} ref={itemRef} w="full" flexShrink={0}>
      {(detectRef) => (
        <Box w="full" display="flow-root" className="ListItem" ref={detectRef}>
          {shrinkToValue(children, [status])}
        </Box>
      )}
    </VirtualBox>
  )
}
