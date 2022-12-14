import { ChangeEvent, useEffect, useRef, useState } from 'react'
import * as yup from 'yup'

/*
 * This hook is based off the behavior of react-hook-form's useForm hook,
 * but focused on our use cases, namely:
 *  - Individual field validation rather than a complete form
 *  - Autosaving onBlur or after debounce if validation passes
 *  - Reset to defaultValue if it changes
 *
 * Initially this was following react-hook-form's philosophy of using uncontrolled
 * inputs, which should be theoretically more performant as they minimizes re-renders.
 * However, it was having issues with updating defaultValues properly so it was
 * replaced with using controlled values, which are easier to work with.
 *
 */

interface Props<T = string> {
  // the validator should be for a single field. Run reach() to specify the field to use.
  yupValidator?: ReturnType<typeof yup.reach>
  debounceMilliseconds?: number
  handleSubmit: (value: T) => void

  // required so we can determine the type. Cannot be undefined.
  // Note: If T is an array/object, use a const defined outside the component for
  // empty values or useEffect will infinitely re-render with a new object every render
  initialValue: T
  autoSubmit?: boolean
}
export default function useField<T = string>({
  yupValidator,
  debounceMilliseconds = 800,
  initialValue,
  autoSubmit = true,
  handleSubmit,
}: Props<T>) {
  const timerRef = useRef<NodeJS.Timeout>()
  const [error, setError] = useState('')
  const [value, setValue] = useState(initialValue)
  const [hasValidated, setHasValidated] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isDirty = value !== initialValue

  // Spread this into an input component to set up the value.
  // If the input is simple this may be all that's needed!
  const control = (label?: string) => {
    return {
      label,
      value,
      onBlur,
      onChange,
    }
  }

  // todo: there's some weird behavior right after validating an error (debounce stops working)

  // initial we tracked isTouched but that behavior isn't fluid with an autosaving field.
  // The only benefit of onBlur is that we can immediately submit rather than wait for the debounce
  const onBlur = () => {
    clearTimeout(timerRef.current)

    autoSubmit && isDirty && submit()
  }

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // todo: if non-string this must be overriden
    setValue(e.target.value as T) // todo: tell ts this is for strings only
    validate(e.target.value as T)

    autoSubmit && debouncedSubmit()
  }

  const debouncedSubmit = () => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(
      () => setIsSubmitting(true),
      debounceMilliseconds
    )
  }

  const validate = (value: T) => {
    console.log(
      `validating ${value !== initialValue ? 'dirty' : 'clean'}: ${value}`
    )
    if (!yupValidator || value === initialValue) {
      setHasValidated(true)
      return
    }

    yupValidator
      .validate(value)
      .then(setError(''))
      .catch((e: yup.ValidationError) => setError(e.message))
      .finally(setHasValidated(true))
  }

  const submit = () => {
    validate(value)
    setIsSubmitting(true)
  }

  const reset = useRef((value: T) => {
    setError('')
    setValue(value)
    setIsSubmitting(false)
    setHasValidated(false)
  })

  useEffect(() => {
    reset.current(initialValue)
  }, [initialValue])

  // todo: definitely DON'T want this to needlessly trigger every time value changes.
  // maybe this https://stackoverflow.com/questions/69331438/wise-to-exclude-this-useeffect-dependency-array-variable-lint-recommends-3-but
  useEffect(() => {
    if (isSubmitting && hasValidated && !error) {
      handleSubmit(value)
      setIsSubmitting(false)
      setHasValidated(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasValidated, isSubmitting, error])

  return {
    control,
    debouncedSubmit,
    validate,
    submit,
    error,
    reset: reset.current,
    value,
    setValue,
    isEmpty: !value,
    isDirty,
  }
}
