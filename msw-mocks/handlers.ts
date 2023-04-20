import dayjs from 'dayjs'
import { StatusCodes } from 'http-status-codes'
import { rest } from 'msw'
import { Session } from 'next-auth'

export const mockSession: Session = {
  user: { id: process.env.NEXT_PUBLIC_DUMMY_SESSION_ID as string },
  expires: dayjs().add(30, 'day').toJSON(),
}

/** This provides default mock responses to endpoints.
 *  Generally in tests the test should define the data it is expecting,
 *  but the defaults here can be useful to mock out valid responses to
 *  endpoints the test doesn't care about.
 */
export const handlers = [
  rest.get('/api/auth/session', (_, res, ctx) => {
    console.log('mocking /api/auth/session')
    res(ctx.status(StatusCodes.OK), ctx.json(mockSession))
  }),
  // Handler matching is done by order of definition. This handler will
  // match any api endpoint, so it should be defined last and act as a default res.
  rest.all('/api/*', (_, res, ctx) =>
    res(ctx.status(StatusCodes.OK), ctx.json({}))
  ),
]
