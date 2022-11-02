import { Collection, Document, Filter, MongoClient, WithId } from 'mongodb'
import Exercise from '../../models/Exercise'
import Modifier from '../../models/Modifier'
import { Session } from '../../models/Session'

const uri = 'mongodb://localhost:27017'
const rawClient = new MongoClient(uri)
let client = await rawClient.connect()
const db = client.db(process.env.DB_NAME)

const sessions = db.collection('sessions')
const exercises = db.collection<Exercise>('exercises')
const modifiers = db.collection<Modifier>('modifiers')

async function fetchCollection<T extends Document>(
  collection: Collection<T>,
  constraints: Filter<T> = {}
) {
  // we need to construct the array because find() returns a cursor
  let documents: WithId<T>[] = []
  await collection.find(constraints).forEach((document) => {
    documents.push(document)
  })
  return documents
}

//---------
// SESSION
//---------

// todo: change function names to mirror mongo function used? Or keep a separate convention to not associate with db provider?
export async function addSession(session: Session) {
  return await sessions.insertOne(session)
}

export async function fetchSession(date: string) {
  return await sessions.findOne({ date: date }, { projection: { _id: false } })
}

export async function updateSession(session: Session) {
  return await sessions.replaceOne({ date: session.date }, session)
}

//----------
// EXERCISE
//----------

export async function addExercise(exercise: Exercise) {
  return await exercises.insertOne(exercise)
}

export async function fetchExercises(filter?: Filter<Exercise>) {
  return await fetchCollection(exercises, filter)
}

export async function fetchExercise(name: string) {
  return await exercises.findOne({ name: name }, { projection: { _id: false } })
}

export async function updateExercise(exercise: Exercise) {
  // upsert creates a new record if it couldn't find one to update
  return await exercises.replaceOne({ _id: exercise._id }, exercise, {
    upsert: true,
  })
}

interface updateExerciseFieldProps<T extends keyof Exercise> {
  exercise: Exercise
  field: T
  value: Exercise[T] | any // todo $set is complaining bc it adds fields for each array index
}
export async function updateExerciseField<T extends keyof Exercise>({
  exercise,
  field,
  value,
}: updateExerciseFieldProps<T>) {
  return await exercises.updateOne(
    { _id: exercise._id },
    { $set: { [field]: value } }
  )
}

//----------
// MODIFIER
//----------

export async function addModifier(modifier: Modifier) {
  return await modifiers.insertOne(modifier)
}

export async function fetchModifiers(filter?: Filter<Modifier>) {
  return await fetchCollection(modifiers, filter)
}

export async function fetchModifier(name: string) {
  return await modifiers.findOne({ name: name }, { projection: { _id: false } })
}

export async function updateModifier(modifier: Modifier) {
  // upsert creates a new record if it couldn't find one to update
  return await modifiers.replaceOne({ _id: modifier._id }, modifier, {
    upsert: true,
  })
}

// todo: seperate methods for updating specific fields? To reduce data load on small updates?
