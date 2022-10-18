import { Button, Stack } from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';
import { useContext } from 'react';
import Exercise from '../../models/Exercise';
import CuesList from './CuesList';
import ModifiersInput from './ModifiersInput';
import NameInput from './NameInput';
import NotesInput from './NotesInput';
import StatusInput from './StatusInput';
import { ExerciseFormContext } from './useExerciseForm';

interface Props {
    exercise: Exercise | null,
}
export default function ExerciseForm({ exercise }: Props) {
    const { dirtyExercise, formValidity, resetExercise } = useContext(ExerciseFormContext)


    return (
        <Grid container spacing={2}>
            <Grid xs={12} sm={6}>
                <Stack>
                    <NameInput />
                    <StatusInput />
                    <ModifiersInput />
                </Stack>
            </Grid>
            <Grid xs={12} sm={6}>
                <CuesList />
            </Grid>
            <Grid xs={12}>
                <NotesInput />
            </Grid>
            <Grid xs={12}>
                <Button onClick={resetExercise} disabled={!exercise}>Reset</Button>
                {/* todo: disable when no changes */}
                <Button variant='contained' disabled={!exercise} onClick={undefined}>Save Changes</Button>
            </Grid>
        </Grid>
    )
}