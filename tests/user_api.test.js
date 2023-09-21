const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helpers = require('./helpers/helper')

const api = supertest(app)

const initialUserId = new mongoose.Types.ObjectId('6502f462e7ab841c19ddb123')

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('Gott', 1)
  const userDetails = {
    username: 'root',
    name: 'Param',
    passwordHash,
    blogs: [],
    _id: initialUserId
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
      password: 'yoga',
      blogs:[]
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

  test('username must be atleast 3 characters long', async () => {
    const usersAtStart = await helpers.getUsersInDB()

    const newUser = {
      username: 'T',
      name: 'shorty',
      password: 'yoga'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username`')
    expect(result.body.error).toContain('shorter than the minimum allowed length')

    const usersAtEnd = await helpers.getUsersInDB()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('the username must be unique', async () => {
    const usersAtStart = await helpers.getUsersInDB()

    const newUser = {
      username: 'root',
      name: 'copy',
      password: 'yoga'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helpers.getUsersInDB()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('password should be atleast 3 characters long', async () => {
    const usersAtStart = await helpers.getUsersInDB()

    const newUser = {
      username: 'Test',
      name: 'shortPassword',
      password: 'hy'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password must be at least 3 characters long')

    const usersAtEnd = await helpers.getUsersInDB()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})

afterAll(async() => {
  await mongoose.connection.close()
})