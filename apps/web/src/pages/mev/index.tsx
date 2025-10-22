import { MevLanding } from 'views/Mev'
import { PageProps } from 'views/Mev/types'
import { fetchRPCData } from 'views/Mev/utils'

const MevPage: React.FC<PageProps> = ({ txCount, walletCount }) => {
  return <MevLanding txCount={txCount} walletCount={walletCount} />
}

// Static props function
export async function getStaticProps(): Promise<{ props: PageProps; revalidate: number }> {
  try {
    // Fetch both data points in parallel
    const [txCount, walletCount] = await Promise.all([fetchRPCData('stat_txCount'), fetchRPCData('stat_walletCount')])

    return {
      props: {
        txCount,
        walletCount,
      },
      revalidate: 600, // Revalidate every 600 seconds
    }
  } catch (error) {
    console.error('Error in getStaticProps:', error)

    return {
      props: {
        txCount: 0, // Fallback values
        walletCount: 0,
      },
      revalidate: 60,
    }
  }
}

export default MevPage
