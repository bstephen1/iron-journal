import { Notes } from '@mui/icons-material'
import { Badge, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { ComponentProps, useState } from 'react'
import { NamedObject } from '../../models/NamedObject'
import Note from '../../models/Note'
import NotesList from '../form-fields/NotesList'
import RecordHeaderButton from './RecordHeaderButton'

export interface Props
  extends Partial<ComponentProps<typeof RecordHeaderButton>> {
  notes: Note[]
  setsAmount: number
  handleSubmit: (notes: Note[]) => void
}
export default function RecordNotesDialogButton({
  notes,
  setsAmount,
  handleSubmit,
  ...recordHeaderButtonProps
}: Props) {
  const [open, setOpen] = useState(false)

  // Session tagged notes should propagate to all records in the session? Would need an id for notes
  const record = new NamedObject('Record')
  const options = [new NamedObject('Session'), record]

  // the rare full for loop
  for (let i = 1; i <= setsAmount; i++) {
    options.push(new NamedObject(`Set ${i}`))
  }

  return (
    <>
      <RecordHeaderButton
        title="Record Notes"
        onClick={() => setOpen(true)}
        {...recordHeaderButtonProps}
      >
        <Badge badgeContent={notes.length} color="primary">
          <Notes />
        </Badge>
      </RecordHeaderButton>
      <Dialog open={open} fullWidth onClose={() => setOpen(false)}>
        <DialogTitle>Notes</DialogTitle>
        <DialogContent>
          <NotesList
            initialTags={[record]}
            {...{ options, handleSubmit, notes }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
