import { generateId } from '../lib/util'
import Exercise from './Exercise'
import Modifier from './Modifier'
import Note from './Note'
import Set from './Set'

export default class Record {
  constructor(
    public date: string,
    public exercise: Exercise | null = null,
    public activeModifiers: Modifier[] = [],
    public fields: (keyof Set)[] = ['weight', 'reps', 'effort'],
    public notes: Note[] = [],
    public sets: Set[] = [],
    public readonly _id: string = generateId()
  ) {}
}
