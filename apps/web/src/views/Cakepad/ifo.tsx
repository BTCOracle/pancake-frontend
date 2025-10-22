import { safeGetAddress } from 'utils'
import { IfoV2Provider } from './contexts/IfoV2Provider'
import CurrentIfo from './CurrentIfo'
import useIfo from './hooks/useIfo'
import { IfoPresetPage } from './components/IfoCards/IfoPresetCard/IfoPresetCard'

const DisplayIfo = () => {
  const { config } = useIfo()

  // If no contract address, use preset data
  if ((!config.contractAddress || !safeGetAddress(config.contractAddress)) && config.presetData) {
    return <IfoPresetPage />
  }

  return <CurrentIfo />
}

const Ifo = () => {
  return (
    <>
      <IfoV2Provider>
        <DisplayIfo />
      </IfoV2Provider>
    </>
  )
}

export default Ifo
