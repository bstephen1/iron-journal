import { Box, CardHeader } from '@mui/material'
import { useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'
import useResizeObserver from 'use-resize-observer'
import { UpdateFields } from '../../../../lib/util'
import Exercise from '../../../../models/AsyncSelectorOption/Exercise'
import { DisplayFields } from '../../../../models/DisplayFields'
import Record from '../../../../models/Record'
import ChangeUnitsButton from './ChangeUnitsButton'
import DeleteRecordButton from './DeleteRecordButton'
import ExerciseNotesButton from './ExerciseNotesButton'
import ManageExerciseButton from './ManageExerciseButton'
import MoreActionsButton from './MoreActionsButton'
import RecordNotesButton from './ReccordNotesButton'
import SwapRecordButton from './SwapRecordButton'
import SupersetButton from './SupersetButton'
const actionButtonWidth = 40
const minTitleWidth = 120

const actionsToWidth = (actions: number) =>
  actions * actionButtonWidth + minTitleWidth
const widthToActions = (width: number) =>
  Math.floor((width - minTitleWidth) / actionButtonWidth)

/** determines how many actions can visibly fit in the record header */
const useMaxVisibleActions = (totalActions: number) => {
  const [cardHeaderActions, setCardHeaderActions] = useLocalStorageState(
    'cardHeaderActions',
    {
      defaultValue: 0,
    },
  )

  // Width inits as undefined on mount since the ref needs a frame to setup.
  // By using local storage we can persist previous data between route changes,
  // preventing the undefined state when using the date picker to change sessions.
  const { ref, width = actionsToWidth(cardHeaderActions) } =
    useResizeObserver<HTMLSpanElement>()

  // max number of action buttons that will visibly fit in the header
  const maxVisibleActions = widthToActions(width)

  // limits actions to be no less than 0 and no more than total actions
  const maxBoundedActions = Math.max(
    Math.min(maxVisibleActions, totalActions),
    0,
  )
  // don't hide an action if it would be the only hidden action
  const visibleActions =
    maxBoundedActions === totalActions - 1 ? totalActions : maxBoundedActions

  // Update local storage. Use visibleActions to limit setState calls.
  useEffect(() => {
    setCardHeaderActions(visibleActions)
  }, [setCardHeaderActions, visibleActions])

  return {
    /** must assign this ref to the record header element */
    ref,
    /** Denotes an index in the actions array. Items before this index (exclusive) can be visible.  */
    visibleActions,
  }
}

interface Props
  extends Pick<
    Record,
    'notes' | 'sets' | '_id' | 'exercise' | 'supersetGroup'
  > {
  swiperIndex: number
  mutateExerciseFields: UpdateFields<Exercise>
  mutateRecordFields: UpdateFields<Record>
  displayFields: DisplayFields
  date: string
}
export default function RecordCardHeader({
  swiperIndex,
  mutateExerciseFields,
  mutateRecordFields,
  notes,
  sets,
  _id,
  exercise,
  displayFields,
  date,
  supersetGroup,
}: Props) {
  const actionButtons = [
    <RecordNotesButton
      key="record notes"
      sides={sets.map((set) => set.side)}
      {...{ notes, mutateRecordFields, date }}
    />,
    <ExerciseNotesButton
      key="exercise notes"
      disabled={!exercise}
      notes={exercise?.notes}
      modifiers={exercise?.modifiers}
      mutateExerciseFields={mutateExerciseFields}
    />,
    <SupersetButton
      key="superset"
      disabled={!exercise}
      {...{ supersetGroup, mutateRecordFields, date }}
    />,
    <ChangeUnitsButton
      key="units"
      {...{ mutateExerciseFields, displayFields }}
    />,
    <ManageExerciseButton key="manage" name={exercise?.name} />,
    <SwapRecordButton key="left" direction="left" index={swiperIndex} />,
    <SwapRecordButton key="right" direction="right" index={swiperIndex} />,
    <DeleteRecordButton key="delete" _id={_id} />,
  ]

  const { ref, visibleActions } = useMaxVisibleActions(actionButtons.length)

  return (
    <CardHeader
      ref={ref}
      title={`Record ${swiperIndex + 1}`}
      titleTypographyProps={{ variant: 'h6' }}
      action={
        <Box sx={{ cursor: 'default', width: '100%' }}>
          {actionButtons.slice(0, visibleActions)}
          <MoreActionsButton actions={actionButtons.slice(visibleActions)} />
        </Box>
      }
    />
  )
}
