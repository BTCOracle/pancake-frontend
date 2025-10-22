import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import Voting from '../../views/Voting'

const Page = dynamic(() => Promise.resolve(Voting), { ssr: false }) as NextPageWithLayout

export default Page
