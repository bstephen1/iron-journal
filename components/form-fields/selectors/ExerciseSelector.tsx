import { TextFieldProps } from '@mui/material'
import CategoryFilter from 'components/CategoryFilter'
import { addExercise, useCategories } from 'lib/frontend/restService'
import { useNames } from 'lib/util'
import Exercise from 'models/Exercise'
import { useState } from 'react'
import { KeyedMutator } from 'swr'
import AsyncSelector from './AsyncSelector'

interface ExerciseSelectorProps {
  exercise: Exercise | null
  handleChange: (value: Exercise | null) => void
  exercises: Exercise[] | undefined
  mutate: KeyedMutator<Exercise[]>
  variant?: TextFieldProps['variant']
  /** If this is omitted the category filter will not be rendered */
  handleCategoryChange?: (category: string | null) => void
  category?: string | null
}
export default function ExerciseSelector({
  exercise,
  exercises,
  mutate,
  handleCategoryChange,
  category = null,
  ...asyncSelectorProps
}: ExerciseSelectorProps) {
  const { categories } = useCategories()
  const categoryNames = useNames(categories)
  const [filterOpen, setFilterOpen] = useState(false)

  // todo: when switching category, input should null out if it's not in the new category.
  // Used to do that before pulling category state out to parent.
  const handleFilterChange = (filtered: Exercise[]) => {
    // if a category is selected and the existing exercise is not in that category, erase the input value.
    if (
      category &&
      exercise &&
      !filtered.some((item) => item.name === exercise.name)
    ) {
      // This was causing a mysterious error for updating a component while
      // rendering a different component.
      // Not sure why but wrapping it in a setTimeout() fixes it.
      // See: https://stackoverflow.com/a/69236626
      setTimeout(() => asyncSelectorProps.handleChange(null), 0)
    }
  }

  // todo: null out category if selecting something that's not in the category?
  // todo: on clicking category chip in form, setCategory to that value?
  const filterCategories = (exercise: Exercise) => {
    return !category || exercise.categories.some((name) => name === category)
  }

  return (
    <AsyncSelector
      {...asyncSelectorProps}
      value={exercise || null} // need to reduce undefined | null to just null to avoid switching to uncontrolled
      mutateOptions={mutate}
      options={exercises}
      label="Exercise"
      placeholder="Select or Add New Exercise"
      filterCustom={filterCategories}
      handleFilterChange={handleFilterChange}
      adornmentOpen={filterOpen}
      Constructor={Exercise}
      addNewItem={addExercise}
      // inputRef={inputRef}
      // todo: anchor to the bottom of the input?
      startAdornment={
        handleCategoryChange && (
          <CategoryFilter
            // standard variant bizzarely removes left input padding. Easier to add it back to Category filter
            sx={{ pr: asyncSelectorProps.variant === 'standard' ? 1 : 0 }}
            {...{
              categories: categoryNames,
              category,
              setCategory: handleCategoryChange,
              handleOpenChange: setFilterOpen,
            }}
          />
        )
      }
    />
  )
}
