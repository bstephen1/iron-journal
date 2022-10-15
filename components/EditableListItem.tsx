import DeleteIcon from '@mui/icons-material/Delete';
import { Box, Chip, Input, InputAdornment, Typography } from '@mui/material';
import { useEffect, useState } from 'react';



interface Props {
    index: number,
    value: string,
    editToggle?: boolean,
    handleDelete: (key: any) => void,
}
export default function EditableListItem(props: Props) {
    const { index, editToggle, handleDelete } = props
    const [edit, setEdit] = useState(editToggle || props.value === '')
    const [value, setValue] = useState(props.value)

    useEffect(() => {
        setEdit(editToggle)
    }, [editToggle])

    //props.value will change when deleting an element or switching exercise,
    //but the EditableListItems will not rerender because they still exist in the new screen.
    //So we have to let them know to update value's state with the new props
    useEffect(() => {
        setValue(props.value)
    }, [props.value])

    //todo: cursor position at end of input on mount, or where mouse is clicking
    //todo: input is shrinking width compared with text only
    return (
        <Box key={index}>
            {edit
                ?
                <>
                    {/* <Box width={24} /> */}
                    <Input
                        autoFocus={!editToggle || props.value === ''}
                        // disableUnderline
                        // onFocus={(e) => e.target.select()} //select all text on init
                        value={value}
                        multiline
                        fullWidth
                        onChange={(e) => setValue(e.target.value)}
                        // onBlur={() => !editToggle && setEdit(false)}
                        sx={{ p: 0 }}
                        onKeyDown={e => e.key === 'Enter' && e.preventDefault()} //allow multiline but without arbitrary new lines
                        endAdornment={
                            <InputAdornment position='end'>
                                <DeleteIcon onClick={() => handleDelete(index)} sx={{ cursor: 'pointer' }} />
                            </InputAdornment>}
                    />
                </>
                //eh, I think this is stretching the purpose of what Chips are for. Doesn't look too great with so much text
                : <Chip sx={{ height: '100%' }} label={<Typography sx={{ whiteSpace: 'normal' }}>{value}</Typography>} onClick={() => setEdit(true)} />

            }
        </Box >
    )
}