import { Grid } from '@mui/material'
import CategoryForm from 'components/CategoryForm'
import { AsyncSelectorOption } from 'components/form-fields/selectors/AsyncSelector'
import CategorySelector from 'components/form-fields/selectors/CategorySelector'
import ExerciseSelector from 'components/form-fields/selectors/ExerciseSelector'
import ModifierSelector from 'components/form-fields/selectors/ModifierSelector'
import ManageWelcomeCard from 'components/ManageWelcomeCard'
import ModifierForm from 'components/ModifierForm'
import StyledDivider from 'components/StyledDivider'
import { updateModifierFields } from 'lib/backend/mongoService'
import {
  URI_CATEGORIES,
  URI_EXERCISES,
  URI_MODIFIERS,
} from 'lib/frontend/constants'
import { updateCategoryFields } from 'lib/frontend/restService'
import { useQueryState } from 'next-usequerystate'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
type TabValue = 'exercises' | 'modifiers' | 'categories'

export default function ManageForm<T extends AsyncSelectorOption>({
  tab,
}: {
  tab: TabValue
}) {
  let url, query: 'modifier' | 'category' | 'exercise'
  let update: (value: T, updates: Partial<T>) => Promise<T>
  let Selector:
    | typeof CategorySelector
    | typeof ExerciseSelector
    | typeof ModifierSelector
  let Form: any
  switch (tab) {
    case 'modifiers': {
      query = 'modifier'
      url = URI_MODIFIERS
      update = updateModifierFields
      Selector = ModifierSelector
      Form = ModifierForm
    }
    case 'categories': {
      query = 'category'
      url = URI_CATEGORIES
      update = updateCategoryFields
      Selector = CategorySelector
      Form = CategoryForm
    }
    case 'exercises':
    default: {
      query = 'exercise'
      url = URI_EXERCISES
      // update =
      Selector = ExerciseSelector
      Form = CategoryForm
    }
  }

  const [selected, setSelected] = useState<T | null>(null)
  const [urlName, setUrlName] = useQueryState(query)
  const { data, mutate } = useSWR<T[]>(url)

  useEffect(() => {
    if (!!selected || !data || !urlName) return

    setSelected(data.find((item) => item.name === urlName) ?? null)
  }, [data, selected, urlName])

  const handleUpdate = async (updates: Partial<T>) => {
    if (!selected) return

    const newSelected = { ...selected, ...updates }
    setSelected(newSelected)
    setUrlName(newSelected.name, { scroll: false, shallow: true })

    await update(selected, updates)
    mutate()
  }

  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <Selector
          {...{
            // by coincidence, query/tab match expected prop names
            [query]: selected,
            [tab]: data,
            handleChange: (newSelected) => {
              setSelected(newSelected)
              setUrlName(newSelected?.name ?? null, {
                scroll: false,
                shallow: true,
              })
            },
            mutate,
          }}
        />
      </Grid>
      <Grid xs={12}>
        <StyledDivider />
      </Grid>
      <Grid container xs={12} justifyContent="center">
        {selected ? (
          <Form {...{ [query]: selected, handleUpdate }} />
        ) : (
          <ManageWelcomeCard />
        )}
      </Grid>
    </Grid>
  )
}
