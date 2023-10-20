import StatefulSessionView from 'components/session/StatefulSessionView'
import Head from 'next/head'

export default function SessionSinglePage() {
  return (
    <>
      <Head>
        {/* this needs to be a single string or it throws a warning */}
        <title>{`Iron Log`}</title>
      </Head>
      <StatefulSessionView />
    </>
  )
}
