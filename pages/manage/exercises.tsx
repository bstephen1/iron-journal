import { Autocomplete, TextField } from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';
import { useState } from 'react';
import ExerciseForm from '../../components/exercises/ExerciseForm';
import StyledDivider from '../../components/StyledDivider';
import { updateExercise, useExercises } from '../../lib/frontend/restService';
import Exercise from '../../models/Exercise';

//todo: disable form stuff when no changes
//todo: ui element showing "changes saved". Snackbar?
//todo: add/delete exercise. Delete only for unused exercises?
//todo: filter exercise list by status?
export default function ManageExercisesPage() {
    const { exercises, mutate } = useExercises()
    const [exercise, setExercise] = useState<Exercise | null>(null)

    // //todo: let ts know that dirtyExercise can't be null if exercise is populated
    // //todo: validate (drop empty cues)
    function handleSubmit(dirtyExercise: Exercise) {
        console.log(dirtyExercise)
        updateExercise(dirtyExercise)
        setExercise(dirtyExercise)
        mutate(exercises)
    }

    if (!exercises) {
        return <></>
    }

    return (
        <Grid container spacing={2}>
            {/* todo: big screens. Switch to side by side? vertical divider? */}
            <Grid xs={12} md={3}>
                <Autocomplete
                    options={exercises} //todo: should sort. localeCompare? Some kind of hardcoded list (eg, favorites > active > archived)?
                    groupBy={exercise => exercise.status}
                    getOptionLabel={option => option.name}
                    value={exercise}
                    onChange={(e, newExercise) => setExercise(newExercise)}
                    renderInput={(params) => <TextField {...params} label='Exercise' />}
                />
            </Grid>
            <Grid xs={12}>
                <StyledDivider />
            </Grid>
            <Grid>
                {!!exercise && <ExerciseForm exercise={exercise} handleSubmit={handleSubmit} />}
            </Grid>
        </Grid >
    )

}