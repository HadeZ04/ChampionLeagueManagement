import request from 'supertest'
import app from '../app'
import { makeToken } from '../test/testAuth'

describe('Settings routes', () => {
  it('rejects unauthenticated access', async () => {
    await request(app).get('/api/settings').expect(401)
  })

  it('rejects users without manage_users', async () => {
    const token = makeToken(['manage_content'])
    await request(app).get('/api/settings').set('Authorization', `Bearer ${token}`).expect(403)
  })

  it('validates payload and allows updates with manage_users', async () => {
    const token = makeToken(['manage_users'])

    const getRes = await request(app)
      .get('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(getRes.body?.data).toBeTruthy()

    await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ invalid: true })
      .expect(400)

    const putRes = await request(app)
      .put('/api/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        general: {
          siteName: 'WEBFOOTBALL',
          siteDescription: 'Test settings',
          timezone: 'UTC',
          language: 'vi',
          maintenanceMode: false
        },
        security: {
          sessionTimeout: 60,
          passwordMinLength: 8,
          requireTwoFactor: false,
          allowedLoginAttempts: 5,
          lockoutDuration: 15
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: false,
          smsNotifications: false,
          adminAlerts: true
        },
        api: {
          rateLimit: 100,
          rateLimitWindow: 15,
          enableCors: true,
          corsOrigins: 'http://localhost:5173',
          apiVersion: 'v1'
        }
      })
      .expect(200)

    expect(putRes.body?.data?.general?.siteName).toBe('WEBFOOTBALL')
  })
})

