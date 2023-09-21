const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)


const initialUserId = new mongoose.Types.ObjectId('6502f462e7ab841c19ddb123')
const initialUsername = 'root'
const initialPassword = 'Gott'

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash(initialPassword, 1)
  const userDetails = {
    username: initialUsername,
    name: 'Param',
    passwordHash,
    _id: initialUserId
  }

  const user = new User(userDetails)
  await user.save()
})

describe('Login tests', () => {
  test('A valid user can successfully login and the correct token is returned', async() => {
    const user = {
      username: initialUsername,
      password: initialPassword
    }

    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.username).toBe(user.username)
  })

  test('A 401 response is returned when the username is invalid', async() => {
    const user = {
      username: 'idontexist',
      password: initialPassword
    }

    const response = await api
      .post('/api/login')
      .send(user)

    expect(response.status).toBe(401)
    expect(response.body.error).toContain('invalid username')
  })

  test('A 401 response is returned when the password is invalid', async() => {
    const user = {
      username: initialUsername,
      password: 'fakePassword'
    }

    const response = await api
      .post('/api/login')
      .send(user)

    expect(response.status).toBe(401)
    expect(response.body.error).toContain('invalid password')
  })
})


afterAll(async() => {
  await mongoose.connection.close()
})