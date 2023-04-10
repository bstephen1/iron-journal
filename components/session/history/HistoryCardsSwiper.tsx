import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useRecords } from 'lib/frontend/restService'
import { RecordQuery } from 'models/query-filters/RecordQuery'
import {
  Controller,
  Navigation,
  Pagination,
  Scrollbar,
  Swiper as SwiperClass
} from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import HistoryCard from './HistoryCard'

import 'swiper/css'
import 'swiper/css/bundle'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import RecordCardSkeleton from 'components/loading/RecordCardSkeleton'
import { DisplayFields } from 'models/DisplayFields'
import { ArrayMatchType } from 'models/query-filters/MongoQuery'
import { useState } from 'react'
import 'swiper/css/pagination'

interface Props {
  /** Override the display fields for the fetched records. Can be useful if display fields may update
   *  after the records are fetched. A record's displayFields are only up to date on fetch.
   */
  displayFields?: DisplayFields
  /** inclusive */
  endDate: string
  filter: RecordQuery
  activeModifiers: string[]
}
export default function HistoryCardsSwiper({
  endDate,
  displayFields,
  filter,
  activeModifiers,
}: Props) {
  // todo: limit this to something like 10 records before/after the date, then fetch more if the swiper gets close to either end.
  const { records, isLoading } = useRecords({
    ...filter,
    modifierMatchType: ArrayMatchType.Equivalent,
    sort: 'oldestFirst',
    end: endDate,
  })
  // each record's history needs a unique className
  const paginationClassName = `pagination-history`
  const [isBeginning, setIsBeginning] = useState(false)
  const [isEnd, setIsEnd] = useState(false)

  const updateSwiper = (swiper: SwiperClass) => {
    setIsBeginning(swiper.isBeginning)
    setIsEnd(swiper.isEnd)
  }

  if (isLoading || !records) {
    return <RecordCardSkeleton title="History" readOnly />
  }

  if (!records.length) {
    return (
      <RecordCardSkeleton
        title="History"
        readOnly
        Content={
          <Typography textAlign="center">
            No history found for this exercise!
          </Typography>
        }
      />
    )
  }

  return (
    <Stack alignItems="center">
      {/* Dynamic pagination css is very finnicky and opaque. 
          Finally got centered by wrapping them in this centered box to force them
          to be centered. Also requires position relative for some reason. */}
      <Box>
        <Box
          // Setting pagination size overwrites the dynamic bullet size.
          // Couldn't find a way to set the main and dynamic bullets separately.
          // CSS classes are swiper-pagination-bullet-active-main and swiper-pagination-bullet-active-next
          // Swiper css is in swiper/swiper-bundle.css, which has the class used to change pagination size,
          // but there's no obvious equivalent for dynamic bullets.
          className={paginationClassName}
          display="flex"
          justifyContent="center"
          pt={2}
        // position="relative"
        />
      </Box>
      {/* this box prevents Swiper from deciding it needs to have infinite width for some reason. Width is required when stack has alignItems centered */}
      <Stack direction="row" sx={{ width: '100%' }}>
        <Box display="flex" width="auto" alignItems="center">
          <IconButton
            sx={{ display: { xs: 'none', sm: 'block' } }}
            className="nav-prev-history"
            color="primary"
            disabled={isBeginning}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        </Box>
        <Swiper
          onSwiper={updateSwiper}
          onSlideChange={updateSwiper}
          onUpdate={updateSwiper}
          spaceBetween={20}
          grabCursor
          // This isn't documented, but the out of bounds behavior sets the active slide to
          // the closest valid index (first slide starting at 0). This makes it pretty easy
          // to default to the most recent date.
          initialSlide={filter.limit}
          navigation={{
            prevEl: '.nav-prev-history',
            nextEl: '.nav-next-history',
          }}
          autoHeight
          // todo: initial slide based on date
          pagination={{
            el: `.${paginationClassName}`,
            clickable: true,
            // dynamic bullets cause a total crash when navigating from SessionView to some other page, then back to SessionView.
            // This appears to only occur in production.
            // dynamicBullets: true,
            // dynamicMainBullets: 5,
          }}
          modules={[Pagination, Navigation, Scrollbar, Controller]}
          style={{ padding: '11px 4px' }}
        >
          {records.map((record) => (
            <SwiperSlide key={record._id}>
              <HistoryCard {...{ record, displayFields, activeModifiers }} />
            </SwiperSlide>
          ))}
        </Swiper>
        <Box display="flex" width="auto" alignItems="center">
          <IconButton
            sx={{ display: { xs: 'none', sm: 'block' } }}
            className="nav-next-history"
            color="primary"
            disabled={isEnd}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  )
}
