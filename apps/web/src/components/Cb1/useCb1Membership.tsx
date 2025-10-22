import { getChainName } from '@pancakeswap/chains'
import { LS_CB1 } from 'config/constants'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useEffect, useState } from 'react'

interface CB1State {
  expired: number
}

const BASE_URI = 'https://attestation-api.pancakeswap.com'

const EXPIRE = 1000 * 24 * 3600

async function getCb1Membership(chain: string, address: string) {
  try {
    const resp = await fetch(`${BASE_URI}/api/attestation/base?userAddress=${address}`)
    const json = await resp.json()
    const attested = Boolean(json?.qualified)
    return attested
  } catch (error) {
    return false
  }
}

function updateExpire(address: string) {
  const cb1State: CB1State = {
    expired: Date.now() + EXPIRE,
  }
  localStorage.setItem(`${LS_CB1}-${address}`, JSON.stringify(cb1State))
}

async function showCb1Popup(chain?: string, address?: string) {
  if (!address || !chain) {
    return false
  }
  if (!['base', 'bsc', 'arb'].includes(chain)) {
    return false
  }

  const lsItem = localStorage.getItem(`${LS_CB1}-${address}`)
  if (lsItem) {
    const cb1State: CB1State = JSON.parse(lsItem)
    const shouldShow = Date.now() > cb1State.expired
    if (shouldShow) {
      updateExpire(address)
    }
    return shouldShow
  }
  const attested = await getCb1Membership(chain, address)
  if (attested) {
    updateExpire(address)
  }
  return attested
}

export const useShowCb1Popup = () => {
  const { account, chainId } = useAccountActiveChain()
  const [showCb1, setShowCb1] = useState(false)

  const chainName = chainId ? getChainName(chainId) : undefined

  useEffect(() => {
    const load = async () => {
      const show = await showCb1Popup(chainName, account)
      requestAnimationFrame(() => setShowCb1(show))
    }

    load()
  }, [account, chainName])

  return showCb1
}
