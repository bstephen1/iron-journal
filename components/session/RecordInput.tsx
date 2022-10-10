import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Autocomplete, Box, Button, Collapse, Grid, ListItemButton, Paper, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { useEffect, useRef, useState } from 'react';
import { useActiveExercises } from '../../lib/frontend/restService';
import { Record } from '../../models/Record';
import { SetType } from '../../models/SetType';
import SetInput from './SetInput';

interface Props {
    record: Record,
    index: number,
    updateRecord: Function,
    startOpen?: boolean,
}
export default function RecordInput(props: Props) {
    const [open, setOpen] = useState(props.startOpen)
    const { activeExercises } = useActiveExercises()
    const [record, setRecord] = useState(props.record)
    const { exerciseRef, type, activeModifiers, sets } = record

    const exercise = activeExercises?.find(exercise => exercise.id === exerciseRef)
    const listItemButton = useRef(null)

    const disableButtonEffects = (e: React.MouseEvent<HTMLElement, MouseEvent>) => e.stopPropagation()
    const handleAddSet = () => {
        const last = sets[sets.length - 1]
        //todo: init first set, and possibly have different behavior when adding different types of sets?
        setRecord({ ...record, sets: sets.concat({ ...last, rpe: undefined }) })
    }

    useEffect(() => {
        props.updateRecord(record, props.index)
    }, [record])

    if (!activeExercises) {
        return <></>
    }

    //todo: don't show toggle or any sets until a set type is selected (or default to basic set?)
    //todo (?): maybe just the expand icon is a button instead of the whole thing? Not sure what's more natural
    //todo: select input units (if you display in kg units, you can input in lbs and it will convert)
    //todo: preserve state when changing set type?
    return (
        <ListItemButton ref={listItemButton} onClick={() => setOpen(!open)} sx={{ p: 0, borderRadius: 1 }} id='clickableArea'>
            <Paper elevation={3} sx={{ px: 1, width: 1 }}>
                <Box p={2} display='flex' justifyContent='space-between' >
                    {/* todo: change to grid; put modifiers on a second row for small screens */}
                    {/* disable ListItemButton effects: onMouseDown disables ripple; onClick disables activating the button */}
                    <Grid container onMouseDown={disableButtonEffects} onClick={disableButtonEffects} spacing={2} sx={{ cursor: 'default' }}>
                        <Grid item xs={6} md={3}>
                            <Autocomplete
                                options={activeExercises}
                                getOptionLabel={option => option.name}
                                //value/onChange update when a valid value is selected from the Autocomplete, not whenever a key is inputted
                                // value={activeExercises.find(e => e.id === exercise?.id)}
                                value={exercise}
                                //specify undefined so it doesn't set to null when blank
                                onChange={(e, exercise) => setRecord({ ...record, exerciseRef: exercise?.id || undefined })}
                                renderInput={(params) => <TextField {...params} variant='standard' label='Exercise' />}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Autocomplete
                                options={Object.values(SetType)}
                                getOptionLabel={option => option}
                                value={type}
                                onChange={(e, value) => setRecord({ ...record, type: value || undefined })}
                                renderInput={(params) => <TextField {...params} variant='standard' label='Set Type' />}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                options={exercise?.validModifiers}
                                getOptionLabel={option => option.name}
                                value={activeModifiers}
                                onChange={(e, value) => setRecord({ ...record, activeModifierRefs: value.map(modifier => modifier.id) })}
                                multiple
                                fullWidth
                                renderInput={(params) => <TextField {...params} variant='standard' label='Modifiers' />}
                            />
                        </Grid>
                    </Grid>
                    <Box pl={2} display='flex' alignItems='center' width={24}>
                        {!!type && (open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />)}
                    </Box>
                </Box>
                {!!type && <Collapse in={open} onMouseDown={disableButtonEffects} onClick={disableButtonEffects} sx={{ mx: 5, pb: 2, cursor: 'default' }}>
                    <Stack spacing={2}>
                        {/* todo: unique key */}
                        {sets.map((set, i) => <SetInput {...set} key={i} />)}
                        <Button variant='contained' onClick={handleAddSet}>Add Set</Button>
                    </Stack>
                </Collapse>}
            </Paper>
        </ListItemButton>
    )
}