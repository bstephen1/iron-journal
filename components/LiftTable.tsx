import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Paper } from '@mui/material';
import { useState } from 'react';
import StraightSet from './set-types/StraightSet';


interface Props {
    lift: string,
    modifiers?: string[], //band, pause
    type?: string, //straight sets, myo 
}
export default function LiftTable(props: Props) {
    const [expanded, setExpanded] = useState(true)


    return (
        <Accordion expanded={expanded} sx={{ my: 1, px: 1 }}>
            <AccordionSummary onClick={() => setExpanded(!expanded)} expandIcon={<ExpandMoreIcon />}>
                {props.lift}
            </AccordionSummary>
            <AccordionDetails>
                <Box>
                    <StraightSet />
                    <StraightSet />
                </Box>
            </AccordionDetails>
        </Accordion>
    )
}