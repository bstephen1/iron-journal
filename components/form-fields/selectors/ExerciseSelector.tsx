import { TextFieldProps } from '@mui/material'
import { useEffect, useState } from 'react'
import { KeyedMutator } from 'swr'
import { addExercise, useCategories } from '../../../lib/frontend/restService'
import { GenericAutocompleteProps, useNames } from '../../../lib/util'
import Exercise from '../../../models/Exercise'
import { ExerciseStatusOrder } from '../../../models/ExerciseStatus'
import { NamedStub } from '../../../models/NamedObject'
import CategoryFilter from '../../CategoryFilter'
import withAsync from '../withAsync'
import SelectorBase from './SelectorBase'

interface WithExerciseProps
  extends Partial<GenericAutocompleteProps<Exercise | NamedStub>> {
  exercise: Exercise | null
  handleChange: (value: Exercise | null) => void
  exercises: Exercise[] | undefined
  mutate: KeyedMutator<Exercise[]>
  variant?: TextFieldProps['variant']
  handleCategoryFilterChange?: (category: string | null) => void
  initialCategoryFilter?: string | null
}
function withExercise(Component: typeof SelectorBase<Exercise>) {
  return function ({
    exercise,
    exercises,
    mutate,
    handleCategoryFilterChange,
    initialCategoryFilter = null,
    ...props
  }: WithExerciseProps) {
    // const inputRef = useRef<HTMLElement>(null)
    const { categories } = useCategories()
    const categoryNames = useNames(categories)
    const [category, setCategory] = useState<string | null>(
      initialCategoryFilter
    )

    useEffect(() => {
      handleCategoryFilterChange?.(category)
    }, [category, handleCategoryFilterChange])

    // temporarily store the current input in a stub and only create a true Exercise if the stub is selected
    class ExerciseStub implements NamedStub {
      name: string
      status: string
      constructor(name: string) {
        this.name = name
        this.status = 'Add New'
      }
    }

    // todo: null out category if selecting something that's not in the category?
    // todo: on clicking category chip in form, setCategory to that value?
    const filterCategories = (exercise: Exercise, inputValue: string) => {
      return (
        !category ||
        exercise.name === inputValue || // if you filter out an exercise you can still type it in manually
        exercise.categories.some((name) => name === category)
      )
    }

    return (
      <Component
        {...props}
        value={exercise}
        mutateOptions={mutate}
        options={
          exercises?.sort(
            (a, b) =>
              ExerciseStatusOrder[a.status] - ExerciseStatusOrder[b.status]
          ) || []
        }
        label="Exercise"
        groupBy={(option) => option.status}
        placeholder="Select or Add New Exercise"
        filterCustom={filterCategories}
        StubConstructor={ExerciseStub}
        Constructor={Exercise}
        addNewItem={addExercise}
        // inputRef={inputRef}
        // todo: anchor to the bottom of the input?
        // todo: any way to get label to offset and not shrink with startAdornment? Not officially supported by mui bc "too hard" apparently. Is placeholder an ok comrpromise?
        startAdornment={
          <CategoryFilter
            {...{ categories: categoryNames, category, setCategory }}
          />
        }
      />
    )
  }
}

export const ExerciseSelector = withExercise(withAsync(SelectorBase<Exercise>))
