import { Autocomplete, Stack, TextField } from '@mui/material'
import { useEffect, useState } from 'react'

export default function MyAutocomplete() {
  const [value, setValue] = useState('hello world')

  useEffect(() => {
    console.log(value)
  }, [value])
  return (
    <Stack spacing={2}>
      {/* autocomplete's initial render has value of null and flashes the placeholder */}

      <Autocomplete
        renderInput={(params) => {
          console.log(params)
          return (
            <TextField
              {...params}
              label="label"
              placeholder="shouldn't see this"
              InputLabelProps={{ shrink: true }}
              // value={value}
            />
          )
        }}
        // doesn't matter if using value or defaultValue
        value={value}
        options={[]}
      />

      {/* text field does not flash the placeholder */}
      <TextField
        label="label"
        placeholder="shouldn't see this"
        // InputLabelProps={{ shrink: true }}
        value={value}
      />
    </Stack>
  )
}
