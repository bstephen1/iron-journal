const { randomUUID } = require('crypto')

const db = connect('mongodb://localhost:27017/test')

// todo: look into seeing if this script can be made less fragile with denormalized values

// todo: REALLY don't like having to redefine this here, but it doesn't seem to be able to import the .ts class
class Exercise {
  constructor(
    name,
    status = 'active',
    notes = [],
    categories = [],
    modifiers = []
  ) {
    ;(this.name = name),
      (this.status = status),
      (this.notes = notes),
      (this.categories = categories),
      (this.modifiers = modifiers),
      (this._id = randomUUID())
  }
}

function addModifier(name, status, weight) {
  weight = weight ?? 0
  return { name, status, weight, _id: randomUUID() }
}

function addCategory(name) {
  return { name, _id: randomUUID() }
}

function addNote(value = '', tags = []) {
  return { value, tags }
}

function addSet(weight, reps, effort, distance, time) {
  return { weight, reps, effort, distance, time }
}

function addRecord(date, exercise, activeModifiers, sets, fields, notes, _id) {
  return {
    date,
    exercise,
    activeModifiers,
    sets,
    fields,
    notes,
    _id,
  }
}

function getRecordIdsForDate(date) {
  return records
    .filter((record) => record.date === date)
    .map((record) => record._id)
}

// todo: sessionType and program
function addSessions(date, records, _id) {
  return { date, records, _id }
}

let categories = [
  addCategory('quads'),
  addCategory('squat'),
  addCategory('side delts'),
  addCategory('biceps'),
  addCategory('hamstrings'),
  addCategory('bench press'),
  addCategory('chest'),
  addCategory('triceps'),
  addCategory('cardio'),
  addCategory('strongman'),
]

let modifiers = [
  addModifier('belt', 'active'),
  addModifier('band', 'archived'),
  addModifier('pause', 'active'),
  addModifier('flared', 'active'),
  addModifier('tucked', 'active'),
  addModifier('wide', 'active'),
  addModifier('narrow', 'active'),
  addModifier('wraps', 'active'),
  addModifier('middle', 'active'),
  addModifier('barbell', 'active'),
  addModifier('unilateral left', 'active'),
  addModifier('unilateral right', 'active'),
  addModifier('AMRAP', 'active'),
  addModifier('myo', 'active'),
  addModifier('bodyweight', 'active'),
  // todo: rep goal / marathon
]

let exercises = [
  new Exercise(
    'high bar squats',
    'active',
    [addNote('knees up'), addNote('chest up')],
    [categories[1]],
    [modifiers[0], modifiers[1]]
  ),
  new Exercise(
    'curls',
    'active',
    [addNote('twist in', [modifiers[9]])],
    [categories[3]],
    [modifiers[9], modifiers[12], modifiers[13]]
  ),
  new Exercise(
    'multi grip bench press',
    'active',
    [
      addNote('great triceps', [modifiers[4], modifiers[8]]),
      addNote('great chest', [modifiers[3], modifiers[6]]),
    ],
    [categories[5], categories[6], categories[7]],
    [
      modifiers[0],
      modifiers[2],
      modifiers[3],
      modifiers[4],
      modifiers[5],
      modifiers[6],
      modifiers[7],
    ]
  ),
  new Exercise(
    'zercher squat',
    'archived',
    [addNote('pain')],
    [categories[1]],
    [modifiers[13]]
  ),
  new Exercise('running', 'active', [], [categories[8]], []),
  new Exercise('yoke', 'active', [], [categories[9]], []),
]

let sets1 = [addSet(100, 5, 8), addSet(110, 5, 9), addSet(120, 5, 10)]

let sets2 = [
  addSet(25, 15, undefined),
  addSet(30, 12, undefined),
  addSet(30, 10, undefined),
]

let setsDist = [addSet(undefined, undefined, 9, 5000, 900)]

let setsDist2 = [
  addSet(undefined, undefined, 10, 50, 10),
  addSet(undefined, undefined, 10, 50, 9.83),
  addSet(undefined, undefined, 10, 50, 8.33),
]

let setsAll = [addSet(500, 2, 8, 50, 10)]

let records = [
  addRecord(
    '2022-09-26',
    { ...exercises[0] },
    [modifiers[0]],
    sets1,
    ['weight', 'reps', 'effort'],
    [],
    randomUUID()
  ),
  addRecord(
    '2022-09-26',
    { ...exercises[1] },
    [modifiers[13]],
    sets2,
    ['weight', 'reps'],
    [],
    randomUUID()
  ),
  addRecord(
    '2022-09-26',
    { ...exercises[4] },
    [],
    setsDist,
    ['time', 'distance', 'effort'],
    [],
    randomUUID()
  ),
  addRecord(
    '2022-09-26',
    { ...exercises[4] },
    [],
    setsDist2,
    ['distance', 'time', 'effort'],
    [],
    randomUUID()
  ),
  addRecord(
    '2022-09-26',
    { ...exercises[5] },
    [],
    setsAll,
    ['weight', 'distance', 'time', 'reps', 'effort'],
    [],
    randomUUID()
  ),
]

let sessions = [
  addSessions('2022-09-26', getRecordIdsForDate('2022-09-26'), randomUUID()),
]

//  START OPERATIONS

db.dropDatabase()

db.modifiers.insertMany(modifiers)
db.categories.insertMany(categories)
db.exercises.insertMany(exercises)
db.sessions.insertMany(sessions)
db.records.insertMany(records)

console.log('')
console.log('-----------------------------')
console.log('Script finished successfully!')
console.log('-----------------------------')
console.log('')
