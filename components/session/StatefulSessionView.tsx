import { Stack, useTheme } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import LoadingSpinner from 'components/loading/LoadingSpinner'
import WeightUnitConverter from 'components/session/upper/WeightUnitConverter'
import NavigationBar from 'components/slider/NavigationBar'
import dayjs from 'dayjs'
import { DATE_FORMAT } from 'lib/frontend/constants'
import {
  addRecord,
  deleteSessionRecord,
  updateSessionLog,
  useSessionLog,
} from 'lib/frontend/restService'
import Exercise from 'models/AsyncSelectorOption/Exercise'
import Note from 'models/Note'
import Record from 'models/Record'
import SessionLog from 'models/SessionLog'
import { useRef, useState } from 'react'
import { Keyboard, Navigation, Pagination } from 'swiper'
import 'swiper/css'
import 'swiper/css/pagination'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { useSWRConfig } from 'swr'
import AddRecordCard from './AddRecordCard'
import CopySessionCard from './CopySessionCard'
import RecordCard from './records/RecordCard'
import RestTimer from './upper/RestTimer'
import TitleBar from './upper/TitleBar'

const today = dayjs().format(DATE_FORMAT)

export default function StatefulSessionView() {
  const [date, setDate] = useState(today)
  const theme = useTheme()
  // This is used to alert when a record changes an exercise, so other records can
  // be notified and mutate themselves to retrieve the new exercise data.
  const [mostRecentlyUpdatedExercise, setMostRecentlyUpdatedExercise] =
    useState<Exercise | null>(null)
  const { sessionLog, mutate: mutateSession, isLoading } = useSessionLog(date)
  const { mutate } = useSWRConfig()
  const swiperElRef = useRef<SwiperRef>(null)
  const sessionHasRecords = !!sessionLog?.records.length
  const paginationClassName = 'pagination-record-cards'
  const navPrevClassName = 'nav-prev-record-cards'
  const navNextClassName = 'nav-next-records-cards'

  const handleUpdateSession = async (newSessionLog: SessionLog) => {
    mutateSession(updateSessionLog(newSessionLog), {
      optimisticData: newSessionLog,
      revalidate: false,
    })
  }

  const handleAddRecord = async (exercise: Exercise) => {
    // have to check at function runtime if swiper.current exists bc a value change does not re-render
    const swiper = swiperElRef.current?.swiper
    if (!swiper) return

    const newRecord = new Record(date, { exercise })
    newRecord.sets.push({})
    const newSessionLog = sessionLog
      ? {
          ...sessionLog,
          records: sessionLog.records.concat(newRecord._id),
        }
      : new SessionLog(date, [newRecord._id])

    mutateSession(updateSessionLog(newSessionLog), {
      optimisticData: newSessionLog,
      revalidate: false,
    })
    // Add new record to swr cache so it doesn't have to be fetched.
    mutate(`/api/records/${newRecord._id}`, addRecord(newRecord), {
      revalidate: false,
      optimisticData: newRecord,
    })

    swiper.update()
  }

  const handleNotesChange = async (notes: Note[]) => {
    if (!sessionLog) return

    const newSessionLog = { ...sessionLog, notes }
    mutateSession(updateSessionLog(newSessionLog), {
      optimisticData: newSessionLog,
      revalidate: false,
    })
  }

  const handleSwapRecords = async (i: number, j: number) => {
    const swiper = swiperElRef.current?.swiper
    if (!sessionLog || !swiper) return

    const length = sessionLog.records.length
    if (i < 0 || i >= length || j < 0 || j >= length) {
      console.error(`Tried swapping records out of range: ${i}, ${j}`)
      return
    }

    // todo: avoid the semi colon?
    const newRecords = [...sessionLog.records]
    ;[newRecords[j], newRecords[i]] = [newRecords[i], newRecords[j]]
    const newSession = { ...sessionLog, records: newRecords }
    mutateSession(updateSessionLog(newSession), {
      optimisticData: newSession,
      revalidate: false,
    })
    swiper.update()
    // todo: think about animation here. Instant speed? Maybe if it could change to a fade transition?
    swiper.slideTo(j, 0)
  }

  const handleDeleteRecord = async (recordId: string) => {
    const swiper = swiperElRef.current?.swiper
    if (!sessionLog || !swiper) return

    const newRecords = sessionLog.records.filter((id) => id !== recordId)
    mutateSession(deleteSessionRecord(sessionLog.date, recordId), {
      optimisticData: { ...sessionLog, records: newRecords },
      revalidate: false,
    })
    swiper.update()
    swiper.slidePrev()
  }

  // todo: add blank space or something under the swiper. On the longest record
  // if you swap between history it scrolls up when a small history is selected, but won't scroll back down
  // when a bigger one appears.
  return (
    <Stack spacing={2}>
      <TitleBar day={dayjs(date)} setTargetDate={setDate} disableRouter />
      <Grid container>
        <Grid xs={12} md={6}>
          <RestTimer />
        </Grid>
        <Grid
          xs={12}
          md={6}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <WeightUnitConverter />
        </Grid>
      </Grid>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        // after making changes to the swiper component the page needs to be reloaded
        <Swiper
          ref={swiperElRef}
          // Note: it is CRITICAL to not use state to track slide changes in the
          // component that contains a Swiper. A state change during a slide transition
          // will cause the entire component to re-render, and if that component contains
          // the transitioning swiper it will pause the transition and cause noticeable
          // lag on every swipe. Any state manipulation should be handled by isolated
          // child components that will only re-render themselves.
          // Note that the useSwiperSlide hook uses state internally, so it will cause
          // this same lag.
          noSwipingClass="swiper-no-swiping-record"
          modules={[Navigation, Pagination, Keyboard]}
          // breakpoints catch everything >= the given value
          breakpoints={{
            [theme.breakpoints.values.sm]: {
              slidesPerView: 1,
            },
            [theme.breakpoints.values.md]: {
              slidesPerView: 2,
              centeredSlides: false,
              centerInsufficientSlides: true,
            },
            [theme.breakpoints.values.lg]: {
              slidesPerView: 3,
              centeredSlides: true,
              centerInsufficientSlides: false,
            },
          }}
          spaceBetween={20}
          keyboard
          // not sure if autoheight is good. Will jump up if a smaller record appears (eg, "add record")
          // Change the default where dragging will only work on the slides, but not the space between them.
          touchEventsTarget="container"
          centeredSlides
          navigation={{
            prevEl: `.${navPrevClassName}`,
            nextEl: `.${navNextClassName}`,
          }}
          grabCursor
          pagination={{
            el: `.${paginationClassName}`,
            clickable: true,
            // todo: maybe add a custom render and make the last one a "+" or something.
            // Kind of tricky to do though.
          }}
          // Extra padding lets autoHeight remember scroll position for longer slides.
          // Has to be large enough to still be showing swiper on AddRecord slide,
          // but small enough that it isn't bigger than record cards
          style={{ paddingBottom: '60vh' }}
        >
          {/* Originally had the arrows in line with slides, but there isn't a good
                  way to do that while keeping them inside the swiper to take advantage of 
                  the useSwiper hook. Could manually pass them the swiper ref instead.
                  This solves another problem though: variable slide height moving the arrows
                  around. And, it allows the history swiper to also have nav arrows.  */}
          <NavigationBar
            {...{
              navNextClassName,
              navPrevClassName,
              paginationClassName,
              sx: { pb: 2, pt: 3 },
              slot: 'container-start',
            }}
          />
          {sessionLog?.records.map((id, i) => (
            <SwiperSlide key={id}>
              <RecordCard
                id={id}
                deleteRecord={handleDeleteRecord}
                swapRecords={handleSwapRecords}
                swiperIndex={i}
                updateSessionNotes={handleNotesChange}
                sessionNotes={sessionLog.notes}
                setMostRecentlyUpdatedExercise={setMostRecentlyUpdatedExercise}
                mostRecentlyUpdatedExercise={mostRecentlyUpdatedExercise}
              />
            </SwiperSlide>
          ))}

          <SwiperSlide
            // if no records, disable swiping. The swiping prevents you from being able to close date picker
            className={sessionHasRecords ? '' : 'swiper-no-swiping-record'}
          >
            <Stack spacing={2} sx={{ p: 0.5 }}>
              <AddRecordCard handleAdd={handleAddRecord} />
              {!sessionHasRecords && (
                <CopySessionCard
                  day={dayjs(date)}
                  handleUpdateSession={handleUpdateSession}
                />
              )}
            </Stack>
          </SwiperSlide>
        </Swiper>
      )}
    </Stack>
  )
}
