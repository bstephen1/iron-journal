import NotesIcon from '@mui/icons-material/Notes'
import { Box, Card, CardContent, CardHeader, Stack } from '@mui/material'
import { ComboBoxField } from 'components/form-fields/ComboBoxField'
import StyledDivider from 'components/StyledDivider'
import useExtraWeight from 'lib/frontend/useExtraWeight'
import { DisplayFields } from 'models/DisplayFields'
import Record from 'models/Record'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import RecordNotesDialogButton from '../records/RecordNotesDialogButton'
import SetHeader from '../records/SetHeader'
import SetInput from '../records/SetInput'

interface Props {
  record: Record
  /** Must use the displayFields of the parent record.
   * The history record's displayFields will be stale if the parent's fields change.
   */
  displayFields: DisplayFields
  /** Modifiers being filtered. Will display the history record's modifiers if they are different from the active record's modifiers. */
  filterModifiers: string[]
}
export default function HistoryCard({
  record,
  displayFields,
  filterModifiers,
}: Props) {
  const router = useRouter()
  const extraWeight = useExtraWeight(record)
  // use splitWeight if parent record is using it, even if this history record doesn't have the
  // right modifiers for it to be active
  const showSplitWeight = displayFields.visibleFields.some((field) =>
    ['plateWeight', 'totalWeight'].includes(field.name)
  )

  const showModifiers = useMemo(
    () =>
      (!filterModifiers.length && record.activeModifiers.length) ||
      record.activeModifiers.some(
        (modifier) => !filterModifiers.includes(modifier)
      ),
    [record.activeModifiers, filterModifiers]
  )

  return (
    <Card elevation={0}>
      <CardHeader
        sx={{ pt: 0 }}
        title={
          <Box
            // todo: Could add the record number so swiper can directly link to the record.
            // May not be worth the effort tho.
            onClick={() => router.push(record.date)}
            sx={{ cursor: 'pointer' }}
            width="fit-content"
          >
            {record.date}
          </Box>
        }
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <RecordNotesDialogButton
            notes={record.notes}
            Icon={<NotesIcon />}
            tooltipTitle="Record Notes"
            sets={record.sets}
            readOnly
          />
        }
      />
      <StyledDivider elevation={0} sx={{ height: 2, my: 0 }} />

      {/* Note -- cannot override pb normally. See: https://stackoverflow.com/questions/54236623/cant-remove-padding-bottom-from-card-content-in-material-ui */}
      <CardContent sx={{ px: 1 }}>
        <Stack spacing={2}>
          {showModifiers && (
            <ComboBoxField
              label="Modifiers"
              options={record.activeModifiers}
              initialValue={record.activeModifiers}
              variant="standard"
              readOnly
            />
          )}
          <SetHeader readOnly {...{ displayFields, showSplitWeight }} />
        </Stack>
        <Box sx={{ pb: 0 }}>
          {record.sets.map((set, i) => (
            <SetInput
              key={i}
              readOnly
              {...{ set, displayFields, extraWeight }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}
