import { Box, Divider, Stack, Typography, useTheme } from '@mui/material'
import { useRecords } from 'lib/frontend/restService'
import { RecordQuery } from 'models/query-filters/RecordQuery'
import { Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import HistoryCard from './HistoryCard'

import 'swiper/css'
import 'swiper/css/pagination'

import RecordCardSkeleton from 'components/loading/RecordCardSkeleton'
import { DisplayFields } from 'models/DisplayFields'
import { ArrayMatchType } from 'models/query-filters/MongoQuery'
import 'swiper/css/pagination'

interface Props {
  paginationId: string
  /** A record's displayFields are only up to date on fetch, so the current value must
   * be passed in to ensure it is in sync */
  displayFields: DisplayFields
  filter: RecordQuery
}
export default function HistoryCardsSwiper({
  paginationId,
  displayFields,
  filter,
}: Props) {
  // todo: limit this to something like 10 records before/after the date, then fetch more if the swiper gets close to either end.
  const { records, isLoading } = useRecords({
    ...filter,
    modifierMatchType: ArrayMatchType.Equivalent,
  })
  // each record's history needs a unique className
  const paginationClassName = `pagination-history-${paginationId}`

  if (isLoading || !records) {
    return (
      <>
        <HistoryTitle />
        <RecordCardSkeleton
          noHeader
          noSetButton
          titleTypographyProps={{ textAlign: 'center' }}
          elevation={0}
          sx={{ px: 0, m: 0 }}
        />
      </>
    )
  }

  // assumes filter has end date set to the current record's date (so will exclude it)
  if (!records.length) {
    return (
      <>
        <HistoryTitle />
        <RecordCardSkeleton
          noHeader
          titleTypographyProps={{ textAlign: 'center' }}
          elevation={0}
          sx={{ px: 0, m: 0 }}
          Content={
            <>
              <Typography textAlign="center">
                No history found for this exercise!
              </Typography>
              <Typography textAlign="center">
                Try changing the filters.
              </Typography>
            </>
          }
        />
      </>
    )
  }

  return (
    <Stack alignItems="center">
      {/* todo: add nav arrows */}
      <Box
        className={paginationClassName}
        display="flex"
        justifyContent="center"
        pt={2}
      />
      {/* this box prevents Swiper from having infinite width. Width is required when the stack has alignItems centered */}
      <Box width="100%" className="swiper-no-swiping-record">
        <Swiper
          spaceBetween={20}
          grabCursor
          // This isn't documented, but the out of bounds behavior sets the active slide to
          // the closest valid index (first slide starting at 0). This makes it pretty easy
          // to default to the last index when length is unknown, but has a max possible value.
          initialSlide={filter.limit}
          // disable autoHeight if cssMode is enabled
          autoHeight
          pagination={{
            el: `.${paginationClassName}`,
            clickable: true,
            // dynamic bullets work now without crashing, but they sometimes start shrinking and disappear.
            // Normal bullets are more reliable.
          }}
          modules={[Pagination]}
          style={{ padding: '11px 4px' }}
        >
          {records
            ?.map((record) => (
              <SwiperSlide key={record._id}>
                <HistoryCard
                  {...{
                    record,
                    displayFields,
                    filterModifiers: filter.modifier || [],
                  }}
                />
              </SwiperSlide>
              // need to reverse so newest is on the right, not left. Can't do it in useRecords because
              // mongo applies sort before the limit. Also, reverse should be after map because it mutates the array.
            ))
            .reverse()}
        </Swiper>
      </Box>
    </Stack>
  )
}

function HistoryTitle() {
  const theme = useTheme()

  return (
    <Box
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Divider
        sx={{
          fontSize: 12,
          width: '80%',
          '&::before, &::after': {
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        <Typography variant="h6">History</Typography>
      </Divider>
    </Box>
  )
}
