import ClearIcon from '@mui/icons-material/Clear';
import { IconButton, InputBase, Paper } from '@mui/material';
import { useEffect, useState } from 'react';



interface Props {
    index: number,
    value: string,
    handleDelete: (key: any) => void,
    handleUpdate: (value: string, index: number) => void,
}
export default function CueInput(props: Props) {
    const { index, handleDelete, handleUpdate } = props
    const [value, setValue] = useState(props.value)

    function handleBlur() {
        //no edits. Note this means a fresh, blank cue will not be deleted on blur
        if (value === props.value) {
            return
        }

        //todo: do we want to automatically delete an empty cue here? Or wait til submit?
        if (!value) {
            handleDelete(index)
        } else {
            handleUpdate(value, index)
        }
    }


    //props.value will change when deleting an element or switching exercise,
    //but the EditableListItems will not rerender because they still exist in the new screen.
    //So we have to let them know to update value's state with the new props
    useEffect(() => {
        setValue(props.value)
    }, [props.value])

    //todo: cursor position at end of input on mount, or where mouse is clicking
    //todo: input is shrinking width compared with text only
    return (
        <Paper
            component='form'
            sx={{ p: '2px 4px', display: 'flex', alignItems: 'center' }}
        >
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder='Add cue'
                autoFocus={!value}
                multiline
                value={value}
                onBlur={handleBlur}
                onKeyDown={(e) => e.key === 'Enter' && (document.activeElement as HTMLElement).blur()}
                onChange={(e) => setValue(e.target.value)}
                inputProps={{ 'aria-label': 'Add cue' }}
            />
            <IconButton
                type='button'
                sx={{ p: '10px' }}
                aria-label='delete cue'
                onClick={() => handleDelete(index)}
            >
                <ClearIcon />
            </IconButton>
        </Paper>
    )
}