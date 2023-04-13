import Layout from 'components/Layout'
import useRouterLoading from 'components/loading/useRouterLoading'
import { server } from 'msw-mocks/server'
import { SessionProvider } from 'next-auth/react'
import type { AppProps } from 'next/app'
import { createContext } from 'react'
import 'styles/globals.css'
import 'styles/nprogress.css'
import { register as registerSwiperWebComponents } from 'swiper/element/bundle'
import { SWRConfig } from 'swr'

export const RouterLoadingContext = createContext(false)

// Enabling this will allow mock rest endpoints in dev mode.
// In the docs this is supposed to need a separate browser setup,
// but this is working with the node server. I guess it's something
// with how nextjs is structured.
if (process.env.MSW === 'enabled') {
  server.listen()
}

interface IronLogPageProps {
  session?: any // todo: not sure how to import Session from next-auth
}
function IronLog({ Component, pageProps }: AppProps<IronLogPageProps>) {
  const isRouterLoading = useRouterLoading()
  // swiper needs to be registered once, globally
  registerSwiperWebComponents()

  return (
    <SessionProvider session={pageProps.session}>
      <SWRConfig
        value={{ fetcher: (url: string) => fetch(url).then((r) => r.json()) }}
      >
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
