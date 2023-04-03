import { Autocomplete, CircularProgress, Stack, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

export default function MyAutocomplete() {
  const [value, setValue] = useState('hello world')

  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    setIsFirstRender(false)
  }, [])
  return (
    // the stack spacing causes a bit of jumping for the first option, but there's no jumping if it's omitted
    <Stack spacing={2}>
      {/* autocomplete's initial render has value of null and flashes the placeholder */}

      {/* This might work: swap out a textField for the first render.  */}
      {/*  Note though I'm not sure it's JUST the first render in prod. It lags up to several seconds sometimes.
      According to the react devtools panel, Autocomplete's value is never actually null. I guess it takes time
      to pass to the textfield. */}
      {/* it seems to make the elements jump around a bit tho... */}
      <Autocomplete
        renderInput={(params) => (
          <TextField
            {...params}
            label="label"
            placeholder="shouldn't see this"
            InputLabelProps={{ shrink: true }}
            // value={value}
          />
        )}
        // doesn't matter if using value or defaultValue
        value={value}
        options={[value]}
        sx={{ display: isFirstRender ? 'none' : 'block' }}
      />

      {/* text field does not flash the placeholder */}
      <TextField
        label="label"
        placeholder="shouldn't see this"
        InputLabelProps={{ shrink: true }}
        value={value}
        fullWidth
        InputProps={{
          // maybe remove this
          endAdornment: <CircularProgress color="inherit" size={20} />,
        }}
        sx={{ display: isFirstRender ? 'block' : 'none' }}
      />

      {/* ********************* */}
      <TextField
        label="label"
        placeholder="shouldn't see this"
        // InputLabelProps={{ shrink: true }}
        value={value}
        fullWidth
        InputProps={{
          endAdornment: <CircularProgress color="inherit" size={20} />,
        }}
      />

      <Autocomplete
        renderInput={(params) => (
          <TextField
            {...params}
            label="label"
            // this gets rid of the placeholder but the autocomplete just flashes a blank input instead
            placeholder={value ? '' : "shouldn't see this"}
            InputLabelProps={{ shrink: true }}
          />
        )}
        value={value}
        options={[value]}
      />

      {/* ********************* */}

      <Autocomplete
        renderInput={(params) => (
          <TextField
            {...params}
            label="label"
            placeholder="shouldn't see this"
            // disabling this makes it even worse!
            // InputLabelProps={{ shrink: true }}
            value={value}
          />
        )}
        // multiple
        value={value}
        options={[value]}
      />

      {/* discovery: ComboBoxField does not render null on the first render. 
      It also uses autocomplete, but uses the field hook.  */}
      {/* Oh, I see. It's because the input field is actually empty since it's multiple.
       The multiple are rendered as chips as a start adornment. */}
    </Stack>
  )
}
