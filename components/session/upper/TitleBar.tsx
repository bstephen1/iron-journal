import { TextField } from '@mui/material'
import Grid from '@mui/material/Unstable_Grid2'
import { Dayjs } from 'dayjs'
import { DATE_FORMAT } from 'lib/frontend/constants'
import { useRouter } from 'next/router'
import BodyweightInput from './BodyweightInput'
import SessionDatePicker from './SessionDatePicker'

interface Props {
  date: Dayjs
}
export default function TitleBar({ date }: Props) {
  const router = useRouter()

  const handleDateChange = (newDate: Dayjs) => {
    const date = newDate.format(DATE_FORMAT)
    router.push(date)
  }

  return (
    <Grid container spacing={2}>
      {/* todo: change this to a data type which is user defined per program, or freestyle/unstructured type*/}
      <Grid xs={12} sm={4}>
        <SessionDatePicker
          date={date}
          handleDateChange={handleDateChange}
          textFieldProps={{ fullWidth: true }}
        />
      </Grid>
      <Grid xs={12} sm={4}>
        <TextField label="Session Type" fullWidth />
      </Grid>
      {/* todo: customize to show days that have a record; possibly show title; 
            possibly give days a 'type' instead of title, with an associated icon;
            could also highlight different programs / meso cycles */}
      <Grid xs={12} sm={4}>
        <BodyweightInput date={date} fullWidth />
      </Grid>
    </Grid>
  )
}
