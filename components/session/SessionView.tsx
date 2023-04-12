import { Box, Stack, useTheme } from '@mui/material'
import NavigationArrow from 'components/slider/NavigationArrow'
import PaginationBullets from 'components/slider/PaginationBullets'
import dayjs from 'dayjs'
import {
  addRecord,
  deleteSessionRecord,
  updateSessionLog,
  useSessionLog,
} from 'lib/frontend/restService'
import Exercise from 'models/Exercise'
import Note from 'models/Note'
import Record from 'models/Record'
import SessionLog from 'models/SessionLog'
import { useState } from 'react'
import { Keyboard, Navigation, Pagination, Swiper as SwiperClass } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { Swiper, SwiperSlide } from 'swiper/react'
import AddRecordCard from './AddRecordCard'
import CopySessionCard from './CopySessionCard'
import RecordCard from './records/RecordCard'
import SessionModules from './upper/SessionModules'
import TitleBar from './upper/TitleBar'

interface Props {
  date: string
}
export default function SessionView({ date }: Props) {
  const theme = useTheme()
  const [isBeginning, setIsBeginning] = useState(false)
  const [isEnd, setIsEnd] = useState(false)
  // This is used to alert when a record changes an exercise, so other records can
  // be notified and mutate themselves to retrieve the new exercise data.
  const [mostRecentlyUpdatedExercise, setMostRecentlyUpdatedExercise] =
    useState<Exercise | null>(null)
  const { sessionLog, mutate, isLoading } = useSessionLog(date)
  const sessionHasRecords = !!sessionLog?.records.length
  const paginationClassName = 'pagination-record-card'
  const navPrevClassName = 'nav-prev'
  const navNextClassName = 'nav-next'

  const updateSwiper = (swiper: SwiperClass) => {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  const handleUpdateSession = async (newSessionLog: SessionLog) => {
    mutate(updateSessionLog(newSessionLog), {
      optimisticData: newSessionLog,
      revalidate: false,
    })
  }

  const handleAddRecord = async (exercise: Exercise) => {
    const record = new Record(date, { exercise })
    record.sets.push({})
    const newSessionLog = sessionLog
      ? {
          ...sessionLog,
          records: sessionLog.records.concat(record._id),
        }
      : new SessionLog(date, [record._id])
    mutate(updateSessionLog(newSessionLog), {
      optimisticData: newSessionLog,
      revalidate: false,
    })
    await addRecord(record)
  }

  const handleNotesChange = async (notes: Note[]) => {
    if (!sessionLog) return

    const newSessionLog = { ...sessionLog, notes }
    mutate(updateSessionLog(newSessionLog), {
      optimisticData: newSessionLog,
      revalidate: false,
    })
  }

  const handleSwapRecords = async (i: number, j: number) => {
    if (!sessionLog) return

    const length = sessionLog.records.length
    if (i < 0 || i >= length || j < 0 || j >= length) {
      console.error(`Tried swapping records out of range: ${i}, ${j}`)
      return
    }

    // todo: avoid the semi colon?
    const newRecords = [...sessionLog.records]
    ;[newRecords[j], newRecords[i]] = [newRecords[i], newRecords[j]]
    const newSession = { ...sessionLog, records: newRecords }
    mutate(updateSessionLog(newSession), {
      optimisticData: newSession,
      revalidate: false,
    })
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!sessionLog) return

    const newRecords = sessionLog.records.filter((id) => id !== recordId)
    mutate(deleteSessionRecord(sessionLog.date, recordId), {
      optimisticData: { ...sessionLog, records: newRecords },
      revalidate: false,
    })
  }

  return (
    <Stack spacing={2}>
      <TitleBar date={dayjs(date)} />
      <SessionModules />
      {isLoading ? (
        <></>
      ) : (
        <Box>
          <PaginationBullets className={paginationClassName} />
          <Stack direction="row">
            <NavigationArrow
              direction="prev"
              className={navPrevClassName}
              disabled={isBeginning}
            />
            <Swiper
              // for some reason passing the swiper object to state doesn't update it, so added in an intermediary function
              onSwiper={updateSwiper}
              onSlideChange={updateSwiper}
              // cssMode makes animations a LOT smoother on mobile. It does have some noticeable differences:
              // - disables dragging with a mouse.
              // - makes pagination bullets animate each change onClick instead of just going to the final one (desktop)
              // - removes stretching animation when trying to scroll past end of list
              // - makes scrolling more sensitive (like a higher dpi on a mouse)
              // The history swipers are already smooth enough without it. May want to
              // think about leaning down this outer swiper to increase performance.
              // Unnesting the history swipers does NOT increase performance. Actually it may
              // even be worse to frequently create/destroy swipers. This swiper still has the
              // laggy non-cssMode swipes without any history swiper at all.
              // cssMode
              // update when number of slides changes
              onUpdate={updateSwiper}
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
              centeredSlides
              navigation={{
                prevEl: `.${navPrevClassName}`,
                nextEl: `.${navNextClassName}`,
              }}
              grabCursor
              watchOverflow
              // need this for CSS to hide slides that are partially offscreen
              watchSlidesProgress
              pagination={{
                el: `.${paginationClassName}`,
                clickable: true,
                // todo: maybe add a custom render and make the last one a "+" or something.
                // Kind of tricky to do though.
              }}
              style={{ padding: '11px 4px', flexGrow: '1' }}
            >
              {sessionLog?.records.map((id, i) => (
                <SwiperSlide key={id}>
                  <RecordCard
                    id={id}
                    deleteRecord={handleDeleteRecord}
                    swapRecords={handleSwapRecords}
                    swiperIndex={i}
                    updateSessionNotes={handleNotesChange}
                    sessionNotes={sessionLog.notes}
                    setMostRecentlyUpdatedExercise={
                      setMostRecentlyUpdatedExercise
                    }
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
                      date={dayjs(date)}
                      handleUpdateSession={handleUpdateSession}
                    />
                  )}
                </Stack>
              </SwiperSlide>
            </Swiper>
            <NavigationArrow
              direction="next"
              className={navNextClassName}
              disabled={isEnd}
            />
          </Stack>
        </Box>
      )}
    </Stack>
  )
}
