import { generateId } from '../lib/util'
import Exercise from './Exercise'
import Set from './Set'
import { SetType } from './SetType'

export default class Record {
  constructor(
    public date: string,
    public exercise: Exercise | null = null,
    public type: SetType = SetType.STANDARD,
    public activeModifiers: string[] = [],
    public sets: Set[] = [],
    public readonly _id: string = generateId()
  ) {}
}
