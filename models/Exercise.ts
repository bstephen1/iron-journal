import { v4 as uuid } from 'uuid'
import Category from './Category'
import { ExerciseStatus } from './ExerciseStatus'
import Modifier from './Modifier'
import { NamedObject } from './NamedObject'
import Note from './Note'

// todo: add activeCategory (for programming)
export default class Exercise extends NamedObject {
  constructor(
    public name: string,
    public status: ExerciseStatus = ExerciseStatus.ACTIVE,
    public notes: Note[] = [],
    public categories: Category[] = [],
    public modifiers: Modifier[] = [],
    public readonly _id: string = uuid()
  ) {
    super(name, _id)
  }
}
