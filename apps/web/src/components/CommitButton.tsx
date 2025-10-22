import { Button, ButtonProps } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwitchNetworkLoading } from 'hooks/useSwitchNetworkLoading'
import { useSetAtom } from 'jotai'
import { mustSwitchNetworkModalAtom } from './NetworkModal'
import Trans from './Trans'

const wrongNetworkProps: ButtonProps = {
  variant: 'danger',
  disabled: false,
  children: <Trans>Wrong Network</Trans>,
  width: '100%',
}

export const CommitButton = ({ checkChainId, ...props }: ButtonProps & { checkChainId?: number }) => {
  const { isWrongNetwork } = useActiveChainId(checkChainId)
  const [switchNetworkLoading] = useSwitchNetworkLoading()
  const setMustSwitchNetworkModal = useSetAtom(mustSwitchNetworkModalAtom)

  return (
    <Button
      {...props}
      onClick={(e) => {
        if (isWrongNetwork) {
          setMustSwitchNetworkModal(checkChainId || true)
        } else {
          props.onClick?.(e)
        }
      }}
      {...(switchNetworkLoading && { disabled: true })}
      {...(isWrongNetwork && wrongNetworkProps)}
    />
  )
}
