import { Card, CardContent, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { memo, useCallback, useEffect } from 'react'
import { KeyedMutator } from 'swr'
import RecordCardSkeleton from '../../../components/loading/RecordCardSkeleton'
import StyledDivider from '../../../components/StyledDivider'
import HistoryCardsSwiper from '../history/HistoryCardsSwiper'
import HistoryTitle from '../history/HistoryTitle'
import { DATE_FORMAT } from '../../../lib/frontend/constants'
import {
  updateExerciseFields,
  updateRecordFields,
  useRecord,
} from '../../../lib/frontend/restService'
import useDisplayFields from '../../../lib/frontend/useDisplayFields'
import useExtraWeight from '../../../lib/frontend/useExtraWeight'
import { calculateTotalReps, UpdateFields } from '../../../lib/util'
import Exercise from '../../../models/AsyncSelectorOption/Exercise'
import { MatchType } from '../../../models/query-filters/MongoQuery'
import Record from '../../../models/Record'
import RecordCardHeader from './header/RecordCardHeader'
import RecordExerciseSelector from './RecordExerciseSelector'
import RecordModifierComboBox from './RecordModifierComboBox'
import RenderSets from './sets/RenderSets'
import SetTypeSelect from './SetTypeSelect'

// Note: mui icons MUST use path imports instead of named imports!
// Otherwise in prod there will be serverless function timeout errors. Path imports also
// make loading significantly faster. Apparently the auto tree-shaking
// mui advertises does not actually work, or isn't set up properly.
// The icons were not causing any issues until 2023/03/06, when an updated
// prod build retractively made every build fail to work.
// See difference between path/named import: https://mui.com/material-ui/guides/minimizing-bundle-size/#option-one-use-path-imports
// See bug: https://github.com/orgs/vercel/discussions/1657

interface Props {
  id: string
  isQuickRender?: boolean
  setMostRecentlyUpdatedExercise: (exercise: Exercise) => void
  /** This allows records within a session that are using the same exercise to see updates to notes/displayFields */
  mostRecentlyUpdatedExercise: Exercise | null
  swiperIndex: number
}
export default memo(function RecordCard(props: Props) {
  const { id, swiperIndex, mostRecentlyUpdatedExercise } = props
  const { record, mutate } = useRecord(id)

  // Use the newly updated exercise so multiple cards with the same exercise will ripple their updates.
  // This is wrapped in useEffect to avoid "cannot update component while rendering another component" console error.
  useEffect(() => {
    if (!record || !mostRecentlyUpdatedExercise?._id) return

    if (
      mostRecentlyUpdatedExercise._id === record.exercise?._id &&
      // Have to JSONify mostRecentlyUpdatedExercise to remove javascript class stuff since
      // record.exercise is pure json and mostRecentlyUpdatedExercise is a javascript class.
      JSON.stringify(mostRecentlyUpdatedExercise) !==
        JSON.stringify(record.exercise)
    ) {
      mutate({ ...record, exercise: mostRecentlyUpdatedExercise })
    }
  }, [mostRecentlyUpdatedExercise, mutate, record])

  if (record === undefined || props.isQuickRender) {
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
    return <LoadedRecordCard record={record} mutateRecord={mutate} {...props} />
  }
})

/** Record card with loaded record data.
 *
 * Note: This is an expensive component to render. Children should be memoized
 * so they only rerender when needed. With SWR, any time a given swr hook triggers
 * mutate(), any component using that hook will trigger a rerender. This means
 * children should NOT useRecord, or they will always rerender whenever any part of
 * the record is mutated. Instead, they should be passed only the props they need.
 * Context can also not be used because it works like swr -- any change to
 * the record will trigger a rerender.
 *
 * Memoized components without primitive props can make use of the second arg
 * for memo() to use the custom equality comparison function isEqual() from lodash.
 * Otherwise they'll still be rerendered because the mutation creates a new object.
 */
function LoadedRecordCard({
  swiperIndex,
  setMostRecentlyUpdatedExercise,
  record,
  mutateRecord,
}: Props & {
  record: Record
  mutateRecord: KeyedMutator<Record | null>
}) {
  const {
    exercise,
    activeModifiers,
    _id,
    sets,
    notes,
    category,
    setType,
    date,
    supersetGroup,
  } = record
  const displayFields = useDisplayFields(exercise)
  const extraWeight = useExtraWeight(record)

  const showSplitWeight = exercise?.attributes?.bodyweight || !!extraWeight
  const showUnilateral = exercise?.attributes?.unilateral

  const historyQuery = {
    modifier: activeModifiers,
    // don't want to include the current record in its own history
    end: dayjs(date).add(-1, 'day').format(DATE_FORMAT),
    exercise: exercise?.name,
    limit: 5,
    modifierMatchType: MatchType.Exact,
    setTypeMatchType: MatchType.Exact,
    ...setType,
  }

  const mutateExerciseFields: UpdateFields<Exercise> = useCallback(
    async (changes) => {
      mutateRecord(
        (cur) => {
          if (!cur?.exercise) return null

          const newExercise = { ...cur.exercise, ...changes }
          setMostRecentlyUpdatedExercise(newExercise)
          updateExerciseFields(cur.exercise, { ...changes })
          return { ...cur, exercise: newExercise }
        },
        { revalidate: false },
      )
    },
    [mutateRecord, setMostRecentlyUpdatedExercise],
  )

  const mutateRecordFields: UpdateFields<Record> = useCallback(
    async (changes) => {
      mutateRecord(updateRecordFields(_id, { ...changes }), {
        optimisticData: (cur) => (cur ? { ...cur, ...changes } : null),
        revalidate: false,
      })
    },
    [mutateRecord, _id],
  )

  // todo: add Category to Record so it persists (if exercise is filtered; mainly for programming)
  return (
    <>
      <Card elevation={3} sx={{ px: 1, m: 0.5 }}>
        <RecordCardHeader
          {...{
            mutateExerciseFields,
            swiperIndex,
            mutateRecordFields,
            _id,
            sets,
            exercise,
            notes,
            displayFields,
            date,
            supersetGroup,
          }}
        />
        <StyledDivider elevation={0} sx={{ height: 2, my: 0 }} />
        <CardContent
          // swiping causes weird behavior on desktop when combined with data input fields
          sx={{ px: 1 }}
        >
          <Stack spacing={2}>
            <RecordExerciseSelector
              {...{ mutateRecordFields, activeModifiers, exercise, category }}
            />
            <RecordModifierComboBox
              availableModifiers={exercise?.modifiers}
              {...{ mutateRecordFields, activeModifiers }}
            />
            <SetTypeSelect
              units={displayFields.units}
              totalReps={calculateTotalReps(sets, setType)}
              showRemaining
              {...{ handleChange: mutateRecordFields, setType }}
            />
            <RenderSets
              {...{
                mutateExerciseFields,
                displayFields,
                sets,
                showSplitWeight,
                showUnilateral,
                _id,
                extraWeight,
              }}
            />
            <HistoryTitle />
            <HistoryCardsSwiper
              query={historyQuery}
              actions={['recordNotes']}
              content={['sets']}
              {...{
                _id,
                displayFields,
              }}
            />
          </Stack>
        </CardContent>
      </Card>
    </>
  )
}
