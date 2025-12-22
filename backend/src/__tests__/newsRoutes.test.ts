import request from 'supertest'
import app from '../app'
import { makeToken } from '../test/testAuth'

describe('News routes', () => {
  it('rejects unauthenticated access', async () => {
    await request(app).get('/api/news').expect(401)
  })

  it('rejects users without manage_content', async () => {
    const token = makeToken(['manage_users'])
    await request(app).get('/api/news').set('Authorization', `Bearer ${token}`).expect(403)
  })

  it('supports CRUD with manage_content', async () => {
    const token = makeToken(['manage_content'])

    const createRes = await request(app)
      .post('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Article',
        summary: 'This is a test article summary for integration tests.',
        category: 'tests',
        status: 'draft',
        author: 'QA'
      })
      .expect(201)

    const id = createRes.body?.data?.id
    expect(typeof id).toBe('string')

    const listRes = await request(app)
      .get('/api/news')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(listRes.body?.data)).toBe(true)
    expect(listRes.body.data.some((row: any) => row.id === id)).toBe(true)

    const updateRes = await request(app)
      .put(`/api/news/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'published' })
      .expect(200)

    expect(updateRes.body?.data?.status).toBe('published')

    await request(app)
      .delete(`/api/news/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
  })
})

