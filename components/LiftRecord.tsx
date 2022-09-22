import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Autocomplete, Box, Collapse, ListItemButton, Paper, TextField, Button } from '@mui/material';
import { Stack } from '@mui/system';
import { useRef, useState } from 'react';
import StraightSet from './set-types/StraightSet';

interface Props {
    lift?: string,
    modifiers?: string[], //band, pause
    type?: string, //straight sets, myo 
}
export default function LiftRecord(props: Props) {
    const [open, setOpen] = useState(true)
    const [lift, setLift] = useState(props.lift || '')
    const [sets, setSets] = useState([{ weight: 150, reps: 5, rpe: 8 }])
    const listItemButton = useRef(null)

    const disableButtonEffects = (e: React.MouseEvent<HTMLElement, MouseEvent>) => e.stopPropagation()
    const handleAddSet = () => {
        const last = sets[sets.length - 1]
        //@ts-ignore have to define a StraightSet 
        setSets(sets.concat({ ...last, rpe: undefined }))
    }

    return (
        <ListItemButton ref={listItemButton} onClick={() => setOpen(!open)} sx={{ my: 1, p: 0, borderRadius: 1 }} id='clickableArea'>
            <Paper elevation={3} sx={{ px: 1, width: 1 }}>
                <Box p={2} display='flex' justifyContent='space-between' >
                    <Stack direction='row' onMouseDown={disableButtonEffects} onClick={disableButtonEffects} spacing={2}>
                        <TextField
                            value={lift}
                            onChange={(e) => setLift(e.target.value)}
                            label='Movement'
                            variant='standard'
                            sx={{ width: 250 }}
                        />
                        <Autocomplete
                            options={['straight']}
                            sx={{ width: 250 }}
                            renderInput={(params) => <TextField {...params} variant='standard' label='Set Type' />}
                        />
                        <Autocomplete
                            options={['band', 'pause', 'belt']}
                            multiple
                            fullWidth
                            renderInput={(params) => <TextField {...params} variant='standard' label='Modifiers' />}
                        />
                    </Stack>
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </Box>
                {/* onMouseDown disables mui Button ripple; onClick disables activating the button */}
                <Collapse in={open} onMouseDown={disableButtonEffects} onClick={disableButtonEffects} sx={{ mx: 5, pb: 2, cursor: 'default' }}>
                    <Stack spacing={1}>
                        {sets.map(set => <StraightSet {...set} />)}
                        <Button variant='contained' onClick={handleAddSet}>Add Set</Button>
                    </Stack>
                </Collapse>
            </Paper>
        </ListItemButton>
    )
}