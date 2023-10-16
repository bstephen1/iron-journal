import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import NotesIcon from '@mui/icons-material/Notes'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Fab,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { ComboBoxField } from 'components/form-fields/ComboBoxField'
import ExerciseSelector from 'components/form-fields/selectors/ExerciseSelector'
import RecordCardSkeleton from 'components/loading/RecordCardSkeleton'
import StyledDivider from 'components/StyledDivider'
import dayjs from 'dayjs'
import { DATE_FORMAT } from 'lib/frontend/constants'
import {
  updateExerciseFields,
  updateRecordFields,
  useExercises,
  useRecord,
} from 'lib/frontend/restService'
import useDisplayFields from 'lib/frontend/useDisplayFields'
import useExtraWeight from 'lib/frontend/useExtraWeight'
import Exercise from 'models/Exercise'
import Note from 'models/Note'
import { ArrayMatchType } from 'models/query-filters/MongoQuery'
import { RecordQuery } from 'models/query-filters/RecordQuery'
import Record, { SetType } from 'models/Record'
import { Set } from 'models/Set'
import { Status } from 'models/Status'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { useMeasure } from 'react-use'
import { useSwiper } from 'swiper/react'
import HistoryCardsSwiper from '../history/HistoryCardsSwiper'
import HistoryFilterHeaderButton from '../history/HistoryFilterHeaderButton'
import RecordHeaderButton from './RecordHeaderButton'
import RecordNotesDialogButton from './RecordNotesDialogButton'
import RecordUnitsButton from './RecordUnitsButton'
import SetHeader from './SetHeader'
import SetInput from './SetInput'
import SetTypeSelect from './SetTypeSelect'

// Note: mui icons MUST use path imports instead of named imports!
// Otherwise in prod there will be serverless function timeout errors. Path imports also
// make loading significantly faster. Apparently the auto tree-shaking
// mui advertises does not actually work, or isn't set up properly.
// The icons were not causing any issues until 2023/03/06, when an updated
// prod build retractively made every build fail to work.
// See difference between path/named import: https://mui.com/material-ui/guides/minimizing-bundle-size/#option-one-use-path-imports
// See bug: https://github.com/orgs/vercel/discussions/1657

/** Calculates the reps field for the history filter for auto updates */
const calculateRepsFilter = (record: Record) => {
  /** If the given sets all have the same number of reps, returns that number.
   *  Otherwise returns undefined.
   */
  const findSameReps = (sets: Set[]) => {
    let reps = sets[0].reps
    for (const set of sets) {
      reps = set.reps === reps ? reps : 0
      if (!reps) return undefined
    }
    return reps
  }

  // todo: amrap/myo should be special default modifiers rather than hardcoding here
  const shouldExcludeReps =
    record.activeModifiers?.includes('amrap') ||
    record.activeModifiers?.includes('myo')

  return shouldExcludeReps ? undefined : findSameReps(record.sets)
}

interface Props {
  id: string
  deleteRecord: (id: string) => Promise<void>
  swapRecords: (i: number, j: number) => Promise<void>
  setMostRecentlyUpdatedExercise: (exercise: Exercise) => void
  /** This allows records within a session that are using the same exercise to see updates to notes/displayFields */
  mostRecentlyUpdatedExercise: Exercise | null
  updateSessionNotes: (notes: Note[]) => Promise<void>
  sessionNotes: Note[]
  swiperIndex: number
}
export default function RecordCard(props: Props) {
  const { id, swiperIndex, mostRecentlyUpdatedExercise } = props
  const { record } = useRecord(id)

  if (record === undefined) {
    return <RecordCardSkeleton title={`Record ${swiperIndex + 1}`} />
  } else if (record === null) {
    return (
      <RecordCardSkeleton
        Content={
          <Typography textAlign="center">
            Could not find record! Try reloading.
          </Typography>
        }
      />
    )
  } else {
    // Use the newly updated exercise so multiple cards with the same exercise will ripple their updates.
    // Note this doesn't mutate the underlying cache, but the cache is set up to mutate when the exercise is updated.
    const exercise =
      mostRecentlyUpdatedExercise?._id === record.exercise?._id
        ? mostRecentlyUpdatedExercise
        : record.exercise
    return (
      <LoadedRecordCard
        // key resets history filter when exercise changes or is renamed
        key={exercise?.name}
        {...props}
        record={{ ...record, exercise }}
      />
    )
  }
}

function LoadedRecordCard({
  id,
  deleteRecord,
  swapRecords,
  swiperIndex,
  setMostRecentlyUpdatedExercise,
  updateSessionNotes,
  sessionNotes = [],
  record,
}: Props & {
  record: Record
}) {
  const { exercise, activeModifiers, sets, notes, setType, _id } = record
  const attributes = exercise?.attributes ?? {}

  const swiper = useSwiper()
  const theme = useTheme()
  const noSwipingAboveSm = useMediaQuery(theme.breakpoints.up('sm'))
    ? 'swiper-no-swiping-record'
    : ''
  const { mutate: mutateRecord } = useRecord(id)
  const { exercises, mutate: mutateExercises } = useExercises({
    status: Status.active,
  })
  const router = useRouter()
  const displayFields = useDisplayFields(record)
  const extraWeight = useExtraWeight(record)
  const [titleRef, { width: titleWidth }] = useMeasure()
  const [moreButtonsAnchorEl, setMoreButtonsAnchorEl] =
    useState<null | HTMLElement>(null)
  const shouldCondense = useMemo(() => titleWidth < 360, [titleWidth])
  const [shouldSyncFilter, setShouldSyncFilter] = useState(true)
  const [historyFilter, setHistoryFilter] = useState<RecordQuery>({
    // todo: can't filter on no modifiers. Api gets "modifier=&" which is just dropped.
    modifier: record.activeModifiers,
    // don't want to include the current record in its own history
    end: dayjs(record.date).add(-1, 'day').format(DATE_FORMAT),
    exercise: record.exercise?.name,
    limit: 10,
    modifierMatchType: ArrayMatchType.Equivalent,
    setMatchType: 'set type',
    ...setType,
  })

  const updateFilter = (changes: Partial<RecordQuery>) =>
    setHistoryFilter((prevState) => ({ ...prevState, ...changes }))

  const addSet = async () => {
    const newSet = sets.at(-1)
      ? { ...sets.at(-1), effort: undefined }
      : ({} as Set)

    // Behavior is a bit up for debate. We've decided to only add a single new set
    // rather than automatically add an L and R set with values from the latest L and R
    // sets. This way should be more flexible if the user has a few sets as "both" and only
    // splits into L/R when it gets near failure. But if the last set was specified as L or R
    // we switch to the other side for the new set.
    // Another behavior could be to add L/R sets automatically when adding a new record, but
    // again the user may want to start with "both" and only split into L/R if they diverge.
    if (newSet.side === 'L') {
      newSet.side = 'R'
    } else if (newSet.side === 'R') {
      newSet.side = 'L'
    }

    mutateRecord(updateRecordFields(_id, { [`sets.${sets.length}`]: newSet }), {
      optimisticData: { ...record, sets: sets.concat(newSet) },
      revalidate: false,
    })
  }

  const handleFieldChange = async (changes: Partial<Record>) => {
    if (shouldSyncFilter && changes.activeModifiers) {
      updateFilter({ modifier: changes.activeModifiers })
    }
    mutateRecord(updateRecordFields(_id, { ...changes }), {
      optimisticData: { ...record, ...changes },
      revalidate: false,
    })
  }

  const handleRecordNotesChange = async (notes: Note[]) => {
    let sessionNotes = []
    let recordNotes = []
    for (const note of notes) {
      // for record notes, each note should only have a single tag
      if (note.tags.includes('Session')) {
        sessionNotes.push(note)
      } else {
        recordNotes.push(note)
      }
    }

    handleFieldChange({ notes: recordNotes })
    updateSessionNotes(sessionNotes)
  }

  const handleExerciseFieldsChange = async (changes: Partial<Exercise>) => {
    if (!exercise) return

    const newExercise = { ...exercise, ...changes }
    mutateRecord({ ...record, exercise: newExercise }, { revalidate: false })
    setMostRecentlyUpdatedExercise(newExercise)
    await updateExerciseFields(exercise, { ...changes })
  }

  const handleSetTypeChange = async (changes: Partial<SetType>) => {
    const newSetType = { ...setType, ...changes }
    const newRecord = { ...record, setType: newSetType }
    if (shouldSyncFilter) {
      updateFilter(changes)
    }
    mutateRecord(updateRecordFields(_id, { setType: newSetType }), {
      optimisticData: newRecord,
      revalidate: false,
    })
  }

  const handleSetChange = async (changes: Partial<Set>, i: number) => {
    const newSets = [...record.sets]
    newSets[i] = { ...newSets[i], ...changes }
    const newRecord = { ...record, sets: newSets }

    mutateRecord(
      updateRecordFields(_id, { [`sets.${i}`]: { ...sets[i], ...changes } }),
      { optimisticData: newRecord, revalidate: false }
    )
  }

  const handleDeleteSet = async (i: number) => {
    const newSets = record.sets.filter((_, j) => j !== i)

    mutateRecord(updateRecordFields(_id, { ['sets']: newSets }), {
      optimisticData: { ...record, sets: newSets },
      revalidate: false,
    })
  }

  const handleExerciseChange = async (newExercise: Exercise | null) => {
    // if an exercise changes, discard any modifiers that are not valid for the new exercise
    const remainingModifiers = activeModifiers.filter((modifier) =>
      newExercise?.modifiers.some((exercise) => exercise === modifier)
    )

    mutateRecord(
      updateRecordFields(_id, {
        exercise: newExercise,
        activeModifiers: remainingModifiers,
      }),
      {
        optimisticData: {
          ...record,
          exercise: newExercise,
          activeModifiers: remainingModifiers,
        },
        revalidate: false,
      }
    )
  }

  const MoveLeftButton = () => (
    <RecordHeaderButton
      title="Move current record to the left"
      disabled={!swiperIndex}
      onClick={() => swapRecords(swiperIndex, swiperIndex - 1)}
    >
      <KeyboardDoubleArrowLeftIcon />
    </RecordHeaderButton>
  )

  const MoveRightButton = () => (
    <RecordHeaderButton
      title="Move current record to the right"
      // disable on the penultimate slide because the last is the "add record" button
      disabled={swiperIndex >= swiper.slides?.length - 2}
      onClick={() => swapRecords(swiperIndex, swiperIndex + 1)}
    >
      <KeyboardDoubleArrowRightIcon />
    </RecordHeaderButton>
  )

  const UnitsButton = () => (
    <RecordUnitsButton
      displayFields={displayFields}
      handleSubmit={(displayFields) =>
        handleExerciseFieldsChange({ displayFields })
      }
      handleClose={() => setMoreButtonsAnchorEl(null)}
    />
  )

  const DeleteButton = () => (
    <RecordHeaderButton
      title="Delete Record"
      color="error"
      onClick={() => deleteRecord(_id)}
    >
      <DeleteIcon />
    </RecordHeaderButton>
  )

  // todo: add Category to Record so it persists (if exercise is filtered; mainly for programming)
  return (
    <>
      <Card elevation={3} sx={{ px: 1, m: 0.5 }}>
        <CardHeader
          ref={titleRef}
          title={`Record ${swiperIndex + 1}`}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <Box className={noSwipingAboveSm} sx={{ cursor: 'default' }}>
              {!shouldCondense && <MoveLeftButton />}
              {!shouldCondense && <MoveRightButton />}
              <RecordNotesDialogButton
                notes={[...sessionNotes, ...notes]}
                Icon={<NotesIcon />}
                title="Record Notes"
                sets={sets}
                handleSubmit={(notes) => handleRecordNotesChange(notes)}
              />
              {!!exercise && (
                <RecordNotesDialogButton
                  notes={exercise.notes}
                  options={exercise.modifiers}
                  Icon={<FitnessCenterIcon />}
                  title="Exercise Notes"
                  handleSubmit={(notes) =>
                    handleExerciseFieldsChange({ notes })
                  }
                  multiple
                />
              )}
              <HistoryFilterHeaderButton
                {...{
                  record,
                  filter: historyFilter,
                  units: displayFields.units,
                  shouldSync: shouldSyncFilter,
                  onSyncChange: (shouldSync) => {
                    setShouldSyncFilter(shouldSync)

                    // reset filter to current match current record
                    if (shouldSync) {
                      updateFilter({
                        ...setType,
                        modifier: activeModifiers,
                        modifierMatchType: ArrayMatchType.Equivalent,
                        setMatchType: 'set type',
                      })
                    }
                  },
                  updateFilter: (changes) => {
                    updateFilter(changes)
                    setShouldSyncFilter(false)
                  },
                }}
              />
              {!shouldCondense && <UnitsButton />}
              {/* todo: use nextjs prefetch when record is active: https://nextjs.org/docs/api-reference/next/router#routerprefetch  */}
              {!!exercise && (
                <RecordHeaderButton
                  title="Manage Exercise"
                  onClick={() =>
                    router.push(`/manage?exercise=${exercise.name}`)
                  }
                >
                  <SettingsIcon />
                </RecordHeaderButton>
              )}
              {!shouldCondense && <DeleteButton />}
              {shouldCondense && (
                <RecordHeaderButton
                  title="More..."
                  onClick={(e) => setMoreButtonsAnchorEl(e.currentTarget)}
                >
                  <MoreVertIcon />
                </RecordHeaderButton>
              )}
              <Menu
                id="more options menu"
                anchorEl={moreButtonsAnchorEl}
                open={!!moreButtonsAnchorEl}
                onClose={() => setMoreButtonsAnchorEl(null)}
              >
                <MenuItem>
                  <MoveLeftButton />
                </MenuItem>
                <MenuItem>
                  <MoveRightButton />
                </MenuItem>
                <MenuItem>
                  <UnitsButton />
                </MenuItem>
                <MenuItem>
                  <DeleteButton />
                </MenuItem>
              </Menu>
            </Box>
          }
        />
        <StyledDivider elevation={0} sx={{ height: 2, my: 0 }} />
        <CardContent
          // swiping causes weird behavior on desktop when combined with data input fields
          className={noSwipingAboveSm}
          sx={{ cursor: { sm: 'default' }, px: 1 }}
        >
          <Stack spacing={2}>
            <ExerciseSelector
              variant="standard"
              category={record.category}
              handleCategoryChange={(category) =>
                handleFieldChange({ category })
              }
              {...{
                exercise,
                exercises,
                handleChange: handleExerciseChange,
                mutate: mutateExercises,
              }}
            />
            <ComboBoxField
              label="Modifiers"
              options={exercise?.modifiers}
              initialValue={activeModifiers}
              variant="standard"
              helperText=""
              handleSubmit={(value: string[]) =>
                handleFieldChange({ activeModifiers: value })
              }
            />
            <SetTypeSelect
              setType={setType}
              units={displayFields.units}
              handleSubmit={handleSetTypeChange}
              sets={sets}
            />
            <SetHeader
              displayFields={displayFields}
              handleSubmit={(displayFields) =>
                handleExerciseFieldsChange({ displayFields })
              }
              // also check attributes incase bodyweight is set to true but no bodyweight exists
              showSplitWeight={attributes.bodyweight || !!extraWeight}
              showUnilateral={attributes.unilateral}
            />
          </Stack>

          {/* todo: the header could lock in constant values? Eg, reps = 5 (or, would that be too much?) */}
          <Box sx={{ pb: 0 }}>
            {sets.map((set, i) => (
              <SetInput
                key={i}
                set={set}
                displayFields={displayFields}
                handleSubmit={(changes: Partial<Set>) =>
                  handleSetChange(changes, i)
                }
                handleDelete={() => handleDeleteSet(i)}
                extraWeight={extraWeight}
              />
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
          <Tooltip title="Add Set" placement="right">
            <span>
              <Fab
                color="primary"
                size="medium"
                disabled={!displayFields?.visibleFields.length}
                onClick={addSet}
                className={noSwipingAboveSm}
              >
                <AddIcon />
              </Fab>
            </span>
          </Tooltip>
        </CardActions>
        <Box pt={3}>
          <HistoryCardsSwiper
            filter={historyFilter}
            shouldSync={shouldSyncFilter}
            paginationId={_id}
            displayFields={displayFields}
          />
        </Box>
      </Card>
    </>
  )
}
