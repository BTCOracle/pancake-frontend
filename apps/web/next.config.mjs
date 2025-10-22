import path from 'path'
import { fileURLToPath } from 'url'
/* eslint-disable @typescript-eslint/no-var-requires */
import BundleAnalyzer from '@next/bundle-analyzer'
import { withWebSecurityHeaders } from '@pancakeswap/next-config/withWebSecurityHeaders'
import smartRouterPkgs from '@pancakeswap/smart-router/package.json' with { type: 'json' }
import { withSentryConfig } from '@sentry/nextjs'
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import vercelToolbarPlugin from '@vercel/toolbar/plugins/next'
import { RetryChunkLoadPlugin } from 'webpack-retry-chunk-load-plugin'

const withVercelToolbar = vercelToolbarPlugin()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const withBundleAnalyzer = BundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withVanillaExtract = createVanillaExtractPlugin()

const isProd = process.env.VERCEL_ENV === 'production' || 
  process.env.NODE_ENV === 'production' || 
  process.env.VERCEL_ENV === 'preview'

const sentryWebpackPluginOptions =
  process.env.VERCEL_ENV === 'production'
    ? {
      // Additional config options for the Sentry Webpack plugin. Keep in mind that
      // the following options are set automatically, and overriding them is not
      // recommended:
      //   release, url, org, project, authToken, configFile, stripPrefix,
      //   urlPrefix, include, ignore
      silent: true, // Logging when deploying to check if there is any problem
      validate: true,
      hideSourceMaps: false,
      tryRun: true,
      disable: true
      // https://github.com/getsentry/sentry-webpack-plugin#options.
    }
    : {
      hideSourceMaps: false,
      silent: true, // Suppresses all logs
      dryRun: !process.env.SENTRY_AUTH_TOKEN,
    }

const workerDeps = Object.keys(smartRouterPkgs.dependencies)
  .map((d) => d.replace('@pancakeswap/', 'packages/'))
  .concat(['/packages/smart-router/', '/packages/swap-sdk/', '/packages/token-lists/'])

const prodTranspiles = [
    'next-typesafe-url',
    '@pancakeswap/farms',
    '@pancakeswap/localization',
    '@pancakeswap/hooks',
    '@pancakeswap/utils',
    '@pancakeswap/widgets-internal',
    '@pancakeswap/ifos',
    '@pancakeswap/uikit'
  ]

const basicTranspiles = [
  'next-typesafe-url',
  '@pancakeswap/localization', 
]
/** @type {import('next').NextConfig} */
const config = {
  typescript: {
    tsconfigPath: 'tsconfig.json',
    ignoreBuildErrors: true
  },
  compiler: {
    styledComponents: true,
  },
  experimental: {
    scrollRestoration: true,
    fallbackNodePolyfills: false,
    optimizePackageImports: ['@pancakeswap/widgets-internal', '@pancakeswap/uikit'],
    // Allow Next.js to handle CJS packages that depend on ESM modules
    // without throwing `import-esm-externals` errors
    esmExternals: 'loose',
    webpackBuildWorker: true,
  },
  bundlePagesRouterDependencies:  isProd,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  outputFileTracingExcludes: {
    '*': [],
  },
  transpilePackages: isProd ? prodTranspiles: basicTranspiles,
  reactStrictMode: isProd,
  images: {
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static-nft.pancakeswap.com',
        pathname: '/mainnet/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.pancakeswap.finance',
        pathname: '/web/**',
      },
      {
        protocol: 'https',
        hostname: 'tokens.pancakeswap.finance',
        pathname: '/web/**',
      }
    ],
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: '/info/token/:address',
          destination: '/info/tokens/:address',
        },
        {
          source: '/info/pool/:address',
          destination: '/info/pools/:address',
        },
        {
          source: '/.well-known/vercel/flags',
          destination: '/api/vercel/flags',
        },
        {
          source: '/perp/v2/:symbol.rsc',
          destination: 'https://perp.pancakeswap.finance/perp/v2/:symbol',
        },
        {
          source: '/perp/:path*',
          destination: 'https://perp.pancakeswap.finance/perp/:path*',
        },
      ],
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      {
        source: '/logo.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      {
        source: '/images/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=31536000',
          },
        ],
      },
      {
        source: '/images/tokens/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, immutable, max-age=604800',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/send',
        destination: '/swap',
        permanent: true,
      },
      {
        source: '/create/:currency*',
        destination: '/add/:currency*',
        permanent: true,
      },
      {
        source: '/affiliates-program/:path*',
        destination: '/',
        permanent: true,
      },
      {
        source: '/farms/archived',
        destination: '/farms/history',
        permanent: true,
      },
      {
        source: '/pool',
        destination: '/liquidity',
        permanent: true,
      },
      {
        source: '/staking',
        destination: '/pools',
        permanent: true,
      },
      {
        source: '/cake-staking',
        destination: '/cake-staking/redeem',
        permanent: true,
      },
      {
        source: '/gauges-voting',
        destination: '/cake-staking/redeem',
        permanent: true,
      },
      {
        source: '/syrup',
        destination: '/pools',
        permanent: true,
      },
      {
        source: '/collectibles',
        destination: '/nfts',
        permanent: true,
      },
      {
        source: '/info/pools',
        destination: '/info/pairs',
        permanent: true,
      },
      {
        source: '/info/pools/:address',
        destination: '/info/pairs/:address',
        permanent: true,
      },
      {
        source: '/position-managers/:path*',
        destination: 'https://legacy-pm.pancakeswap.finance/position-managers/:path*',
        permanent: true,
      },
      {
        source: '/images/tokens/:address',
        destination: 'https://tokens.pancakeswap.finance/images/:address',
        permanent: false,
      },
      {
        source: '/ifo',
        destination: '/cakepad',
        permanent: true,
      }
    ]
  },
  webpack: (webpackConfig, { webpack, isServer }) => {
    webpackConfig.resolve = webpackConfig.resolve || {}
    webpackConfig.resolve.alias = webpackConfig.resolve.alias || {}
    webpackConfig.resolve.alias['@solana/wallet-adapter-react'] = path.resolve(
      __dirname,
      'node_modules',
      '@solana/wallet-adapter-react'
    )
    webpackConfig.infrastructureLogging = {
      level: 'info', // or 'verbose' for more detail
    };
    // tree shake sentry tracing
    if(isProd) {
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          __SENTRY_DEBUG__: false,
          __SENTRY_TRACING__: false,
        }),
      )

      webpackConfig.plugins.push(
        new RetryChunkLoadPlugin({
          cacheBust: `function() {
            return 'cache-bust=' + Date.now();
          }`,
          retryDelay: `function(retryAttempt) {
            return 2 ** (retryAttempt - 1) * 500;
          }`,
          maxRetries: 5,
        }),
      )
    }
    if (!isServer && webpackConfig.optimization.splitChunks) {
      // webpack doesn't understand worker deps on quote worker, so we need to manually add them
      // https://github.com/webpack/webpack/issues/16895
      // eslint-disable-next-line no-param-reassign
      webpackConfig.optimization.splitChunks.cacheGroups.workerChunks = {
        chunks: 'async',
        maxInitialRequests: 10,
        minSize: 100_000, // 100kb
        test(module) {
          const resource = module.nameForCondition?.() ?? ''
          return resource ? workerDeps.some((d) => resource.includes(d)) : false
        },
        priority: 31,
        name: 'worker-chunks',
        reuseExistingChunk: true,
      }
    }

    return webpackConfig
  },
}

const withTooling = (cfg) =>
 isProd 
    ? withVercelToolbar(
        withBundleAnalyzer(
          withVanillaExtract(
            withSentryConfig(withWebSecurityHeaders(cfg), sentryWebpackPluginOptions)
          )
        )
      )
    : withWebSecurityHeaders(
        withBundleAnalyzer( // still allow ANALYZE=true locally when needed
          withVanillaExtract(cfg)
        )
      )

export default withTooling(config)

