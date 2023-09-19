const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')

const api = supertest(app)


//TODO: fix breaking tests

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('Gott', 1)
  const userDetails = {
    username: 'root',
    name: 'Param',
    passwordHash,
  }

  const user = new User(userDetails)
  await user.save()
}, 15000)

describe('Login tests', () => {
  test('A valid user can successfully login and the correct token is returned', async() => {
    const user = {
      username: 'root',
      password: 'Gott'
    }

    const result = await api
      .post('/api/login')
      .send(user)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    console.log({ result })
    expect(result.body.username).toBe(user.username)
    //verify that the token is correct
    // also check if correct response is returned in case of invalid user
  })
})

afterAll(async() => {
  await mongoose.connection.close()
}, 100000)