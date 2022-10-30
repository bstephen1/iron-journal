import { Stack } from '@mui/material'
import Grid from '@mui/system/Unstable_Grid'
import { SubmitHandler } from 'react-hook-form'
import * as yup from 'yup'
import { useModifiers } from '../../lib/frontend/restService'
import Exercise from '../../models/Exercise'
import { ExerciseStatus } from '../../models/ExerciseStatus'
import AsyncComboBoxField from '../form-fields/AsyncComboBoxField'
import InputFieldAutosave from '../form-fields/InputFieldAutosave'
import InputListField from '../form-fields/InputListField'
import SelectFieldAutosave from '../form-fields/SelectFieldAutosave'

interface Props {
  exercise: Exercise | null
  handleSubmit: (exercise: Exercise) => void
}
export default function ExerciseForm({ exercise, handleSubmit }: Props) {
  const { modifiers } = useModifiers()
  const modifierNames = modifiers?.map((modifier) => modifier.name) || []

  // todo: validate (drop empty cues)

  // yup.addMethod(yup.array, 'unique', function (message, mapper = a => a) {
  //   return this.test('unique', message, function (list) {
  //     return list.length === new Set(list.map(mapper)).size;
  //   });
  // });

  // todo: disable form when exercise is null

  // todo: define react form type ?

  // todo: status isn't populating

  // todo: can we enumerate the Exercise fields instead of hardcoding?
  const validationSchema = yup.object({
    name: yup.string().required('Must have a name'), // todo: validate uniqueness
    status: yup.string().required('Must have a status'),
    notes: yup.string(),
    validModifiers: yup.array(),
    cues: yup.array(),
  })

  const handleUpdate = <T extends keyof Exercise>(
    field: T,
    value: Exercise[T]
  ) => {
    if (!exercise) return
    console.log(field)
    console.log(value)
    // const newExercise = { ...exercise, [field]: value }
    // updateExerciseField(exercise, field, value)
    // mutate(newExercise)
  }

  return (
    <Grid container spacing={2} xs={12}>
      <Grid xs={12} sm={6}>
        <Stack>
          <InputFieldAutosave
            label="Name"
            defaultValue={exercise?.name}
            onSubmit={(value) => handleUpdate('name', value)}
            validator={yup.reach(validationSchema, 'name')}
            required
          />
          <SelectFieldAutosave
            label="Status"
            options={Object.values(ExerciseStatus)}
            initialValue={exercise?.status}
            handleSubmit={(value) =>
              handleUpdate('status', value as ExerciseStatus)
            }
          />
          <AsyncComboBoxField
            label="Valid Modifiers"
            initialValue={exercise?.validModifiers}
            options={modifierNames}
            onSubmit={(value) => handleUpdate('validModifiers', value)}
          />
        </Stack>
      </Grid>
      <Grid xs={12} sm={6}>
        <InputFieldAutosave
          label="Notes"
          defaultValue={exercise?.notes}
          fullWidth
          onSubmit={(value) => handleUpdate('notes', value)}
          validator={yup.reach(validationSchema, 'notes')}
        />
      </Grid>
      <Grid xs={12}>
        {/* <InputListField
          label="Cues"
          addItemPlaceholder="Add Cue"
          listItemPlaceholder="Empty Cue (will be deleted)"
          values={exercise?.cues}
          handleSubmit={(value) => handleUpdate('cues', value)}
        /> */}
      </Grid>
    </Grid>
  )
}
