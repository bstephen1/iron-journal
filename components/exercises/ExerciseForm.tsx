import { CheckBoxOutlineBlank } from '@mui/icons-material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { Autocomplete, Button, Checkbox, Divider, MenuItem, Stack, TextField } from '@mui/material';
import Grid from '@mui/system/Unstable_Grid';
import { useEffect, useState } from 'react';
import CueInput from '../../components/exercises/CueInput';
import { useModifiers } from '../../lib/frontend/restService';
import Exercise from '../../models/Exercise';
import { ExerciseStatus } from '../../models/ExerciseStatus';



interface Props {
    exercise: Exercise,
    handleSubmit: (dirtyExercise: Exercise) => void,
}
export default function ExerciseForm(props: Props) {
    const { exercise, handleSubmit } = props
    const { modifiers } = useModifiers()

    //todo: banish the nulls somehow
    // if (!modifiers || !exercise) return <></>

    const modifierNames = modifiers?.map(modifier => modifier.name) || []
    const INVISIBLE_HELPER_TEXT = ' ' //use this to keep height constant when there's no helper text

    interface DirtyNameValidity {
        isError: boolean,
        reason: string,
    }
    const [dirtyNameValidity, setDirtyNameValidity] = useState<DirtyNameValidity>({ isError: false, reason: INVISIBLE_HELPER_TEXT })
    const [dirtyExercise, setDirtyExercise] = useState<Exercise>(exercise)
    const statuses = Object.values(ExerciseStatus)
    //todo: confirmation when you try to leave page or switch exercise that Name change will be discarded if error
    const isNameError = !!exercise && dirtyNameValidity?.isError

    function handleDirtyNameChange(newName: string) {
        let isError = false
        let reason = INVISIBLE_HELPER_TEXT

        // if (!newName) {
        //     isError = true
        //     reason = `Can't have an empty name!`
        // } else if (exercise?.name === newName) {
        //     //valid -- explicity stated to avoid unnecessary find()
        // } else if (exercises?.find(e => e.name === newName)) {
        //     isError = true
        //     reason = 'This exercise already exists!'
        // }

        setDirtyExercise({ ...dirtyExercise, name: newName })
        setDirtyNameValidity({
            isError: isError,
            reason: reason,
        })
    }

    function handleStatusChange(newStatus: ExerciseStatus) {
        const newExercise = { ...dirtyExercise, status: newStatus }
        setDirtyExercise(newExercise)
    }

    function handleDeleteCue(i: number) {
        const newCues = dirtyExercise.cues.slice(0, i).concat(dirtyExercise.cues.slice(i + 1))
        const newExercise = { ...dirtyExercise, cues: newCues }
        setDirtyExercise(newExercise)
    }

    function handleCueUpdate(newCue: string, i: number) {
        const newCues = dirtyExercise.cues.slice(0, i).concat(newCue).concat(dirtyExercise?.cues.slice(i + 1))
        console.log('updating...')
        console.log(newCues)
        setDirtyExercise({ ...dirtyExercise, cues: newCues })
    }


    // //todo: remove (for testing)
    useEffect(() => {
        console.log(dirtyExercise)
        console.log(dirtyExercise?.cues)
    }, [dirtyExercise])

    return (
        <Grid>
            <Grid container xs={12} md={9} spacing={2}>
                <Grid xs={6}>
                    <Stack spacing={2}>
                        {/* todo: save after X ms of no typing, or on blur */}
                        <TextField
                            required
                            label='Name'
                            error={isNameError}
                            disabled={!exercise} //todo: is there really not a way to disable the whole form at once?
                            helperText={dirtyNameValidity?.reason || INVISIBLE_HELPER_TEXT}
                            value={dirtyExercise?.name || ''} //this has to be an empty string, not null, or it gets buggy with stale data when unselecting an exercise
                            InputLabelProps={{ shrink: !!dirtyExercise?.name }}
                            onChange={(e) => handleDirtyNameChange(e.target.value)}
                        />
                        <TextField
                            select
                            required
                            label='Status'
                            disabled={!exercise}
                            helperText={INVISIBLE_HELPER_TEXT}
                            value={dirtyExercise?.status || ''}
                            InputLabelProps={{ shrink: !!dirtyExercise?.status }}
                            onChange={(e) => handleStatusChange(e.target.value as ExerciseStatus)}
                        >
                            {statuses.map(status => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                            ))}
                        </TextField>
                        <Autocomplete
                            multiple
                            fullWidth
                            disabled={!exercise}
                            options={modifierNames}
                            value={dirtyExercise?.validModifiers || []}
                            // groupBy={modifier => modifier.status}
                            // onChange={(e, newActiveModifiers) => updateRecord({ ...record, activeModifiers: newActiveModifiers }, index)}
                            disableCloseOnSelect
                            onChange={(e, newModifiers) => setDirtyExercise({ ...dirtyExercise, validModifiers: newModifiers })}
                            renderInput={(params) => <TextField {...params} variant='outlined' label='Valid Modifiers' />}
                            renderOption={(props, modifierName, { selected }) => (
                                <li {...props}>
                                    <Checkbox
                                        icon={<CheckBoxOutlineBlank />}
                                        checkedIcon={<CheckBoxIcon />}
                                        style={{ marginRight: 8 }}
                                        checked={selected}
                                    />
                                    {modifierName}
                                </li>
                            )}
                        />
                    </Stack>
                </Grid>
                <Grid xs={6}>
                    {/* todo: center text? outline? divider style in the middle? */}
                    <Divider textAlign='center'>
                        Cues
                    </Divider>
                    {/* todo: Component for each ListItem. drag n drop? */}
                    <Button
                        disabled={!exercise}
                        onClick={() => setDirtyExercise({ ...dirtyExercise, cues: ['', ...dirtyExercise.cues] })}
                    >
                        Add
                    </Button>
                    <Stack spacing={2}>
                        {dirtyExercise?.cues.map((cue, i) => (
                            <CueInput
                                key={i}
                                index={i}
                                value={cue}
                                handleDelete={handleDeleteCue}
                                handleUpdate={handleCueUpdate}
                            />))}
                    </Stack>

                </Grid>
            </Grid>
            <Grid xs={12}>
                <TextField
                    multiline
                    fullWidth
                    disabled={!exercise}
                    value={dirtyExercise?.notes || ''}
                    onChange={(e) => setDirtyExercise({ ...dirtyExercise, notes: e.target.value })}
                    label='Notes'
                />
            </Grid>
            <Grid xs={12}>
                <Button onClick={() => setDirtyExercise(exercise)} disabled={!exercise}>Reset</Button>
                {/* todo: disable when no changes */}
                <Button variant='contained' disabled={isNameError} onClick={() => handleSubmit(dirtyExercise)}>Save Changes</Button>
            </Grid>
        </Grid>
    )
}