import {
  Box,
  CircularProgress,
  InputAdornment,
  TextFieldProps,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useState } from 'react'
import * as yup from 'yup'
import { DATE_FORMAT, DEFAULT_UNITS } from '../../lib/frontend/constants'
import {
  updateBodyweight,
  useBodyweightHistory,
} from '../../lib/frontend/restService'
import Bodyweight, { WeighInType } from '../../models/Bodyweight'
import InputField from '../form-fields/InputField'
import BodyweightInputToggle from './BodyweightInputToggle'

interface Props {
  date: Dayjs
}
export default function BodyweightInput({
  date,
  ...textFieldProps
}: Props & TextFieldProps) {
  const [bodyweightType, setBodyweightType] = useState<WeighInType>('official')
  const { data, mutate } = useBodyweightHistory({
    limit: 1,
    end: date.format(DATE_FORMAT),
    type: bodyweightType,
  })
  const validationSchema = yup.object({
    // this will be cast to a number on submit
    value: yup.string().required('Must have a value'),
  })
  const loading = data === undefined

  const handleSubmit = async (value: string) => {
    const now = dayjs()
    const newBodyweight = new Bodyweight(
      Number(value),
      bodyweightType,
      // date will always have default time since it is extracted from the URL date string.
      // If the date is today, we can add in the current timestamp.
      date.format(DATE_FORMAT) === now.format(DATE_FORMAT) ? now : date
    )

    // on days not the current day, the date's time will be whatever the default dayjs() time is.
    // So any new weigh-ins will overwrite old ones. This is probably fine? Since you can't actually
    // perform a new weigh-in in the past.
    await updateBodyweight(newBodyweight)
    mutate([newBodyweight])
  }

  const getHelperText = () => {
    if (loading) return 'Loading...'
    if (!data.length) return `No existing ${bodyweightType} weigh-ins found`
    return `Using latest ${bodyweightType} weight from ${dayjs(
      data[0].dateTime
    ).format(DATE_FORMAT)}`
  }

  return (
    <InputField
      {...textFieldProps}
      type="number"
      label="Bodyweight"
      canSubmitSameValue
      // disable scroll wheel changing the number
      onWheel={(e) => e.target instanceof HTMLElement && e.target.blur()}
      initialValue={!data?.length ? '' : String(data[0].value)}
      handleSubmit={handleSubmit}
      yupValidator={yup.reach(validationSchema, 'value')}
      InputProps={{
        readOnly: loading,
        // without the box the loading spinner has an uneven width
        startAdornment: (
          <>
            {loading ? (
              <Box sx={{ width: '20px' }}>
                <CircularProgress color="inherit" size={20} />
              </Box>
            ) : (
              <BodyweightInputToggle
                type={bodyweightType}
                handleTypeChange={setBodyweightType}
              />
            )}
          </>
        ),
        endAdornment: (
          <InputAdornment position="end">{DEFAULT_UNITS.weight}</InputAdornment>
        ),
      }}
      defaultHelperText={getHelperText()}
    />
  )
}
