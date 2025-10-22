import BigNumber from 'bignumber.js'
import { createContext, PropsWithChildren, useCallback, useContext, useState } from 'react'
import { CakeApr } from 'state/farmsV4/atom'
import { ChainIdAddressKey } from 'state/farmsV4/state/type'

type MyPositionsContextState = {
  totalApr: {
    [key: string]: {
      denominator: BigNumber
      numerator: BigNumber
      lpApr?: `${number}`
      cakeApr?: CakeApr[ChainIdAddressKey]
    }
  }
  updateTotalApr: (
    key: string,
    numerator: BigNumber,
    denominator: BigNumber,
    lpApr?: `${number}`,
    cakeApr?: CakeApr[ChainIdAddressKey],
  ) => void
}
const defaultState: MyPositionsContextState = {
  totalApr: {},
  updateTotalApr: () => {},
}
const MyPositionsContext = createContext<MyPositionsContextState>(defaultState)
export const MyPositionsProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [totalApr, setTotalApr] = useState<MyPositionsContextState['totalApr']>({})

  const updateTotalApr: MyPositionsContextState['updateTotalApr'] = useCallback(
    (key, numerator, denominator, lpApr, cakeApr) => {
      setTotalApr((prevState) => ({
        ...prevState,
        [key]: { numerator, denominator, lpApr, cakeApr },
      }))
    },
    [],
  )

  return <MyPositionsContext.Provider value={{ totalApr, updateTotalApr }}>{children}</MyPositionsContext.Provider>
}

export const useMyPositions = () => useContext(MyPositionsContext)
