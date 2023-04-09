import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Checkbox,
  Stack,
  Typography
} from '@mui/material'
import { ComboBoxField } from 'components/form-fields/ComboBoxField'
import NumericFieldAutosave from 'components/form-fields/NumericFieldAutosave'
import ExerciseSelector from 'components/form-fields/selectors/ExerciseSelector'
import StyledDivider from 'components/StyledDivider'
import dayjs from 'dayjs'
import { DATE_FORMAT } from 'lib/frontend/constants'
import { useExercises } from 'lib/frontend/restService'
import useDisplayFields from 'lib/frontend/useDisplayFields'
import Exercise from 'models/Exercise'
import Record from 'models/Record'
import { useEffect, useState } from 'react'
import SessionDatePicker from '../upper/SessionDatePicker'
import HistoryCardsSwiper from './HistoryCardsSwiper'

interface Props {
  /** A Record can be provided to pull data from */
  record?: Record | null
}
export default function HistoryFilter({ record }: Props) {
  const [repFilter, setRepFilter] = useState<number>()
  const [shouldFilterReps, setShouldFilterReps] = useState(false)
  const [modifierFilter, setModifierFilter] = useState<string[]>([])
  const [shouldFilterModifiers, setShouldFilterModifiers] = useState(false)
  const displayFields = useDisplayFields(record)
  const { exercises, mutate: mutateExercises } = useExercises()
  const [exercise, setExercise] = useState<Exercise | null>(
    record?.exercise || null
  )
  const [shouldAutoUpdate, setShouldAutoUpdate] = useState(true)
  const [date, setDate] = useState(dayjs(record?.date))

  useEffect(() => {
    if (!record || !shouldAutoUpdate) return

    setExercise(record.exercise)
    setDate(dayjs(record.date))

    // only filter if there is a value.
    // todo: can't filter on no modifiers. Api gets "modifier=&" which is just dropped.
    setShouldFilterModifiers(!!record.activeModifiers.length)
    setModifierFilter(record.activeModifiers)

    // todo: amrap/myo need to be special default modifiers rather than hardcoding here
    if (
      record.sets[0]?.reps &&
      !record.activeModifiers.includes('amrap') &&
      !record.activeModifiers.includes('myo')
    ) {
      setShouldFilterReps(true)
      setRepFilter(record.sets[0].reps)
    } else {
      setShouldFilterReps(false)
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
        />
        <StyledDivider elevation={0} sx={{ height: 2, my: 0 }} />

        <CardContent sx={{ px: 1 }}>
          <Stack spacing={2}>
            <SessionDatePicker
              date={date}
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
            <Stack direction="row">
              <Checkbox
                checked={shouldFilterModifiers}
                onChange={(e) => setShouldFilterModifiers(e.target.checked)}
                sx={{ width: '55px', height: '55px' }}
              />
              <ComboBoxField
                label="Filter Modifiers"
                options={exercise?.modifiers}
                initialValue={record?.activeModifiers || []}
                variant="standard"
                handleSubmit={setModifierFilter}
              />
            </Stack>
            <Stack direction="row">
              <Checkbox
                checked={shouldFilterReps}
                onChange={(e) => setShouldFilterReps(e.target.checked)}
                sx={{ width: '55px', height: '55px' }}
              />
              <NumericFieldAutosave
                label="Filter reps"
                initialValue={record?.sets[0]?.reps}
                handleSubmit={setRepFilter}
                variant="standard"
              />
            </Stack>
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
        <CardActions></CardActions>
      </Card>
      <HistoryCardsSwiper
        date={date.format(DATE_FORMAT)}
        displayFields={displayFields}
        filter={{
          exercise: exercise?.name,
          reps: shouldFilterReps ? repFilter : undefined,
          modifier: shouldFilterModifiers ? modifierFilter : undefined,
        }}
      />
    </Stack>
  )
}
