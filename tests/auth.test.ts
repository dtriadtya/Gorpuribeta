import request from 'supertest'

// NOTE: This test uses an external running server. Start the app with `npm run dev` on port 3000
// or change the baseUrl to your running server's address.
const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000'

const runIntegration = !!process.env.TEST_BASE_URL

const maybeDescribe = runIntegration ? describe : describe.skip

maybeDescribe('Auth API (examples) - integration (requires running server)', () => {
  test('POST /api/auth/register - should return 400 for invalid payload', async () => {
    const res = await request(baseUrl).post('/api/auth/register').send({ name: '', email: 'bad', password: '123' })
    expect([400, 409]).toContain(res.status)
  }, 10000)

  test('POST /api/auth/login - wrong credentials should return 401', async () => {
    const res = await request(baseUrl).post('/api/auth/login').send({ email: 'notfound@example.com', password: 'nope' })
    expect(res.status).toBe(401)
  }, 10000)
})
