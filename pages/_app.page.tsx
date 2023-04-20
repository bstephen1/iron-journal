import Layout from 'components/Layout'
import useRouterLoading from 'components/loading/useRouterLoading'
import useSWRCacheProvider from 'components/useSWRCacheProvider'
import { swrFetcher } from 'lib/util'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { createContext, useEffect, useState } from 'react'
import 'styles/globals.css'
import 'styles/nprogress.css'
import { SWRConfig } from 'swr'

export const RouterLoadingContext = createContext(false)

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // this does not work, even with the SSR window guard
  // const { worker } = require('./mocks/browser')
  // worker.start()
}

const API_MOCKING = true
interface IronLogProps {
  session?: Session
}
function IronLog({ Component, pageProps }: AppProps<IronLogProps>) {
  const isRouterLoading = useRouterLoading()
  const provider = useSWRCacheProvider()

  // got this from a github issue I think, but lost the link
  const [shouldRender, setShouldRender] = useState(!API_MOCKING)
  useEffect(() => {
    async function initMocks() {
      const { worker } = await import('msw-mocks/browser')
      await worker.start()
      setShouldRender(true)
    }

    if (API_MOCKING) {
      initMocks()
    }
  }, [])

  if (!shouldRender) return <></>

  return (
    <SessionProvider>
      <SWRConfig value={{ fetcher: swrFetcher, provider }}>
        <Layout>
          <RouterLoadingContext.Provider value={isRouterLoading}>
            <Component {...pageProps} />
          </RouterLoadingContext.Provider>
        </Layout>
      </SWRConfig>
    </SessionProvider>
  )
}

export default IronLog
