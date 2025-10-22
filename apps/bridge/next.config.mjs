import { withWebSecurityHeaders } from '@pancakeswap/next-config/withWebSecurityHeaders'
import { createVanillaExtractPlugin } from '@vanilla-extract/next-plugin'
import { RetryChunkLoadPlugin } from 'webpack-retry-chunk-load-plugin'

const withVanillaExtract = createVanillaExtractPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@pancakeswap/uikit',
    '@pancakeswap/hooks',
    '@pancakeswap/localization',
    '@pancakeswap/utils',
    '@0xsquid/widget',
    // https://github.com/TanStack/query/issues/6560#issuecomment-1975771676
    '@tanstack/query-core',
  ],
  compiler: {
    styledComponents: true,
  },
  async redirects() {
    return [
      {
        source: '/aptos',
        destination: '/stargate',
        permanent: true,
      },
    ]
  },
  webpack: (webpackConfig) => {
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
    return webpackConfig
  },
}

export default withVanillaExtract(withWebSecurityHeaders(nextConfig))
