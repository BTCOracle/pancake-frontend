import { IfoCurrentCard } from './components/IfoCards/IfoCards'
import IfoContainer from './components/IfoContainer'
import useIfo from './hooks/useIfo'

const CurrentIfo: React.FC = () => {
  const { config } = useIfo()
  const steps = <></>

  if (!config) {
    return null
  }

  return (
    <IfoContainer
      ifoSection={<IfoCurrentCard ifoId={config.id} bannerUrl={config.bannerUrl} />}
      ifoSteps={steps}
      ifoFaqs={config.faqs}
    />
  )
}

export default CurrentIfo
