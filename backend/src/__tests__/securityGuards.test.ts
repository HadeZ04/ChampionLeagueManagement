import request from 'supertest'
import app from '../app'
import { makeToken } from '../test/testAuth'

describe('Security guards', () => {
  const unauthorizedChecks = [
    { method: 'post', path: '/api/teams' },
    { method: 'put', path: '/api/teams/1' },
    { method: 'delete', path: '/api/teams/1' },
    { method: 'post', path: '/api/players' },
    { method: 'put', path: '/api/players/1' },
    { method: 'delete', path: '/api/players/1' },
    { method: 'get', path: '/api/players/registrations' },
    { method: 'post', path: '/api/players/registrations' },
    { method: 'put', path: '/api/players/registrations/1' },
    { method: 'post', path: '/api/players/registrations/1/approve' },
    { method: 'post', path: '/api/players/registrations/1/reject' },
    { method: 'post', path: '/api/matches' },
    { method: 'put', path: '/api/matches/1' },
    { method: 'delete', path: '/api/matches/1' },
    { method: 'post', path: '/api/leaderboard' },
    { method: 'put', path: '/api/leaderboard/1' },
    { method: 'delete', path: '/api/leaderboard/1' }
  ] as const

  it.each(unauthorizedChecks)('requires auth for %s %s', async ({ method, path }) => {
    const client = request(app) as any
    await client[method](path).expect(401)
  })

  it('returns 403 when permission missing', async () => {
    const token = makeToken(['manage_content'])
    await request(app).post('/api/teams').set('Authorization', `Bearer ${token}`).expect(403)
    await request(app).get('/api/players/registrations').set('Authorization', `Bearer ${token}`).expect(403)
    await request(app).get('/api/season-players/pending').set('Authorization', `Bearer ${token}`).expect(403)
    await request(app).post('/api/season-players/1/approve').set('Authorization', `Bearer ${token}`).expect(403)
  })
})
