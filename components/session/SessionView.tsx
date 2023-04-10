import { Box, IconButton, Stack, useTheme } from '@mui/material'
import {
  addRecord,
  deleteSessionRecord,
  updateSessionLog,
  useSessionLog,
} from 'lib/frontend/restService'
import Exercise from 'models/Exercise'
import Record from 'models/Record'
import SessionLog from 'models/SessionLog'
import RecordCard from './records/RecordCard'
import TitleBar from './upper/TitleBar'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useState } from 'react'
import {
  A11y,
  Keyboard,
  Navigation,
  Pagination,
  Scrollbar,
  Swiper as SwiperClass,
} from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import AddRecordCard from './AddRecordCard'

// Swiper needs all these css classes to be imported too
import dayjs from 'dayjs'
import { DATE_FORMAT } from 'lib/frontend/constants'
import Note from 'models/Note'
import 'swiper/css'
import 'swiper/css/bundle'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'
import CopySessionCard from './CopySessionCard'
import HistoryCardsSwiper from './history/HistoryCardsSwiper'
import SessionModules from './upper/SessionModules'
import usePaginationSize from './usePaginationSize'

interface Props {
  date: string
}
export default function SessionView({ date }: Props) {
  const paginationSize = usePaginationSize()
  const theme = useTheme()
  const [isBeginning, setIsBeginning] = useState(false)
  const [isEnd, setIsEnd] = useState(false)
  // This is used to alert when a record changes an exercise, so other records can
  // be notified and mutate themselves to retrieve the new exercise data.
  const [mostRecentlyUpdatedExercise, setMostRecentlyUpdatedExercise] =
    useState<Exercise | null>(null)
  const [activeRecord, setActiveRecord] = useState<Record | null>(null)
  const { sessionLog, mutate, isLoading } = useSessionLog(date)
  const sessionHasRecords = !!sessionLog?.records.length
  const paginationClassName = 'pagination-record-cards'

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
          <Box
            className={paginationClassName}
            display="flex"
            justifyContent="center"
            pt={2}
            sx={{ ...paginationSize }}
          />
          <Stack direction="row">
            {/* todo: nav button ripples are elongated */}
            {/* todo: actually thinking of making these ListItemButtons, 
            HistoryCards are within the single Swiper, and the Icon can be sticky
            and scroll down the screen. The ListItemButton will be clickable 
            over the whole gutter. */}
            <Box display="flex" width="auto" alignItems="center">
              <IconButton
                sx={{ display: { xs: 'none', sm: 'block' } }}
                className="nav-prev-record"
                color="primary"
                disabled={isBeginning}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
            </Box>
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
              // think about leaning down this outer swiper to increase performance, maybe
              // pulling out the history swipers so they aren't nested. It's possible
              // for swipers to control other swipers, which could be more performant than nesting.
              cssMode
              // update when number of slides changes
              onUpdate={updateSwiper}
              noSwipingClass="swiper-no-swiping-record"
              modules={[Navigation, Pagination, Scrollbar, A11y, Keyboard]}
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
              // todo: height needs to be updated on init and set change
              // autoHeight
              centeredSlides
              navigation={{
                prevEl: '.nav-prev-record',
                nextEl: '.nav-next-record',
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
                    date={dayjs(date)}
                    deleteRecord={handleDeleteRecord}
                    swapRecords={handleSwapRecords}
                    setActiveRecord={setActiveRecord}
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
                  <AddRecordCard
                    handleAdd={handleAddRecord}
                    setActiveRecord={setActiveRecord}
                  />
                  {!sessionHasRecords && (
                    <CopySessionCard
                      date={dayjs(date)}
                      handleUpdateSession={handleUpdateSession}
                    />
                  )}
                </Stack>
              </SwiperSlide>
            </Swiper>
            <Box display="flex" alignItems="center">
              <IconButton
                sx={{ display: { xs: 'none', sm: 'block' } }}
                className="nav-next-record"
                color="primary"
                disabled={isEnd}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          </Stack>
          <Box py={3}>
            {/* 
              The filter here should be extracted from the active record, and not customizable.
              The intention is not to be a robust history search; it should be treated as an extension
              of the active record. A separate history page can be developed for more robust history
              searches (including graphs!)
            */}
            {activeRecord && (
              <HistoryCardsSwiper
                endDate={dayjs(date).add(-1, 'day').format(DATE_FORMAT)}
                displayFields={activeRecord.exercise?.displayFields}
                activeModifiers={activeRecord.activeModifiers}
                // The history should be showing the user recent data for that specific exercise.
                // It isn't showing what they did last session. That could be anything (even a different exercise!)
                // But for an exercise, weight and reps may change. So the only thing we can filter on is the
                // name and modifiers. Modifiers may change too if there are "don't-cares" (like straps / wraps) but should
                // be mostly good enough. Reps are hard to deal with because it would need to distinguish eg sets of 6, 8-12, 10-20, amrap, failed reps, etc.
                // So that would need to be an entirely separate field on the record card.
                filter={{
                  exercise: activeRecord.exercise?.name,
                  modifier: activeRecord.activeModifiers,
                  limit: 10,
                }}
              />
            )}
          </Box>
        </Box>
      )}
    </Stack>
  )
}
