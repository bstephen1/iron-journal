import { Box, Button, Stack, Typography } from '@mui/material'
import LoadingSpinner from 'components/loading/LoadingSpinner'
import dayjs from 'dayjs'
import { DATE_FORMAT } from 'lib/frontend/constants'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'

const today = dayjs().format(DATE_FORMAT)

export default function Page() {
  const router = useRouter()
  // initial value is undefined while loading
  const [sessionRedirect, setSessionRedirect] =
    useLocalStorageState('sessionRedirect')

  // need to wrap router.push in a useEffect because otherwise it would try to
  // render serverside and cause an error since the router doesn't exist yet.
  useEffect(() => {
    if (!sessionRedirect) return
    router.push(`sessions/${today}`)
  }, [router, sessionRedirect])

  return sessionRedirect || sessionRedirect === undefined ? (
    <>
      <LoadingSpinner />
    </>
  ) : (
    <Stack py={2} spacing={2}>
      <Typography variant="h6" component="h1" py={1} textAlign="center">
        No Session
      </Typography>
      <Typography>
        Normally coming here would redirect to the page for today's session, but
        the redirect has been disabled!
      </Typography>
      <div></div>
      <Typography>
        Typically you might want to turn off the redirect temporarily to
        bookmark this page.
      </Typography>
      <Typography>
        You can re-enable the redirect through settings, or by clicking the
        button below.
      </Typography>
      <Box display="flex" justifyContent="center" py={1}>
        <Button onClick={() => setSessionRedirect(true)} variant="contained">
          Enable redirect
        </Button>
      </Box>
    </Stack>
  )
}
