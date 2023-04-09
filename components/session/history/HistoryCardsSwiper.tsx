import { Box, Paper, Stack, Typography } from '@mui/material'
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

import LoadingSpinner from 'components/loading/LoadingSpinner'
import { DEFAULT_DISPLAY_FIELDS, DisplayFields } from 'models/DisplayFields'
import { ArrayMatchType } from 'models/query-filters/MongoQuery'
import { useEffect, useMemo, useState } from 'react'
import 'swiper/css/pagination'

interface Props {
  displayFields?: DisplayFields
  date: string
  filter: RecordQuery
}
export default function HistoryCardsSwiper({
  date,
  displayFields = DEFAULT_DISPLAY_FIELDS,
  filter,
}: Props) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null)
  // todo: limit this to something like 10 records before/after the date, then fetch more if the swiper gets close to either end.
  const { records, isLoading } = useRecords({
    ...filter,
    modifierMatchType: ArrayMatchType.Equivalent,
    sort: 'oldestFirst',
  })
  // each record's history needs a unique className
  const paginationClassName = `pagination-history`
  const mostRecentDateIndex = useMemo(
    () =>
      records ? records.findIndex((record) => record.date === date) - 1 : 0,
    [records, date]
  )

  // When the records get updated (ie, filters change) we need to slide to the new most recent slide.
  // Can't use swiper's initialSlide because the swiper doesn't get always get rerendered when records change.
  useEffect(() => {
    // guard against just initialized/destroyed swiper
    if (typeof swiper?.activeIndex === 'number') {
      // This behavior might not be great UX in practice. It's a bit tricky though. If you swap around the filters
      // you may expect to stay on the same date if it still exists on the new filter. But the filter is usually
      // something you'd set up initially, before browsing. And in that case the filter can be too restricted initially
      // and end up not showing the most recent record when you do set it up.
      swiper.slideTo(mostRecentDateIndex)
    }
  }, [mostRecentDateIndex, swiper])

  if (isLoading || !records) {
    return (
      <Paper elevation={3} sx={{ px: 1, m: 0.5 }}>
        <LoadingSpinner />
      </Paper>
    )
  }

  // length will be 1 at minimum because the current record will always be fetched
  if (records && records.length < 2) {
    return (
      <Paper elevation={3} sx={{ px: 1, py: 4, m: 0.5 }}>
        <Typography textAlign="center">
          No records with those filters!
        </Typography>
      </Paper>
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
      <Box width="100%">
        <Swiper
          spaceBetween={20}
          onSwiper={setSwiper}
          noSwipingClass="swiper-no-swiping-inner"
          className="swiper-no-swiping-outer"
          grabCursor
          // This isn't documented, but the out of bounds behavior sets the active slide to
          // the closest valid index (first slide starting at 0). This makes it pretty easy
          // to default to the most recent date.
          initialSlide={filter.limit}
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
          {records
            ?.filter((record) => record.date !== date)
            .map((record) => (
              <SwiperSlide key={record._id}>
                <HistoryCard {...{ record, displayFields }} />
              </SwiperSlide>
            ))}
        </Swiper>
      </Box>
    </Stack>
  )
}
