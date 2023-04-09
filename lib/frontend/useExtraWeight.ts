import Record from 'models/Record'
import { useBodyweightHistory, useModifiers } from './restService'

export default function useExtraWeight(record?: Record | null) {
  const { modifiersIndex } = useModifiers()
  const { data: bodyweightData } = useBodyweightHistory({
    limit: 2,
    end: record?.date,
  })

  if (!record || modifiersIndex === undefined || bodyweightData === undefined) {
    return undefined
  }

  const { activeModifiers, exercise } = record
  const attributes = exercise?.attributes ?? {}

  let bodyweight = 0
  if (attributes.bodyweight) {
    switch (bodyweightData?.length) {
      case 1:
        bodyweight = bodyweightData[0].value
        break
      case 2:
        // if same date use the unofficial weight.
        if (bodyweightData[0].date !== bodyweightData[1].date) {
          bodyweight = bodyweightData[0].value
          break
        }
        bodyweight =
          bodyweightData[0].type === 'unofficial'
            ? bodyweightData[0].value
            : bodyweightData[1].value
      case 0:
      default:
        break
    }
  }

  const baseWeight = exercise?.weight ?? 0

  const modifierWeight = activeModifiers.reduce(
    (total, name) => (total += modifiersIndex[name]?.weight ?? 0),
    0
  )

  return baseWeight + modifierWeight + bodyweight
}
