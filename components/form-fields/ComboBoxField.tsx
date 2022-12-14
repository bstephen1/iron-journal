import { CheckBoxOutlineBlank } from '@mui/icons-material'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import {
  Autocomplete,
  AutocompleteProps,
  Checkbox,
  TextField,
  TextFieldProps,
} from '@mui/material'
import { useEffect } from 'react'
import { NamedObject } from '../../models/NamedObject'
import useField from './useField'
import withAsync from './withAsync'

export const ComboBoxField = withAsync(ComboBoxFieldBase)

interface ComboBoxFieldProps<T extends NamedObject>
  extends Partial<AutocompleteProps<T, true, false, false>> {
  options?: T[]
  initialValue: T[]
  handleSubmit: (value: T[]) => void
  textFieldProps?: Partial<TextFieldProps>
}
// todo: doesn't send to db if clicking X on chips
function ComboBoxFieldBase<T extends NamedObject>({
  options = [],
  initialValue,
  handleSubmit,
  textFieldProps,
  ...autocompleteProps
}: ComboBoxFieldProps<T>) {
  const { control, value, setValue, isDirty } = useField<T[]>({
    handleSubmit,
    initialValue,
  })

  const handleClose = () => {
    isDirty && handleSubmit(value)
  }

  // useEffect(() => {
  //   console.log(options);
  // }, [options]);

  useEffect(() => {
    console.log(value)
  }, [value])

  console.log('hi')
  console.log(initialValue)

  // This needs to be controlled due to complex behavior between the inner input and Chips.
  // May have to modify it if debounceSubmit is desired, but that may not be necessary for this.
  // Seems like the debounce has to be a lot longer. onClose + onBlur may be enough.
  return (
    <Autocomplete
      {...control()}
      // useless renderInput to satisfy ts. Overwritten by autocompleteProps
      renderInput={(params) => <TextField {...params} />}
      onChange={(_, value) => setValue(value)}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(a, b) => a.name === b.name}
      fullWidth
      // size="small"  // todo: use small sizes?
      multiple
      // todo: change color?
      // ChipProps={{ color: 'primary', variant: 'outlined' }}
      onClose={handleClose}
      disabled={initialValue == null}
      options={options ?? []}
      disableCloseOnSelect
      autoHighlight
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={<CheckBoxOutlineBlank />}
            checkedIcon={<CheckBoxIcon />}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {option.name}
        </li>
      )}
      {...autocompleteProps}
    />
  )
}
