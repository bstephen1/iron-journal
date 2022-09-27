import { Button, Grid } from '@mui/material';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import Exercise from '../../models/Exercise';
import ExerciseInput from './ExerciseInput';
import ExerciseInputAccordion from './ExerciseInputAccordion';
import LogEntryClock from './LogEntryClock';
import LogEntryTitleBar from './LogEntryTitleBar';

interface Props {
    date: Dayjs,
}
export default function LogEntry(props: Props) {
    const { date } = props
    //todo: this should be controlled, but is uncontrolled when init'd as undefined
    const [exercises, setExercises] = useState<(Exercise | undefined)[]>([undefined])

    const handleAddExercise = () => {
        setExercises(exercises.concat(undefined))
    }

    //todo: fetch exercises for the given date

    //todo: timer underneath title
    //todo: compare with last of this day type
    return (
        // todo: change to grid so exercise button can be smaller
        <Grid container spacing={2} direction='column'>
            <Grid item>
                <LogEntryTitleBar date={date} />
            </Grid>
            <Grid item>
                <LogEntryClock />
            </Grid>
            {/* todo: use a unique key so they can be rearranged */}
            {exercises.map((exercise, i) => {
                return (
                    <Grid item>
                        <ExerciseInputAccordion exercise={exercise} startOpen={i === 0} key={i} />
                    </Grid>
                )
            })}

            <Grid item container justifyContent='center'>
                <Button variant='contained' onClick={handleAddExercise}>Add Exercise</Button>
            </Grid>
        </Grid>
    )
}