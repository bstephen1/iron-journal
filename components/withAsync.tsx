// @ts-nocheck
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  CircularProgress,
  TextField,
} from '@mui/material'
import { ComponentProps, useState } from 'react'

/*
 * HOC to add async loading state to an Autocomplete.
 *
 * This takes in a non-async react component which returns an Autocomplete,
 * uses an inner function to take in the props of the original react component,
 * then renders the original component with additional props and logic that handle the loading state.
 *
 * The component this function takes in must extend Autocomplete so it can accept the added props.
 *
 */
// todo: typing this is such a pain. Outer function should be the component, inner should be its props. Component extends Autocomplete.
export function withAsync<T extends typeof Autocomplete>(Component: T) {
  return function (props: ComponentProps<T>) {
    const [open, setOpen] = useState(false)
    const loading = open && !props.options

    return (
      <Component
        {...props}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        loading={loading}
        loadingText="Loading..."
        renderInput={(params: AutocompleteRenderInputParams) => (
          <TextField
            {...params}
            label={props.label}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  {props.category}
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={20} />}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
    )
  }
}
