import { v4 as uuid } from 'uuid'

// todo: rename to NamedEntity
export class NamedObject {
  constructor(public name: string, public readonly _id: string = uuid()) {}
}

// There is no need to associate this with NamedObject because as a stub it only needs the fields explicitly defined
export class NamedStub {
  constructor(public name: string, public status: string) {}
}
