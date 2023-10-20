import { TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { Dayjs } from 'dayjs'
import { DATE_FORMAT } from 'lib/frontend/constants'
import { useRouter } from 'next/router'
import { Dispatch, SetStateAction } from 'react'
import BodyweightInput from './BodyweightInput'
import SessionDatePicker from './SessionDatePicker'

interface Props {
  day: Dayjs
  setTargetDate: Dispatch<SetStateAction<string>>
  disableRouter?: boolean
}
export default function TitleBar({ day, setTargetDate, disableRouter }: Props) {
  const router = useRouter()

  const handleDateChange = (newDay: Dayjs) => {
    const date = newDay.format(DATE_FORMAT)
    setTargetDate(date)
    !disableRouter && router.push(date)
  }

  return (
    <Grid container spacing={2}>
      {/* todo: change this to a data type which is user defined per program, or freestyle/unstructured type*/}
      <Grid xs={12} sm={4}>
        <SessionDatePicker
          day={day}
          handleDayChange={handleDateChange}
          textFieldProps={{ fullWidth: true }}
        />
      </Grid>
      <Grid xs={12} sm={4}>
        {/* todo: session type */}
        <TextField label="Session Type" fullWidth disabled />
      </Grid>
      {/* todo: customize to show days that have a record; possibly show title; 
            possibly give days a 'type' instead of title, with an associated icon;
            could also highlight different programs / meso cycles */}
      <Grid xs={12} sm={4}>
        <BodyweightInput day={day} fullWidth />
      </Grid>
    </Grid>
  )
}
