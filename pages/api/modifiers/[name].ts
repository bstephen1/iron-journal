import type { NextApiRequest, NextApiResponse } from 'next'
import {
  addModifier,
  fetchModifier,
  updateModifier,
} from '../../../lib/backend/mongoService'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const name = req.query.name

  console.log(`Incoming ${req.method} on modifier "${name}"`)

  if (!name || typeof name !== 'string') {
    res.status(400).json({ message: 'invalid modifier' })
    return
  }

  switch (req.method) {
    case 'GET':
      try {
        const modifier = await fetchModifier(name)
        res.status(200).json(modifier) // todo: return 204 when no content?
      } catch (e) {
        res.status(500).json({ message: 'error fetching modifiers' })
      }
      break
    case 'POST':
      try {
        await addModifier(JSON.parse(req.body))
        res.status(201).end()
      } catch (e) {
        res.status(500).json({ message: 'could not create modifier' })
      }
      break
    case 'PUT':
      try {
        await updateModifier(JSON.parse(req.body))
        res.status(200).end()
      } catch (e) {
        console.error(e)
        res.status(500).json({ message: 'could not update modifier', error: e })
      }
  }
}
