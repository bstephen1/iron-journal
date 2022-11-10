import { Autocomplete, createFilterOptions } from '@mui/material'
import { useMemo } from 'react'
import { KeyedMutator } from 'swr'
import { GenericAutocompleteProps } from '../../../lib/util'
import Category from '../../../models/Category'
import { NamedObject, NamedStub } from '../../../models/NamedObject'

interface SelectorBaseProps<C, S> extends GenericAutocompleteProps<C | S> {
  handleChange: (value: C | null) => void
  categoryFilter: Category | null
  mutate: KeyedMutator<C[]>
  StubConstructor: new (name: string) => S
  Constructor: new (name: string) => C
  addNewItem: (value: C) => void
  // have to explicitly declare options is T[] or Autocomplete will think it's (T | S)[].
  // options is the db res, so will not include the keyless Stub value
  options: C[]
}
// this component is intended to be ingested as the base layer of a HOC.
export default function SelectorBase<C extends NamedObject>({
  // value,
  handleChange,
  options, // todo: these should be part of autocompleteProps
  categoryFilter,
  mutate,
  StubConstructor,
  Constructor,
  addNewItem,
  ...autocompleteProps
}: SelectorBaseProps<C, NamedStub>) {
  // This allows the autocomplete to filter options as the user types, in real time.
  // It needs to be the result of this function call, and we can't call it
  // outside the component while keeping the generic. So, useMemo to cache the result
  const filter = useMemo(() => createFilterOptions<C | NamedStub>(), [])

  return (
    <Autocomplete<C | NamedStub>
      openOnFocus
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      autoHighlight // todo: this sometimes pops up over Category selector for Exercises
      options={options}
      // value={value} // todo: this is just undefined currently. Probably will hash out when typing
      isOptionEqualToValue={(a, b) => a.name === b.name}
      getOptionLabel={(option) => option.name}
      onChange={(_, option) => {
        // add the new item if selected
        if (option && !('_id' in option)) {
          const newItem = new Constructor(option.name)
          mutate(options?.concat(newItem))
          addNewItem(newItem)
          handleChange(newItem)
        } else {
          handleChange(option)
        }
      }}
      // was going to pull this out to a separate function but the param type definitions are long and annoying
      filterOptions={(options, params) => {
        const { inputValue } = params
        let filtered = filter(options, params)

        // todo: this is really specific to Exercise, but needs inputValue
        if (categoryFilter) {
          filtered = filtered.filter((option) => {
            return (
              // todo: null out category if selecting something that's not in the category?
              // todo: on clicking category chip in form, setCategory to that value?
              option.name === inputValue || // if you filter out an exercise you can still type it in manually
              option.categories.some(
                (category) => category === categoryFilter.name
              )
            )
          })
        }

        // append an option to add the current input
        const isExisting = options.some((option) => inputValue === option.name)
        if (inputValue && !isExisting) {
          filtered.push(new StubConstructor(inputValue))
        }

        return filtered
      }}
      {...autocompleteProps}
    />
  )
}
