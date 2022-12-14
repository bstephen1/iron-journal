import CheckIcon from '@mui/icons-material/Check'
import ClearIcon from '@mui/icons-material/Clear'
import { OutlinedInput } from '@mui/material'
import { useRef, useState } from 'react'
import { NamedObject } from '../../../models/NamedObject'
import Note from '../../../models/Note'
import TransitionIconButton from '../../TransitionIconButton'
import useField from '../useField'
import TagSelect from './TagSelect'

interface Props {
  placeholder?: string
  handleAdd: (value: Note) => void
  disabled: boolean
  options: NamedObject[]
  multiple?: boolean
  initialTags?: NamedObject[]
}
// This Input is a temporary value that isn't include in the list until/unless it is submitted.
export default function AddNote({
  placeholder,
  handleAdd,
  disabled,
  options,
  multiple,
  initialTags = [],
}: Props) {
  const inputRef = useRef<HTMLInputElement>()
  const [tags, setTags] = useState<Note['tags']>(initialTags)
  const handleSubmit = (value: string) => {
    handleAdd(new Note(value, tags))
    onReset()
  }
  const onReset = () => {
    reset('')
    // if it's single we can just leave the tag as is
    if (multiple) setTags(initialTags)
    inputRef.current?.focus()
  }

  const { control, isEmpty, reset, submit } = useField({
    handleSubmit,
    initialValue: '',
    autoSubmit: false,
  })

  return (
    <OutlinedInput
      {...control()}
      placeholder={placeholder}
      disabled={disabled}
      onKeyDown={(e) => e.code === 'Enter' && submit()}
      inputRef={inputRef}
      startAdornment={
        <TagSelect handleUpdate={setTags} {...{ tags, options, multiple }} />
      }
      endAdornment={
        <>
          <TransitionIconButton
            isVisible={!isEmpty}
            onClick={submit}
            aria-label="add note"
          >
            <CheckIcon />
          </TransitionIconButton>
          <TransitionIconButton
            isVisible={!isEmpty || !!tags.length}
            onClick={onReset}
            aria-label="clear input"
          >
            <ClearIcon />
          </TransitionIconButton>
        </>
      }
    />
  )
}
