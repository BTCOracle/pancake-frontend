import { IDoCurrentCard } from './components/IdoCards/IdoCards'
import IdoContainer from './components/IdoContainer'
import type { IDOConfig } from './config'

interface TypeProps {
  idoConfig: IDOConfig | undefined
}

const CurrentIdo: React.FC<React.PropsWithChildren<TypeProps>> = ({ idoConfig }) => {
  const steps = <></>

  if (!idoConfig) {
    return null
  }

  return (
    <IdoContainer
      idoSection={<IDoCurrentCard idoId={idoConfig.id} bannerUrl={idoConfig.bannerUrl} />}
      idoSteps={steps}
      idoFaqs={idoConfig.faqs}
    />
  )
}

export default CurrentIdo
