import SessionView from 'components/session/SessionView'
import dayjs from 'dayjs'
import { validDateStringRegex } from 'lib/frontend/constants'
import Error from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'

// I guess a separate session number in case you want to do multiple sessions in one day
// or, add separate sessions to the same day?
export default function SessionPage() {
  const router = useRouter()
  const { date } = router.query

  // first render has an empty router.query object
  if (!date) {
    return <></>
  }

  // it won't ever not be a string but need to make typescript happy
  if (typeof date !== 'string' || !date.match(validDateStringRegex)) {
    return <Error statusCode={400} />
  }

  return (
    <>
      <Head>
        <title>{`Iron log - ${date}`}</title>
      </Head>
      <main>
        <SessionView date={dayjs(date)} />
      </main>
    </>
  )
}
