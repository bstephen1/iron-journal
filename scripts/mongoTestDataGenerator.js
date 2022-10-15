
const db = connect('mongodb://localhost:27017/test')


function addModifier(name, status, canDelete) {
    return { name, status, canDelete }
}

function addName(name) {
    return { name }
}

function addExercise(name, status, notes, cues, validModifiers) {
    return { name, status, notes, cues, validModifiers }
}

function addSet(weight, reps, rpe) {
    return { weight, reps, rpe }
}

function addRecord(type, exerciseName, activeModifiers, validModifiers, sets) {
    return { type, exerciseName, activeModifiers, validModifiers, sets }
}

//todo: sessionType and program
function addSessions(date, records) {
    return { date, records }
}

let modifiers = [
    addModifier('belt', 'active', true),
    addModifier('band', 'archived', true),
    addModifier('pause', 'active', true),
    addModifier('unilateral', 'active', false), //add L/R rows
    addModifier('AMRAP', 'active', false), //or set type?
    addModifier('bodyweight', 'active', false), //add BW column
]


let exercises = [
    addExercise('squats', 'active', 'Milk and squats.', ['knees out', 'chest up'], ['belt', 'band']),
    addExercise('bench', 'active', '', [`"punch the sky" (keep wrists straight)`, 'squeeze pinkies', 'lats at the bottom', 'squeeze bench with thights (keeps butt down)', 'bulldog grip (rotate wrists so bar rests on palms and doesn\'t bend wrists back -- HUGE difference'], ['belt', 'pause']),
    addExercise('curls', 'active', 'curl curl curl', [], ['bodyweight', 'unilateral']),
    addExercise('zercher squat', 'archived', 'never again', ['pain'], ['AMRAP']),
]

//todo: myo, super, rep range (?), weigh-in, cardio
let setTypes = [
    addName('basic')
]

let sets1 = [
    addSet(100, 5, 8),
    addSet(110, 5, 9),
    addSet(120, 5, 10)
]

let sets2 = [
    addSet(25, 15, undefined),
    addSet(30, 12, undefined),
    addSet(30, 10, undefined)
]

let record1 = [
    addRecord('basic', 'squats', ['belt'], ['belt', 'pause'], sets1),
    addRecord('basic', 'curls', ['belt', 'AMRAP'], ['belt', 'AMRAP', 'unilateral', 'bodyweight'], sets2)
]

let sessions = [
    addSessions('2022-09-26', record1)
]

// START OPERATIONS

db.dropDatabase()

db.modifiers.insertMany(modifiers)
db.exercises.insertMany(exercises)
db.setTypes.insertMany(setTypes)
db.sessions.insertMany(sessions)


