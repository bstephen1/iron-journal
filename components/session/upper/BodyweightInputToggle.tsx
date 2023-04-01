import CheckIcon from '@mui/icons-material/Check'
import ScaleOutlinedIcon from '@mui/icons-material/ScaleOutlined'
import {
  Grow,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material'
import { WeighInType } from 'models/Bodyweight'
import { useState } from 'react'

interface Props {
  type: WeighInType
  handleTypeChange: (change: WeighInType) => void
}
export default function BodyweightInputToggle({
  type,
  handleTypeChange,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => setAnchorEl(null)

  const handleChange = (type: WeighInType) => {
    handleClose()
    handleTypeChange(type)
  }

  const open = !!anchorEl
  const id = open ? 'bodyweight-options-popper' : undefined

  return (
    <>
      <Tooltip title="options">
        <IconButton onClick={handleOpen} sx={{ p: '2px' }}>
          <ScaleOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <BodyweightMenuItem
          selected={type === 'official'}
          text="official weigh-ins"
          handleClick={() => handleChange('official')}
          id="official"
        />
        <BodyweightMenuItem
          selected={type === 'unofficial'}
          text="unofficial weigh-ins"
          handleClick={() => handleChange('unofficial')}
          id="unofficial"
        />
      </Menu>
    </>
  )
}

function BodyweightMenuItem({
  selected,
  text,
  handleClick,
  id,
}: {
  selected: boolean
  text: string
  handleClick: () => void
  id: string
}) {
  return (
    <MenuItem onClick={handleClick} selected={selected} data-testid={id}>
      <ListItemIcon>
        <Grow in={selected}>
          <CheckIcon />
        </Grow>
      </ListItemIcon>
      <ListItemText>{text}</ListItemText>
    </MenuItem>
  )
}
