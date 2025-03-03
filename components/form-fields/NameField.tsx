import { memo, useCallback } from 'react'
import * as yup from 'yup'

import isEqual from 'react-fast-compare'
import InputField from './InputField'

// This method requires using anonymous functions rather than arrow functions (using "function" keyword)
// because arrow functions preserve the context of "this", but Yup needs the nested "this" from addMethod.
yup.addMethod(yup.string, 'unique', function (message: string, list: string[]) {
  return this.test('unique', message, function (value) {
    return !!value && list.length !== new Set(list.concat(value)).size
  })
})

interface Props {
  name?: string
  handleUpdate: (updates: { name?: string }) => void
  options: string[]
}
export default memo(function NameField({ name, handleUpdate, options }: Props) {
  return (
    <InputField
      label="Name"
      initialValue={name}
      required
      fullWidth
      handleSubmit={useCallback(
        (name) => handleUpdate({ name }),
        [handleUpdate]
      )}
      // yup messes up eslint
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      yupValidator={yup
        .string()
        .required('Must have a name')
        // @ts-expect-error  ts isn't recognizing that addMethod() added this. Possible solutions: https://github.com/jquense/yup/issues/312
        .unique('Already exists!', options)}
    />
  )
}, isEqual)
