import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { NextApiHandler } from 'next'
import { getBurnHistoryTable } from 'utils/stats/burnHistoryTable'
import { getBurnTimeSeries } from 'utils/stats/burnTimeSeries'
import { getDeflationTimeSeries } from 'utils/stats/deflationTimeSeries'
import { getMintTimeSeries } from 'utils/stats/mintTimeSeries'
import { getTotalSupplyMintBurn } from 'utils/stats/totalSupplyMintBurn'
import { getTotalSupplyTimeSeries } from 'utils/stats/totalSupplyTimeSeries'
import { BurnStats } from 'views/BurnDashboard/types'

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Vercel's cron job automatically adds the Authorization header
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('Unauthorized attempt to update burn statistics with authorization:', req.headers.authorization)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Fetch data from Dune
  try {
    const [
      totalSupplyMintBurn,
      totalSupplyTimeSeries,
      deflationTimeSeries,
      burnTimeSeries,
      mintTimeSeries,
      burnHistoryTable,
    ] = await Promise.all([
      getTotalSupplyMintBurn(),
      getTotalSupplyTimeSeries(),
      getDeflationTimeSeries(),
      getBurnTimeSeries(),
      getMintTimeSeries(),
      getBurnHistoryTable(),
    ])

    const result: Partial<BurnStats> = {
      // Use the earliest timestamp of all data
      timestamp: Math.min(
        totalSupplyMintBurn.timestamp,
        totalSupplyTimeSeries.timestamp,
        deflationTimeSeries.timestamp,
        burnTimeSeries.timestamp,
        mintTimeSeries.timestamp,
        burnHistoryTable.timestamp,
      ),
      ...totalSupplyMintBurn.data,
      totalSupplyTimeSeries: totalSupplyTimeSeries.data,
      deflationTimeSeries: deflationTimeSeries.data,
      burnTimeSeries: burnTimeSeries.data,
      mintTimeSeries: mintTimeSeries.data,
      burnHistoryTable: burnHistoryTable.data,
    }

    // Put data in R2 bucket
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT || '',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })

    const putCommand = new PutObjectCommand({
      Bucket: 'burn-statistics',
      Key: 'data.json',
      Body: JSON.stringify(result),
      ContentType: 'application/json',
    })

    await s3Client.send(putCommand)

    // Purge Cloudflare cache
    const purgeCacheResult = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${process.env.CF_CACHE_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CF_CACHE_API_TOKEN}` },
        body: JSON.stringify({
          files: [`https://burn-stats.pancakeswap.com/data.json`],
        }),
      },
    )
    if (!purgeCacheResult.ok) {
      const reason = await purgeCacheResult.json()
      throw new Error(JSON.stringify(reason))
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `An error occurred while updating burn statistics ${error}` })
  }
}

export default handler
