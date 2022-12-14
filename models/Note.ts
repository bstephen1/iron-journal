import { NamedObject, NamedStub } from './NamedObject'

export default class Note {
  constructor(public value = '', public tags: NamedObject[] = []) {}
}
