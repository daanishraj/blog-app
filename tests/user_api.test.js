const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helpers = require('./helpers/helper')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('Gott', 10)
  const userDetails = {
    username: 'rootuser',
    name: 'Param',
    passwordHash,
  }

  const user = new User(userDetails)
  await user.save()

})

describe(('First tests'), () => {
  test('A new user is successfully created', async () => {
    const usersAtStart = await helpers.getUsersInDB()

    const newUser = {
      username: 'Paramhansa',
      name: 'Mukunda',
      password: 'yoga'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helpers.getUsersInDB()

    const userNames = usersAtEnd.map(user => user.username)

    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
    expect(userNames).toContain(newUser.username)

  })
})

afterAll(async() => {
  await mongoose.connection.close()
})