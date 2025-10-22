import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import CreateProposal from '../../../views/Voting/CreateProposal'

const Page = dynamic(() => Promise.resolve(CreateProposal), { ssr: false }) as NextPageWithLayout

export default Page
