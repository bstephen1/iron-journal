// @ts-nocheck
// todo: ignoring Set typing issues for now
import {
  Delete,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from '@mui/icons-material'
import AddIcon from '@mui/icons-material/Add'
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Fab,
  IconButton,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material'
import Grid from '@mui/system/Unstable_Grid'
import { useRef, useEffect } from 'react'
import { useMeasure } from 'react-use'
import { useSwiper, useSwiperSlide } from 'swiper/react'
import {
  updateRecordFields,
  useExercises,
  useRecord,
} from '../../lib/frontend/restService'
import Exercise from '../../models/Exercise'
import { ExerciseStatus } from '../../models/ExerciseStatus'
import Record from '../../models/Record'
import { SetType } from '../../models/SetType'
import { ComboBoxField } from '../form-fields/ComboBoxField'
import SelectFieldAutosave from '../form-fields/SelectFieldAutosave'
import { ExerciseSelector } from '../form-fields/selectors/ExerciseSelector'
import StyledDivider from '../StyledDivider'
import StandardSetInput from './sets/StandardSetInput'

interface Props {
  id: Record['_id']
  deleteRecord: (id: string) => void
  swapRecords: (i: number, j: number) => void
  index: number
}
export default function RecordInput({
  id,
  deleteRecord,
  swapRecords,
  index,
}: Props) {
  const swiper = useSwiper()
  // this hook needs to be called for useSwiper() to update the activeIndex, but is otherwise unused
  const _ = useSwiperSlide()
  // this may be making browser resizing laggy.
  const [ref, { width }] = useMeasure()
  const REF_SM = 400
  const { record, isError, mutate: mutateRecord } = useRecord(id)
  const { exercises, mutate: mutateExercises } = useExercises({
    status: ExerciseStatus.ACTIVE,
  })

  if (isError) {
    console.error('Could not fetch record!')
    return <></>
  }

  // todo: skeleton?
  if (!record || !exercises) {
    return <></>
  }

  // todo: when exercise is null'd the record doesn't show (still exists in db)
  // define after null checks so record must exist
  const { exercise, type, activeModifiers, sets, _id } = record

  const addSet = () => {
    const last = sets[sets.length - 1] ?? {}
    // todo: init first set, and possibly have different behavior when adding different types of sets?
    const newSet = { ...last, effort: undefined }
    updateRecordFields(_id, { [`sets.${sets.length}`]: newSet })
    mutateRecord({ ...record, sets: sets.concat(newSet) })
  }

  const handleFieldChange = <T extends keyof Record>(
    field: T,
    value: Record[T]
  ) => {
    updateRecordFields(_id, { [field]: value })
    mutateRecord({ ...record, [field]: value })
  }

  const handleSetChange = (setField, value, i) => {
    updateRecordFields(_id, { [`sets.${i}.${setField}`]: value })
    const newSets = [...record.sets]
    newSets[i][setField] = value
    mutateRecord({ ...record, sets: newSets })
  }

  const handleDeleteSet = (i) => {
    const newSets = record.sets.filter((_, j) => j !== i)
    updateRecordFields(_id, { ['sets']: newSets })
    mutateRecord({ ...record, sets: newSets })
  }

  const handleDeleteRecord = () => {
    deleteRecord(id)
    // todo: this became glitchy after deleting records from db instead of just removing from session array
    swiper.update() // have to update swiper whenever changing swiper elements
  }

  const handleSwapRecords = (i, j) => {
    swapRecords(i, j)
    swiper.update()
    // todo: think about animation here. Instant speed? Maybe if it could change to a fade transition?
    swiper.slideTo(j)
  }

  const handleExerciseChange = (newExercise: Exercise | null) => {
    // if an exercise changes, discard any modifiers that are not valid for the new exercise
    const remainingModifiers = activeModifiers.filter((modifier) =>
      newExercise?.modifiers.some((exercise) => exercise === modifier)
    )

    updateRecordFields(_id, {
      exercise: newExercise,
      activeModifiers: remainingModifiers,
    })
    mutateRecord({
      ...record,
      exercise: newExercise,
      activeModifiers: remainingModifiers,
    })
  }

  // todo: select input units (if you display in kg units, you can input in lbs and it will convert)
  // todo: preserve state when changing set type?
  // todo: use carousel? https://github.com/Learus/react-material-ui-carousel
  // todo: add Category to Record so it persists (if exercise is filtered; mainly for programming)
  return (
    <Card elevation={10} sx={{ px: 1 }} ref={ref}>
      <CardHeader
        title={`Record ${index + 1}`}
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <>
            <Tooltip
              title="Move current record to the left"
              placement="bottom-end"
            >
              <IconButton
                className="swiper-no-swiping"
                disabled={swiper.isBeginning}
                onClick={() => handleSwapRecords(index, index - 1)}
              >
                <KeyboardDoubleArrowLeft />
              </IconButton>
            </Tooltip>
            <Tooltip
              title="Move current record to the right"
              placement="bottom-end"
            >
              <IconButton
                className="swiper-no-swiping"
                // disable on the penultimate slide because the last is the "add record" button
                disabled={swiper.activeIndex >= swiper.slides?.length - 2}
                onClick={() => handleSwapRecords(index, index + 1)}
              >
                <KeyboardDoubleArrowRight />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Record" placement="bottom-end">
              {/* todo: make a menu? Maybe will want to add other stuff. Actually, maybe only for when the screen is small. Lots of empty space in the title bar. */}
              <IconButton
                className="swiper-no-swiping"
                color="error"
                onClick={handleDeleteRecord}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </>
        }
      />
      <StyledDivider elevation={0} sx={{ height: 2, my: 0 }} />
      <CardContent
        // swiping causes weird behavior when combine with data input fields, so disable it
        className="swiper-no-swiping" // lol
        sx={{ cursor: 'default' }}
      >
        <Grid container spacing={2}>
          <Grid xs={width < REF_SM ? 12 : 6}>
            <ExerciseSelector
              variant="standard"
              {...{
                exercise,
                exercises,
                handleChange: handleExerciseChange,
                mutate: mutateExercises,
              }}
            />
          </Grid>
          <Grid xs={width < REF_SM ? 12 : 6}>
            <SelectFieldAutosave
              label="Set Type"
              initialValue={type}
              fullWidth
              defaultHelperText=""
              variant="standard"
              options={Object.values(SetType)}
              handleSubmit={(value) => handleFieldChange('type', value)}
            />
          </Grid>
          <Grid xs={12}>
            <ComboBoxField
              label="Modifiers"
              options={exercise?.modifiers}
              initialValue={activeModifiers}
              variant="standard"
              handleSubmit={(value: string[]) =>
                handleFieldChange('activeModifiers', value)
              }
            />
          </Grid>
        </Grid>

        <Box sx={{ p: 2, pb: 0 }}>
          {/* todo: unique key */}
          {sets.map((set, i) => (
            <Stack key={i} direction="row">
              <StandardSetInput
                {...set}
                type={record.type}
                units={{ primary: 'kg' }}
                key={i}
                index={i}
                handleSubmit={(setField, value) =>
                  handleSetChange(setField, value, i)
                }
                handleDelete={() => handleDeleteSet(i)}
              />
            </Stack>
          ))}
        </Box>
      </CardContent>
      <CardActions
        sx={{
          display: 'flex',
          justifyContent: 'center',
          px: 2,
          pb: 2,
        }}
      >
        {/* <Button onClick={() => deleteRecord(_id)} color="error">
          Delete Record
        </Button> */}
        {/* <Button onClick={addSet} variant="contained">
          Add Set
        </Button> */}
        {/* todo: extend on hover with text? */}
        <Tooltip title="Add Set" placement="right">
          <Fab
            color="primary"
            size="medium"
            onClick={addSet}
            className="swiper-no-swiping"
          >
            <AddIcon />
          </Fab>
        </Tooltip>
      </CardActions>
    </Card>
  )
}
