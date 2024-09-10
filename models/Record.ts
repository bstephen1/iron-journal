import { generateId } from '../lib/util'
import Exercise from './AsyncSelectorOption/Exercise'
import Note from './Note'
import { Set } from './Set'

// todo: add activeCategory (for programming)
export default class Record {
  exercise: Exercise | null
  activeModifiers: string[]
  category: string | null
  notes: Note[]
  setType: SetType
  sets: Set[]
  supersetGroup?: number
  readonly _id: string
  constructor(
    public date: string,
    record?: Partial<Record>,
  ) {
    this.exercise = record?.exercise || null
    this.activeModifiers = record?.activeModifiers || []
    this.category = record?.category || ''
    this.notes = record?.notes || []
    this.sets = record?.sets || []
    this.setType = record?.setType ?? DEFAULT_SET_TYPE
    this._id = generateId()
  }
}

/** Marks the structure of the set in a record. Reads as <operator> <value|range> <field>.
 *  Eg, "exactly 5 reps" means every set in the record is supposed to have 5 reps.
 *
 * Records with the same SetType are grouped together when pulling history so progress can be tracked.
 */
export interface SetType {
  field: keyof Set
  operator: SetOperator
  value?: number
  /** used for "between" operator */
  min?: number
  /** used for "between" operator */
  max?: number
}

export type SetOperator = (typeof setOperators)[number]
export const setOperators = [
  'exactly',
  'at most',
  'at least',
  'between',
  'total',
  'rest',
] as const

export const DEFAULT_SET_TYPE: SetType = {
  operator: 'exactly',
  value: 6,
  field: 'reps',
}
