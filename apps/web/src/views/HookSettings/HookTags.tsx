import { HOOK_CATEGORY, HookData, POOL_TYPE } from '@pancakeswap/infinity-sdk'
import { Text } from '@pancakeswap/uikit'
import { GreyBadge, PoolTypeBadge } from 'components/Liquidity/Badges'
import { useMemo } from 'react'

function isHookType(value: string): value is POOL_TYPE {
  return Object.values(POOL_TYPE).includes(value as POOL_TYPE)
}

const useHookTags = (selectedHook?: HookData) =>
  useMemo(() => {
    const tags: (POOL_TYPE | HOOK_CATEGORY)[] = []
    if (selectedHook?.poolType) {
      tags.push(selectedHook?.poolType)
    }
    if (selectedHook?.category) {
      tags.push(...selectedHook?.category)
    }
    return tags
  }, [selectedHook?.poolType, selectedHook?.category])

export const HookTags = ({ hook }: { hook?: HookData }) => {
  const tags = useHookTags(hook)

  return (
    <>
      {tags &&
        tags.map((tag) => {
          if (isHookType(tag)) {
            return <PoolTypeBadge poolType={tag} />
          }
          return (
            <GreyBadge>
              <Text color="textSubtle" small>
                {tag}
              </Text>
            </GreyBadge>
          )
        })}
    </>
  )
}
