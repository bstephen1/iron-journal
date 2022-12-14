import ClearIcon from '@mui/icons-material/Clear'
import { OutlinedInput } from '@mui/material'
import { useRef } from 'react'
import { NamedObject } from '../../../models/NamedObject'
import Note from '../../../models/Note'
import TransitionIconButton from '../../TransitionIconButton'
import useField from '../useField'
import TagSelect from './TagSelect'

interface Props {
  note: Note
  index: number
  handleDelete: (index: number) => void
  handleUpdate: (index: number, value: Note) => void
  placeholder?: string
  options: NamedObject[]
  multiple?: boolean
}
export default function NotesListItem(props: Props) {
  const {
    note,
    placeholder = '',
    index,
    handleDelete,
    handleUpdate,
    options,
    multiple,
  } = props

  const inputRef = useRef<HTMLInputElement>()
  const handleSubmit = (value: string) =>
    handleUpdate(index, { ...note, value })
  const { control, isEmpty } = useField({
    handleSubmit,
    initialValue: note.value,
  })

  return (
    <OutlinedInput
      {...control()}
      onBlur={() => isEmpty && handleDelete(index)}
      placeholder={placeholder}
      autoComplete="off"
      onKeyDown={(e) => e.code === 'Enter' && inputRef.current?.blur()}
      inputRef={inputRef}
      inputProps={{
        'aria-label': 'edit',
      }}
      startAdornment={
        <TagSelect
          handleUpdate={(newTags) =>
            handleUpdate(index, { ...note, tags: newTags })
          }
          tags={note.tags}
          {...{ options, multiple }}
        />
      }
      endAdornment={
        <>
          <TransitionIconButton
            isVisible={!isEmpty}
            onClick={() => handleDelete(index)}
            aria-label="delete item"
          >
            {/* todo: should this be a different icon so clear button => clear, not delete? */}
            {/* NotInterestedIcon ? */}
            <ClearIcon />
          </TransitionIconButton>
        </>
      }
    />
  )
}
