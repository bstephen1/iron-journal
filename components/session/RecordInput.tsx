import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  TextField,
} from '@mui/material'
import { Stack } from '@mui/system'
import Grid from '@mui/system/Unstable_Grid'
import { useRef, useState } from 'react'
import { useActiveExercises } from '../../lib/frontend/restService'
import Record from '../../models/Record'
import { SetType } from '../../models/SetType'
import SetInput from './SetInput'

interface Props {
  record: Record
  index: number
  updateRecord: (newRecord: Record, index: number) => void
  startOpen?: boolean
}
export default function RecordInput(props: Props) {
  const [open, setOpen] = useState(props.startOpen)
  const { activeExercises } = useActiveExercises() // SWR caches this, so it won't need to call the API every render
  const { record, updateRecord, index } = props
  const { exercise, type, activeModifiers, modifiers, sets } = record
  const listItemButton = useRef(null)

  const disableButtonEffects = (e: React.MouseEvent<HTMLElement, MouseEvent>) =>
    e.stopPropagation()

  const addSet = () => {
    const last = sets[sets.length - 1]
    // todo: init first set, and possibly have different behavior when adding different types of sets?
    updateRecord(
      { ...record, sets: sets.concat({ ...last, rpe: undefined }) },
      index
    )
  }

  if (!activeExercises) {
    return <></>
  }

  // todo: don't show toggle or any sets until a set type is selected (or default to basic set?)
  // todo (?): maybe just the expand icon is a button instead of the whole thing? Not sure what's more natural
  // todo: select input units (if you display in kg units, you can input in lbs and it will convert)
  // todo: preserve state when changing set type?
  // todo: use carousel? https://github.com/Learus/react-material-ui-carousel
  return (
    <Card>
      {/* disable ListItemButton effects: onMouseDown disables ripple; onClick disables activating the button */}
      <CardContent>
        <Grid
          container
          onMouseDown={disableButtonEffects}
          onClick={disableButtonEffects}
          spacing={2}
          sx={{ pt: 2, cursor: 'default' }}
        >
          <Grid xs={6} md={3}>
            <Autocomplete
              options={activeExercises}
              getOptionLabel={(option) => option.name}
              value={activeExercises.find((ex) => ex.name === exercise)}
              // specify undefined so it doesn't set to null when blank
              onChange={(e, newExercise) =>
                updateRecord(
                  { ...record, exercise: newExercise?.name || undefined },
                  index
                )
              }
              renderInput={(params) => (
                <TextField {...params} variant="standard" label="Exercise" />
              )}
            />
          </Grid>
          <Grid xs={6} md={3}>
            <Autocomplete
              options={Object.values(SetType)}
              getOptionLabel={(option) => option}
              value={type}
              onChange={(e, newType) =>
                updateRecord({ ...record, type: newType || undefined }, index)
              }
              renderInput={(params) => (
                <TextField {...params} variant="standard" label="Set Type" />
              )}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Autocomplete
              options={modifiers}
              value={activeModifiers}
              onChange={(e, newActiveModifiers) =>
                updateRecord(
                  { ...record, activeModifiers: newActiveModifiers },
                  index
                )
              }
              multiple
              fullWidth
              renderInput={(params) => (
                <TextField {...params} variant="standard" label="Modifiers" />
              )}
            />
          </Grid>
        </Grid>

        <Stack spacing={2} sx={{ px: 4, pt: 2 }}>
          {/* todo: unique key */}
          {sets.map((set, i) => (
            <SetInput {...set} key={i} />
          ))}
          <Button onClick={addSet}>Add Set</Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
