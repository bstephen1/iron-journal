import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import {
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Collapse,
  Stack,
  Typography
} from '@mui/material'
import { ComboBoxField } from 'components/form-fields/ComboBoxField'
import NumericFieldAutosave from 'components/form-fields/NumericFieldAutosave'
import ExerciseSelector from 'components/form-fields/selectors/ExerciseSelector'
import StyledDivider from 'components/StyledDivider'
import dayjs from 'dayjs'
import { useExercises } from 'lib/frontend/restService'
import useDisplayFields from 'lib/frontend/useDisplayFields'
import Exercise from 'models/Exercise'
import Record from 'models/Record'
import { useEffect, useState } from 'react'
import RecordHeaderButton from '../records/RecordHeaderButton'
import SessionDatePicker from '../upper/SessionDatePicker'

interface Props {
  /** A Record can be provided to pull data from */
  record?: Record | null
}
export default function HistoryFilter({ record }: Props) {
  const [repFilter, setRepFilter] = useState<number>()
  const [modifierFilter, setModifierFilter] = useState<string[]>([])
  const displayFields = useDisplayFields(record)
  const { exercises, mutate: mutateExercises } = useExercises()
  const [exercise, setExercise] = useState<Exercise | null>(
    record?.exercise || null
  )
  const [shouldAutoUpdate, setShouldAutoUpdate] = useState(true)
  const [date, setDate] = useState(dayjs(record?.date))
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!record || !shouldAutoUpdate) return

    setExercise(record.exercise)
    setDate(dayjs(record.date))

    // only filter if there is a value.
    // todo: can't filter on no modifiers. Api gets "modifier=&" which is just dropped.
    setModifierFilter(record.activeModifiers)

    // todo: amrap/myo need to be special default modifiers rather than hardcoding here
    if (
      record.sets[0]?.reps &&
      !record.activeModifiers.includes('amrap') &&
      !record.activeModifiers.includes('myo')
    ) {
      setRepFilter(record.sets[0].reps)
    } else {
      setRepFilter(undefined)
    }
  }, [record, shouldAutoUpdate])

  // todo: may want to merge this into the RecordCard
  return (
    <Stack spacing={2}>
      <Card elevation={3} sx={{ px: 1, m: 0.5 }}>
        <CardHeader
          title={`History`}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <RecordHeaderButton title="Filter" onClick={() => setOpen(!open)}>
              <FilterAltOutlinedIcon />
            </RecordHeaderButton>
          }
        />
        <Collapse in={open}>
          <StyledDivider elevation={0} sx={{ height: 2, my: 0 }} />

          <CardContent sx={{ px: 1 }}>
            <Stack spacing={2}>
              <SessionDatePicker
                date={date}
                label="End Date"
                handleDateChange={setDate}
                textFieldProps={{ variant: 'standard' }}
              />
              <ExerciseSelector
                variant="standard"
                {...{
                  exercise,
                  exercises,
                  handleChange: setExercise,
                  mutate: mutateExercises,
                }}
              />
              <ComboBoxField
                label="Filter Modifiers"
                options={exercise?.modifiers}
                initialValue={record?.activeModifiers || []}
                variant="standard"
                handleSubmit={setModifierFilter}
              />
              <NumericFieldAutosave
                label="Filter reps"
                initialValue={record?.sets[0]?.reps}
                handleSubmit={setRepFilter}
                variant="standard"
              />
              <Stack direction="row">
                <Checkbox
                  checked={shouldAutoUpdate}
                  onChange={(e) => setShouldAutoUpdate(e.target.checked)}
                  sx={{ width: '55px', height: '55px' }}
                />
                <Typography display="flex" alignItems="center">
                  Auto update filters
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Collapse>
      </Card>
      {/* <HistoryCardsSwiper
        endDate={date.format(DATE_FORMAT)}
        displayFields={displayFields}
        filter={{
          exercise: exercise?.name,
          reps: repFilter,
          modifier: modifierFilter,
          limit: 10
        }}
      /> */}
    </Stack>
  )
}
