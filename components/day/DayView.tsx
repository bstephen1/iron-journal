import { Box, Button, Stack } from '@mui/material';
import { useState } from 'react';
import Exercise from '../../models/Exercise';
import DayViewTitleBar from './DayViewTitleBar';
import ExerciseInput from './ExerciseInput';

interface Props {
    date: Date,
    exercises: Exercise[],
}
export default function DayView(props: Props) {
    const { date } = props
    const [exercises, setExercises] = useState<(Exercise | undefined)[]>(props.exercises)

    const handleAddExercise = () => {
        setExercises(exercises.concat(undefined))
    }

    //todo: timer underneath title
    //todo: compare with last of this day type
    return (
        // todo: change to grid so exercise button can be smaller
        <Stack spacing={2}>
            <DayViewTitleBar />
            {exercises.map((exercise, i) => <ExerciseInput exercise={exercise} startOpen={i === 0} />)}
            <Button variant='contained' onClick={handleAddExercise}>Add Exercise</Button>
        </Stack>
    )
}