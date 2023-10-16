import AccessTimeIcon from '@mui/icons-material/AccessTime'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
} from '@mui/material'
import { ComboBoxField } from 'components/form-fields/ComboBoxField'
import SelectFieldAutosave from 'components/form-fields/SelectFieldAutosave'
import {
  ArrayMatchType,
  ArrayMatchTypeDescription,
} from 'models/query-filters/MongoQuery'
import {
  RecordQuery,
  setMatchTypeDescriptions,
  setMatchTypes,
} from 'models/query-filters/RecordQuery'
import Record, { DEFAULT_SET_TYPE, SetType } from 'models/Record'
import { Units } from 'models/Set'
import { useState } from 'react'
import RecordHeaderButton from '../records/RecordHeaderButton'
import SetTypeSelect from '../records/SetTypeSelect'

interface Props {
  record: Record
  filter: RecordQuery
  updateFilter: (changes: Partial<RecordQuery>) => void
  units: Units
  shouldSync: boolean
  onSyncChange: (matches: boolean) => void
}
export default function HistoryFilterHeaderButton({
  record,
  filter,
  updateFilter,
  units,
  shouldSync,
  onSyncChange,
}: Props) {
  const [open, setOpen] = useState(false)

  const setType: SetType = {
    operator: filter.operator ?? DEFAULT_SET_TYPE.operator,
    field: filter.field ?? DEFAULT_SET_TYPE.field,
    value: filter.value,
    min: filter.min,
    max: filter.max,
  }

  return (
    <>
      <RecordHeaderButton title="History Filter" onClick={() => setOpen(true)}>
        <AccessTimeIcon />
      </RecordHeaderButton>
      <Dialog
        open={open}
        fullWidth
        onClose={() => {
          setOpen(false)
        }}
        scroll="body"
      >
        <DialogTitle>History Filter</DialogTitle>
        <DialogContent>
          <Stack spacing={3} pb={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={shouldSync}
                  onChange={(_, checked) => onSyncChange(checked)}
                />
              }
              label="Sync with current record"
            />
            <ComboBoxField
              label="Modifiers"
              emptyPlaceholder="No filter"
              options={record.exercise?.modifiers}
              initialValue={filter?.modifier || []}
              variant="standard"
              handleSubmit={(modifier) => updateFilter({ modifier })}
              helperText=""
            />
            <SelectFieldAutosave
              fullWidth
              label="Modifier Match Type"
              options={Object.values(ArrayMatchType)}
              handleSubmit={(modifierMatchType) =>
                updateFilter({ modifierMatchType })
              }
              initialValue={
                filter.modifierMatchType ?? ArrayMatchType.Equivalent
              }
              variant="standard"
              helperText={ArrayMatchTypeDescription[
                filter.modifierMatchType ?? 'none'
              ].replaceAll('values', 'modifiers')}
            />
            <SetTypeSelect
              units={units}
              setType={setType}
              handleSubmit={updateFilter}
              sets={[]}
            />
            <SelectFieldAutosave
              fullWidth
              label="Set Match Type"
              options={[...setMatchTypes]}
              handleSubmit={(setMatchType) => updateFilter({ setMatchType })}
              initialValue={filter.setMatchType ?? 'none'}
              variant="standard"
              helperText={
                setMatchTypeDescriptions[filter.setMatchType ?? 'none']
              }
            />
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  )
}
