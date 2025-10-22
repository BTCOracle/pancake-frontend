import dynamic from 'next/dynamic'
import { NextPageWithLayout } from 'utils/page.types'
import Overview from 'views/Voting/Proposal/Overview'

const ProposalView = () => {
  return <Overview />
}

const Page = dynamic(() => Promise.resolve(ProposalView), { ssr: false }) as NextPageWithLayout

export default Page
