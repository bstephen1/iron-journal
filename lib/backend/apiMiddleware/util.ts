import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { ApiError } from 'next/dist/server/api-utils'
import { authOptions } from 'pages/api/auth/[...nextauth].api'

export type ApiHandler<T> = (
  req: NextApiRequest,
  userId: UserId
) => T | null | Promise<T | null>

export const methodNotAllowed = new ApiError(
  StatusCodes.METHOD_NOT_ALLOWED,
  'Method not allowed.'
)

export const recordNotFound = new ApiError(
  StatusCodes.NOT_FOUND,
  'Record not found.'
)

/** userId format for backend use. The frontend will not see the userId.
 * For mongo this is an ObjectId. */
export interface UserId extends ObjectId {}

/** Return the userId, formatted as a UserId. */
export async function getUserId(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<UserId> {
  // req and res appear to be required. You can call the function without them but it won't work correctly.
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user?.id) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You must be logged in.')
  }

  return new ObjectId(session.user.id)
}
