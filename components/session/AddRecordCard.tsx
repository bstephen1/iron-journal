import { Button, Paper, Stack } from '@mui/material'
import ExerciseSelector from 'components/form-fields/selectors/ExerciseSelector'
import { useExercises } from 'lib/frontend/restService'
import Exercise from 'models/Exercise'
import { Status } from 'models/Status'
import { useState } from 'react'

interface Props {
  handleAdd: (exercise: Exercise) => void
}
export default function AddRecordCard(props: Props) {
  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [category, setCategory] = useState<string | null>(null)
  const { exercises, mutate: mutateExercises } = useExercises({
    status: Status.active,
  })

  const handleAdd = () => {
    if (!exercise) return

    props.handleAdd(exercise)

    // swiper.update()
    setExercise(null)
  }

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Stack spacing={2} alignItems="center">
        <ExerciseSelector
          variant="standard"
          {...{
            exercise,
            exercises,
            handleChange: (newExercise) => setExercise(newExercise),
            mutate: mutateExercises,
            category,
            handleCategoryChange: setCategory,
          }}
        />
        <Button
          variant="contained"
          sx={{ width: 250 }}
          onClick={handleAdd}
          disabled={!exercise}
        >
          Add Record
        </Button>
      </Stack>
    </Paper>
  )
}
