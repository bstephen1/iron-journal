import { SetType } from 'models/Record'
import DateRangeQuery from './DateRangeQuery'
import { ArrayMatchType } from './MongoQuery'

export type RecordQuery = DateRangeQuery &
  Partial<SetType> & {
    /** YYYY-MM-DD */
    date?: string
    /** Exercise name.  */
    exercise?: string
    /** Active modifier names */
    modifier?: string[]
    /** Specify how to match against the given modifiers array. Defaults to "Exact" */
    modifierMatchType?: ArrayMatchType
    /** determines whether to look for a specific set type or filter against sets */
    setMatchType?: SetMatchType
  }

export type SetMatchType = (typeof setMatchTypes)[number]
export const setMatchTypes = ['set type', 'filter', 'none'] as const

export const setMatchTypeDescriptions: { [type in SetMatchType]: string } = {
  'set type': 'Searches for records that match the provided set type',
  filter: 'Searches for records with sets that match the filter',
  none: 'No filter on sets',
}
