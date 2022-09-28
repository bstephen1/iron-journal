// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { createMongoConnection, fetchCollection } from '../../lib/mongoService'

// type Data = {
//   name: string
// }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  res.status(200).json(await fetchCollection('logs'))
}
