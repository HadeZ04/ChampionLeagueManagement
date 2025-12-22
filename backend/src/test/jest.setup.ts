import fs from 'fs/promises'
import path from 'path'

const tmpRoot = path.join(process.cwd(), '.tmp-test-data')
const uniqueDataDir = path.join(tmpRoot, `${Date.now()}-${Math.round(Math.random() * 1e9)}`)

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
process.env.DATA_DIR = uniqueDataDir

beforeAll(async () => {
  await fs.mkdir(uniqueDataDir, { recursive: true })
})

afterAll(async () => {
  await fs.rm(uniqueDataDir, { recursive: true, force: true })
})

