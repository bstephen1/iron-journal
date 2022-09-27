import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Autocomplete, Box, Button, Collapse, ListItemButton, Paper, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { useRef, useState } from 'react';
import { dummyExercises, dummySetTypes } from '../../dummyData';
import Exercise from '../../models/Exercise';
import { AbstractSet } from '../../models/sets/AbstractSet';
import StraightSet from '../../models/sets/StraightSet';
import { SetType } from '../../models/SetType';
import StraightSetInput from './sets/StraightSetInput';

interface Props {
    exercise?: Exercise,
    type?: SetType,
    startOpen?: boolean,
}
export default function ExerciseInput(props: Props) {
    const [open, setOpen] = useState(props.startOpen)
    const [exercise, setExercise] = useState(props.exercise)
    const [type, setType] = useState(props.type)
    const [sets, setSets] = useState<AbstractSet[]>([])
    const listItemButton = useRef(null)

    const disableButtonEffects = (e: React.MouseEvent<HTMLElement, MouseEvent>) => e.stopPropagation()
    const handleAddSet = () => {
        const last = sets[sets.length - 1]
        //todo: init first set, and possibly have different behavior when adding different types of sets?
        setSets(sets.concat({ ...last, rpe: undefined }))
    }

    function getSetInputComponent(set: AbstractSet) {
        if (!type) return <></>

        switch (type) {
            case SetType.STRAIGHT:
                return <StraightSetInput {...set as StraightSet} />
            default:
                return <></>
        }
    }

    //todo: don't show toggle or any sets until a set type is selected (or default to straight?)
    //todo (?): maybe just the expand icon is a button instead of the whole thing? Not sure what's more natural
    //todo: select input units (if you display in kg units, you can input in lbs and it will convert)
    //todo: preserve state when changing set type?
    return (
        <ListItemButton ref={listItemButton} onClick={() => setOpen(!open)} sx={{ p: 0, borderRadius: 1 }} id='clickableArea'>
            <Paper elevation={3} sx={{ px: 1, width: 1 }}>
                <Box p={2} display='flex' justifyContent='space-between' >
                    {/* todo: change to grid; put modifiers on a second row for small screens */}
                    <Stack direction='row' onMouseDown={disableButtonEffects} onClick={disableButtonEffects} spacing={2}>
                        <Autocomplete
                            options={dummyExercises.filter(exercise => exercise.isActive)}
                            getOptionLabel={option => option.name}
                            sx={{ width: 250 }}
                            //value/onChange update when a valid value is selected from the Autocomplete, not whenever a key is inputted
                            value={exercise}
                            //specify undefined so it doesn't set to null when blank
                            onChange={(e, value) => setExercise(value || undefined)}
                            renderInput={(params) => <TextField {...params} variant='standard' label='Exercise' />}
                        />
                        <Autocomplete
                            options={dummySetTypes}
                            getOptionLabel={option => option}
                            sx={{ width: 250 }}
                            value={type}
                            onChange={(e, value) => setType(value || undefined)}
                            renderInput={(params) => <TextField {...params} variant='standard' label='Set Type' />}
                        />
                        <Autocomplete
                            options={exercise?.modifiers || []}
                            getOptionLabel={option => option.name}
                            multiple
                            fullWidth
                            renderInput={(params) => <TextField {...params} variant='standard' label='Modifiers' />}
                        />
                    </Stack>
                    {!!type && (open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />)}
                </Box>
                {/* onMouseDown disables mui Button ripple; onClick disables activating the button */}
                {!!type && <Collapse in={open} onMouseDown={disableButtonEffects} onClick={disableButtonEffects} sx={{ mx: 5, pb: 2, cursor: 'default' }}>
                    <Stack spacing={1}>
                        {/* todo: unique key */}
                        {sets.map(set => getSetInputComponent(set))}
                        <Button variant='contained' onClick={handleAddSet}>Add Set</Button>
                    </Stack>
                </Collapse>}
            </Paper>
        </ListItemButton>
    )
}