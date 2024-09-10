import WorkspacesIcon from '@mui/icons-material/Workspaces'
import LooksOneOutlinedIcon from '@mui/icons-material/LooksOneOutlined'
import LooksTwoOutlinedIcon from '@mui/icons-material/LooksTwoOutlined'
import Looks3OutlinedIcon from '@mui/icons-material/Looks3Outlined'

import Looks3Icon from '@mui/icons-material/Looks3'
import Looks4Icon from '@mui/icons-material/Looks4'
import { Badge, ListItemText, Menu, MenuItem } from '@mui/material'
import { useMemo, useState } from 'react'
import { useSessionLog } from '../../../../lib/frontend/restService'
import { UpdateFields } from '../../../../lib/util'
import Record from '../../../../models/Record'
import TooltipIconButton from '../../../TooltipIconButton'

interface Props extends Pick<Record, 'supersetGroup'> {
  disabled?: boolean
  /** treated as readonly if not provided */
  mutateRecordFields?: UpdateFields<Record>
  date: string
}
export default function SupersetButton({
  supersetGroup,
  mutateRecordFields,
  disabled,
  date,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = !!anchorEl
  const id = open ? 'superset-popper' : undefined
  // todo: prevent fetch when !open
  const { sessionLog } = useSessionLog(date)

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleClick = (value?: number) => {
    mutateRecordFields?.({ supersetGroup: value })
    handleClose()
  }

  const options = [undefined, 1, 2, 3, 4, 5]

  return (
    <>
      <TooltipIconButton
        title="Superset group"
        onClickButton={handleOpen}
        disabled={disabled}
      >
        <Badge badgeContent={supersetGroup} color="primary">
          <WorkspacesIcon />
        </Badge>
      </TooltipIconButton>
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
        <MenuItem disabled>
          <em>Superset group</em>
        </MenuItem>
        {options.map((option) => {
          return (
            <MenuItem
              key={option}
              value={option}
              onClick={() => handleClick(option)}
              selected={option === supersetGroup}
            >
              <ListItemText primary={option ? '' + option : 'None'} />
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
