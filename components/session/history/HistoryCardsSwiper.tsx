import { Box, IconButton, Stack, Typography } from '@mui/material'
import { useRecords } from 'lib/frontend/restService'
import { RecordQuery } from 'models/query-filters/RecordQuery'
import HistoryCard from './HistoryCard'

import 'swiper/css'
import 'swiper/css/bundle'

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIos'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import RecordCardSkeleton from 'components/loading/RecordCardSkeleton'
import { KeenSliderPlugin, useKeenSlider } from 'keen-slider/react'
import { DisplayFields } from 'models/DisplayFields'
import { ArrayMatchType } from 'models/query-filters/MongoQuery'
import { useState } from 'react'
import 'swiper/css/pagination'

const AdaptiveHeight: KeenSliderPlugin = (slider) => {
  function updateHeight() {
    slider.container.style.height =
      slider.slides[slider.track.details.rel].offsetHeight + 'px'
  }
  slider.on('created', updateHeight)
  slider.on('slideChanged', updateHeight)
}

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
  const [isSliderLoading, setIsSliderLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      slides: {
        spacing: 20,
      },
      renderMode: 'performance',
      // todo: set to last, but length is unknown. Maybe reverse mongo fetch and do rtl
      // initial: -1,
      // rubberband should be false in a nested slider
      rubberband: false,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel)
      },
      created() {
        setIsSliderLoading(false)
      },
    },
    [AdaptiveHeight]
  )

  // useEffect(() => {
  //   if (currentSlide >= 0 || !records) return

  //   instanceRef.current?.moveToIdx(records.length)
  // }, [records, currentSlide, instanceRef]);

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

  /*
        <Swiper
          autoHeight
        >



  */

  return (
    <Stack alignItems="center">
      <Box>
        <Box className="dots" display="flex" justifyContent="center" pt={2}>
          {[
            ...Array(instanceRef.current?.track.details.slides.length).keys(),
          ].map((i) => {
            return (
              <button
                key={i}
                onClick={() => {
                  instanceRef.current?.moveToIdx(i)
                }}
                className={'dot' + (currentSlide === i ? ' active' : '')}
              ></button>
            )
          })}
        </Box>
      </Box>
      {/* this box prevents the slider from having infinite width. Width is required when stack has alignItems centered */}
      <Stack direction="row" sx={{ width: '100%' }}>
        <Box display="flex" width="auto" alignItems="center">
          <IconButton
            sx={{ display: { xs: 'none', sm: 'block' } }}
            className="nav-prev-history"
            color="primary"
            disabled={currentSlide === 0}
            onClick={instanceRef.current?.prev}
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        </Box>
        <Box ref={sliderRef} className="keen-slider" sx={{ cursor: 'grab' }}>
          {records.map((record) => (
            <Box className="keen-slider__slide" key={record._id}>
              <HistoryCard {...{ record, displayFields, activeModifiers }} />
            </Box>
          ))}
        </Box>
        <Box display="flex" width="auto" alignItems="center">
          <IconButton
            sx={{ display: { xs: 'none', sm: 'block' } }}
            className="nav-next-history"
            color="primary"
            disabled={
              currentSlide ===
              (instanceRef.current?.track.details.slides.length ?? 0) - 1
            }
            onClick={instanceRef.current?.next}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Stack>
    </Stack>
  )
}
