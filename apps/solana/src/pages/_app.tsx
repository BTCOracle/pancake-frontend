import '@/components/LandingPage/components/tvl.css'
import '@/components/LandingPage/liquidity.css'
import '@/components/Toast/toast.css'
import 'react-day-picker/dist/style.css'

import { Fragment, useMemo } from 'react'

import Decimal from 'decimal.js'
import { DefaultSeo } from 'next-seo'
import { SEO } from 'next-seo.config'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ResetCSS } from '@pancakeswap/uikit'

import AppNavLayout from '@/components/AppLayout/AppNavLayout'
import Content from '@/components/Content'
import { SentryErrorBoundary } from '@/components/SentryErrorBoundary'
import useThemeSync from '@/hooks/useThemeSync'
import { Providers } from '@/provider'
import { pageRoutePathnames } from '@/utils/config/routers'

const CONTENT_ONLY_PATH = ['/', '404', '/moonpay']
const OVERFLOW_HIDDEN_PATH = [pageRoutePathnames.pools, pageRoutePathnames.swap, pageRoutePathnames['legacy-swap']]
const FULL_SIZE_PATH = [pageRoutePathnames.swap, pageRoutePathnames['legacy-swap']]
const ProductionErrorBoundary = process.env.NODE_ENV === 'production' ? SentryErrorBoundary : Fragment

Decimal.set({ precision: 1e3 })

const GlobalHooks = () => {
  useThemeSync()
  return null
}

const MyApp = ({ Component, pageProps, ...props }: AppProps) => {
  const { pathname } = useRouter()

  const [onlyContent, overflowHidden, fullSize] = useMemo(
    () => [CONTENT_ONLY_PATH.includes(pathname), OVERFLOW_HIDDEN_PATH.includes(pathname), FULL_SIZE_PATH.includes(pathname)],
    [pathname]
  )

  return (
    <>
      <GoogleAnalytics gaId="G-DR3V6FTKE3" />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <title>{pageProps?.title ? `${pageProps.title} PancakeSwap` : 'PancakeSwap'}</title>
      </Head>
      {process.env.NEXT_PUBLIC_GTM_ID ? (
        <Script
          strategy="afterInteractive"
          id="google-tag"
          dangerouslySetInnerHTML={{
            __html: `
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
`
          }}
        />
      ) : null}
      <DefaultSeo {...SEO} />
      <Providers>
        <ProductionErrorBoundary>
          <Content {...props}>
            <ResetCSS />
            <GlobalHooks />
            {onlyContent ? (
              <Component {...pageProps} />
            ) : (
              <AppNavLayout overflowHidden={overflowHidden} fullSize={fullSize}>
                <Component {...pageProps} />
              </AppNavLayout>
            )}
          </Content>
        </ProductionErrorBoundary>
      </Providers>
    </>
  )
}

export default MyApp
