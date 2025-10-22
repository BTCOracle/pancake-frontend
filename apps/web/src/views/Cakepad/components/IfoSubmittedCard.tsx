import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, Button } from '@pancakeswap/uikit'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useBlockExploreLink } from 'utils'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { LottieComponentProps } from 'lottie-react'

const Lottie = dynamic<LottieComponentProps>(() => import('lottie-react'), { ssr: false })

interface IfoSubmittedCardProps {
  txHash: string
}

const IfoSubmittedCard: React.FC<IfoSubmittedCardProps> = ({ txHash }) => {
  const { t } = useTranslation()
  const { chainId } = useActiveChainId()
  const [animationData, setAnimationData] = useState<any>()
  const getBlockExploreLink = useBlockExploreLink()

  useEffect(() => {
    fetch('https://assets.pancakeswap.finance/web/ifos/submitted.json')
      .then((res) => res.json())
      .then(setAnimationData)
  }, [])

  const explorerLink = chainId ? getBlockExploreLink(txHash, 'transaction', chainId) : undefined

  return (
    <Card>
      <CardBody p="24px" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {animationData && <Lottie animationData={animationData} loop={false} style={{ width: 200 }} />}
      </CardBody>
      <CardBody p="0 24px 24px 24px">
        <Button as="a" href={explorerLink} target="_blank" rel="noopener noreferrer" width="100%">
          {t('Transaction Details')}
        </Button>
      </CardBody>
    </Card>
  )
}

export default IfoSubmittedCard
