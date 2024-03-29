import { Delete } from '@mui/icons-material'
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useState } from 'react'

interface Props {
  /** Type of record being deleted. Appears in the dialog title */
  type: string
  /** name of the item being deleted */
  name: string
  handleDelete: () => void
  buttonProps?: ButtonProps
}
export default function DeleteButton({
  type,
  name,
  handleDelete,
  buttonProps,
}: Props) {
  const [open, setOpen] = useState(false)
  const handleClose = () => setOpen(false)

  return (
    <>
      <Button
        color="error"
        onClick={() => setOpen(true)}
        startIcon={<Delete />}
        {...buttonProps}
      >
        Delete
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete {type}?</DialogTitle>
        <DialogContent>
          <b>{name}</b> will be permanently deleted.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
