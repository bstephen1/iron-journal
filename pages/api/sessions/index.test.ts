import { StatusCodes } from 'http-status-codes'
import SessionLog from 'models/SessionLog'
import { testApiHandler } from 'next-test-api-route-handler'
import sessions from 'pages/api/sessions/index.api'

var mockFetchSessions: jest.Mock
jest.mock('lib/backend/mongoService', () => ({
  fetchSessions: (mockFetchSessions = jest.fn()),
}))

it('fetches sessions', async () => {
  const data = [new SessionLog('2000-01-01')]
  mockFetchSessions.mockReturnValue(data)

  await testApiHandler<SessionLog[]>({
    handler: sessions,
    test: async ({ fetch }) => {
      const res = await fetch({ method: 'GET' })
      expect(res.status).toBe(StatusCodes.OK)
      expect(res.json()).resolves.toEqual(data)
    },
  })
})

it('blocks invalid method types', async () => {
  await testApiHandler({
    handler: sessions,
    test: async ({ fetch }) => {
      const res = await fetch({ method: 'PUT' })
      expect(res.status).toBe(StatusCodes.METHOD_NOT_ALLOWED)
      expect(res.json()).resolves.toMatch(/not allowed/i)
    },
  })
})
