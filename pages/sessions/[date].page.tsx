import SessionView from 'components/session/SessionView'
import { valiDate } from 'lib/backend/apiQueryValidationService'
import { Index } from 'lib/util'
import Record from 'models/Record'
import SessionLog from 'models/SessionLog'
import { NextPage } from 'next'
import Head from 'next/head'

interface Props {
  sessionLog: SessionLog | null
  records: Index<Record>
  date: string
}
// todo: I guess a separate session number in case you want to do multiple sessions in one day
// or, add separate sessions to the same day?
const SessionPage: NextPage<Props> = (props: Props) => {
  return (
    <>
      <Head>
        {/* this needs to be a single string or it throws a warning */}
        <title>{`Iron Log - ${props.date}`}</title>
      </Head>
      <main>
        <SessionView {...props} />
      </main>
    </>
  )
}

SessionPage.getInitialProps = async ({ req, res, query }): Promise<Props> => {
  const date = valiDate(query.date)

  // // req and res are only set on the server
  // const isServer = !!req

  // // https://stackoverflow.com/questions/67434329/next-js-cant-connect-to-mongodb-database-using-getinitialprops
  // https://blog.logrocket.com/getinitialprops-vs-getserversideprops-nextjs/
  // if (!isServer) {
  //   // can't import userid when called client side (or server?)
  //   const userId = await getUserId(req, res)

  //   const sessionLogPromise = fetchSession(userId, date)
  //   const recordsPromise = fetchRecords({ userId, filter: { date } })

  //   return Promise.all([sessionLogPromise, recordsPromise]).then(
  //     ([sessionLog, recordsArray]) => {
  //       const records = arrayToIndex<Record>('_id', recordsArray)
  //       return { sessionLog, records, date }
  //     }
  //   )
  // }

  // const sessionLog = useSessionLog(date)

  return { sessionLog: null, records: {}, date }
}

export default SessionPage
