import Grid from '@mui/system/Unstable_Grid'
import { useMemo } from 'react'
import * as yup from 'yup'
import {
  useCategories,
  useExercises,
  useModifiers,
} from '../lib/frontend/restService'
import Exercise from '../models/Exercise'
import { ExerciseStatus } from '../models/ExerciseStatus'
import { ComboBoxField } from './form-fields/ComboBoxField'
import InputField from './form-fields/InputField'
import NotesList from './form-fields/NotesList'
import SelectFieldAutosave from './form-fields/SelectFieldAutosave'

interface Props {
  exercise: Exercise
  handleUpdate: (updates: Partial<Exercise>) => void
}
export default function ExerciseForm({ exercise, handleUpdate }: Props) {
  const { modifiers } = useModifiers()
  const { categories } = useCategories()
  const { exercises } = useExercises({})

  // todo: I smell an extractable function...
  // memoize the maps so they don't have to rerun every render
  const modifierNames = useMemo(
    () => modifiers?.map((modifier) => modifier.name) || [],
    [modifiers]
  )

  const exerciseNames = useMemo(
    () => exercises?.map((exercise) => exercise.name) || [],
    [exercises]
  )

  const categoryNames = useMemo(
    () => categories?.map((category) => category.name) || [],
    [categories]
  )

  // todo: validate (drop empty notes)
  console.log('exercise')
  console.log(exercise)

  // This method requires using anonymous functions rather than arrow functions (using "function" keyword)
  // because arrow functions preserve the context of "this", but Yup needs the nested "this" from addMethod.
  yup.addMethod(
    yup.string,
    'unique',
    function (message: string, list: string[]) {
      return this.test('unique', message, function (value) {
        return !!value && list.length !== new Set(list.concat(value)).size
      })
    }
  )

  // todo: can we enumerate the Exercise fields instead of hardcoding?
  const validationSchema = yup.object({
    name: yup
      .string()
      .required('Must have a name')
      // todo: ts isn't recognizing that addMethod() added this. Possible solutions: https://github.com/jquense/yup/issues/312
      // @ts-ignore
      .unique('This exercise already exists!', exerciseNames),
    status: yup.string().required('Must have a status'),
  })

  return (
    <Grid container spacing={1} xs={12}>
      <Grid xs={12} sm={6}>
        {/* todo: would be great to consolidate this somehow. Maybe have a "name" for the inputFields.
            Export the schema and have the hook pull it in?  */}
        <InputField
          label="Name"
          initialValue={exercise.name}
          required
          fullWidth
          handleSubmit={(name) => handleUpdate({ name })}
          yupValidator={yup.reach(validationSchema, 'name')}
        />
      </Grid>
      <Grid xs={12} sm={6}>
        <SelectFieldAutosave
          label="Status"
          options={Object.values(ExerciseStatus)}
          initialValue={exercise.status}
          required
          fullWidth
          yupValidator={yup.reach(validationSchema, 'status')}
          handleSubmit={(status) => handleUpdate({ status })}
        />
      </Grid>
      <Grid xs={12}>
        <ComboBoxField
          label="Categories"
          initialValue={exercise.categories}
          options={categories}
          textFieldProps={{ helperText: ' ' }}
          handleSubmit={(categories) => handleUpdate({ categories })}
        />
      </Grid>
      <Grid xs={12}>
        <ComboBoxField
          label="Modifiers"
          initialValue={exercise.modifiers}
          options={modifiers}
          textFieldProps={{ helperText: ' ' }}
          // @ts-ignore ComboBoxField drops the generic typing
          handleSubmit={(modifiers) => handleUpdate({ modifiers })}
        />
      </Grid>
      <Grid xs={12}>
        <NotesList
          label="Notes"
          notes={exercise.notes}
          // todo: can the tags point to exercise.modifiers instead of storing the whole modifier? Same with activeModifiers?
          // Store an array of the ids and lookup via exercise.modifiers? Then on lookup if not present it can remove itself...
          options={exercise.modifiers}
          handleSubmit={(notes) => handleUpdate({ notes })}
          multiple
        />
      </Grid>
    </Grid>
  )
}
