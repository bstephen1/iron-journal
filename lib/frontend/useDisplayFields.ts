import {
  DEFAULT_DISPLAY_FIELDS,
  DEFAULT_DISPLAY_FIELDS_SPLIT_WEIGHT,
} from '../../models/DisplayFields'
import Record from '../../models/Record'

export default function useDisplayFields({ record }: { record?: Record }) {
  return (
    record?.exercise?.displayFields ??
    (record?.exercise?.attributes?.bodyweight
      ? DEFAULT_DISPLAY_FIELDS_SPLIT_WEIGHT
      : DEFAULT_DISPLAY_FIELDS)
  )
}
