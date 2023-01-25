import { Check, Replay } from '@mui/icons-material'
import { TextField, TextFieldProps, Tooltip } from '@mui/material'
import { useEffect, useRef } from 'react'
import { reach } from 'yup'
import TransitionIconButton from '../TransitionIconButton'
import useField from './useField'

interface Props {
  label: string
  initialValue?: string
  defaultHelperText?: string
  /** whether the input should allow changing to the same value.
   *
   * e.g. a weigh-in that is the same as the previous weight.
   */
  canSubmitSameValue?: boolean
  handleSubmit: (value: string) => void
  yupValidator: ReturnType<typeof reach>
}
export default function InputField(props: Props & TextFieldProps) {
  const {
    label,
    initialValue = '',
    defaultHelperText = ' ',
    canSubmitSameValue = false,
    handleSubmit,
    yupValidator,
    ...textFieldProps
  } = props

  const inputRef = useRef<HTMLInputElement>()
  const sameValueSubmitVisible = useRef(false)
  const { control, reset, submit, isDirty, error, value } = useField<string>({
    yupValidator,
    handleSubmit,
    initialValue,
    autoSubmit: false,
  })

  const onReset = () => {
    reset(initialValue)
    inputRef.current?.focus()
  }

  useEffect(() => {
    if (
      canSubmitSameValue &&
      !!value &&
      document.activeElement === inputRef.current
    ) {
      sameValueSubmitVisible.current = true
    } else if (sameValueSubmitVisible) {
      sameValueSubmitVisible.current = false
    }
  }, [canSubmitSameValue, value])

  return (
    <TextField
      {...textFieldProps}
      {...control(label)}
      error={!!error}
      autoComplete="off"
      helperText={error || defaultHelperText}
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          submit()
          inputRef.current?.blur()
        }
      }}
      inputRef={inputRef}
      InputProps={{
        ...textFieldProps.InputProps,
        endAdornment: (
          <>
            <TransitionIconButton
              isVisible={isDirty || sameValueSubmitVisible.current}
              disabled={!!error}
              onClick={submit}
            >
              <Tooltip title="submit">
                <Check />
              </Tooltip>
            </TransitionIconButton>
            <TransitionIconButton isVisible={isDirty} onClick={onReset}>
              <Tooltip title="reset">
                <Replay />
              </Tooltip>
            </TransitionIconButton>
            {textFieldProps.InputProps?.endAdornment}
          </>
        ),
      }}
    />
  )
}
