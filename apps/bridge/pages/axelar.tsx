import dynamic from 'next/dynamic'

const AxelarPage = dynamic(() => import('components/AxelarPage'), {
  ssr: false,
})

const Axelar = () => {
  return <AxelarPage />
}

export default Axelar
