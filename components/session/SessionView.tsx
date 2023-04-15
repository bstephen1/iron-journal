// @ts-nocheck
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
import { useCallback, useState } from 'react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
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

  // This is used to alert when a record changes an exercise, so other records can
  // be notified and mutate themselves to retrieve the new exercise data.
  const [mostRecentlyUpdatedExercise, setMostRecentlyUpdatedExercise] =
    useState<Exercise | null>(null)
  const { sessionLog, mutate, isLoading } = useSessionLog(date)
  const sessionHasRecords = !!sessionLog?.records.length

  const [swiper, setSwiper] = useState(null)
  // This is a callback ref. See https://legacy.reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
  const swiperElRef = useCallback((swiperEl) => {
    if (!swiperEl) return

    const swiperParams = {
      breakpoints: {
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
      },
      injectStyles: [
        `swiper-container {
            padding: 11px 4px !important; 
        }`,
      ],
    }

    Object.assign(swiperEl, swiperParams)

    // Can add event listeners to swiperEl here. Note: events must be changed to all lowercase!
    // Warning: adding event listeners significantly reduces performance!
    // Using event listeners may be what has been slowing down react swiper.

    swiperEl.initialize()
    setSwiper(swiperEl.swiper)
  }, [])

  const paginationClassName = 'pagination-record-card'
  const navPrevClassName = 'nav-prev'
  const navNextClassName = 'nav-next'

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
              // todo: this doesn't disable
              disabled={swiper?.isBeginning}
            />

            {/* todo: resizing breaks pagination and navigation clicks */}
            {/* swiper is being used with web components. The swiper library does
                provide react components, but they have noticeably poor performance,
                and are marked as deprecated. */}
            <swiper-container
              // Complex attributes (eg, breakpoints) need to be assigned in the callback ref,
              // so have to wait to init swiper until those attributes are assigned.
              init="false"
              ref={swiperElRef}
              no-swiping-class="swiper-no-swiping-record"
              space-between="20"
              pagination="true"
              navigation="true"
              navigation-prev-el={`.${navPrevClassName}`}
              navigation-next-el={`.${navNextClassName}`}
              keyboard="true"
              centered-slides="true"
              grab-cursor="true"
              pagination-el={`.${paginationClassName}`}
              pagination-clickable="true"
            >
              {/* wait for swiperEl to be set  */}
              {!!swiper &&
                sessionLog?.records.map((id, i) => (
                  <swiper-slide key={id}>
                    <RecordCard
                      id={id}
                      swiper={swiper}
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
                  </swiper-slide>
                ))}

              {!!swiper && (
                <swiper-slide
                  // if no records, disable swiping. The swiping prevents you from being able to close date picker
                  className={
                    sessionHasRecords ? '' : 'swiper-no-swiping-record'
                  }
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
                </swiper-slide>
              )}
            </swiper-container>
            <NavigationArrow
              direction="next"
              className={navNextClassName}
              disabled={swiper?.isEnd}
            />
          </Stack>
        </Box>
      )}
    </Stack>
  )
}
