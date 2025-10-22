import CurrentIfo from './CurrentIfo'
import { useCurrentIDOConfig } from './hooks/ido/useCurrentIDOConfig'

const Ido = () => {
  const currentIdoConfig = useCurrentIDOConfig()

  return <CurrentIfo idoConfig={currentIdoConfig} />
}

export default Ido
