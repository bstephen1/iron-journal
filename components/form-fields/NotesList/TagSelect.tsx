import { CheckBoxOutlineBlank } from '@mui/icons-material'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import {
  Checkbox,
  Input,
  ListItemText,
  MenuItem,
  Select,
  SelectProps,
} from '@mui/material'
import { useState } from 'react'
import { NamedObject } from '../../../models/NamedObject'
import TagChips from './TagChips'

interface Props extends Partial<SelectProps<NamedObject | NamedObject[]>> {
  options: NamedObject[]
  tags: NamedObject[] // single mode uses a singleton array
  multiple?: boolean
  handleUpdate: (tags: NamedObject[]) => void
}
// this should be used as a start adornment in an input to render tags for that input
export default function TagSelect({
  options,
  tags,
  handleUpdate,
  multiple,
  ...selectProps
}: Props) {
  const [open, setOpen] = useState(false)

  // single mode changes values to strings
  const handleChange = (value: NamedObject | NamedObject[] | string) => {
    if (typeof value === 'string') {
      value = options.find((option) => option.name === value) || []
    }
    handleUpdate(Array.isArray(value) ? value : [value])
  }

  return (
    <Select
      open={open}
      multiple={multiple}
      autoWidth
      displayEmpty
      onClose={() => setOpen(false)}
      onOpen={() => options.length && setOpen(true)}
      value={multiple ? tags : tags[0]}
      onChange={(e) => handleChange(e.target.value)}
      input={<Input disableUnderline />}
      inputProps={{ sx: { pr: '0px !important' } }} // disable baked in padding for IconComponent
      IconComponent={() => null}
      renderValue={(selected) => <TagChips {...{ selected, multiple }} />}
      sx={{ pr: 2 }}
      {...selectProps}
    >
      {options.map((option) => {
        return (
          // value "should" be a number, but arbitrary values work fine if MenuItem is a direct child of Select
          // see https://github.com/mui/material-ui/issues/14286
          <MenuItem key={option._id} value={option as any}>
            {multiple && (
              <Checkbox
                icon={<CheckBoxOutlineBlank />}
                checkedIcon={<CheckBoxIcon />}
                style={{ marginRight: 8 }}
                checked={tags.some((x) => x === option)} // todo: add a "selected" boolean map?
              />
            )}
            <ListItemText primary={option.name} />
          </MenuItem>
        )
      })}
    </Select>
  )
}
