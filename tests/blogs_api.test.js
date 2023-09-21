const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)

const initialUserId = new mongoose.Types.ObjectId('6502f462e7ab841c19ddb123')
const initialUsername = 'test'
const initialPassword = 'Gott'

const initialBlogs = [
  {
    id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
    user: initialUserId
  },
  {
    id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    user: initialUserId
  },
  {
    id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
    user: initialUserId
  },
  {
    id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
    user: initialUserId
  },
  {
    id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    user: initialUserId
  },
  {
    id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
    user: initialUserId
  }
]

const saveInitialUser = async () => {

  const passwordHash = await bcrypt.hash(initialPassword, 10)

  const initialUser =
    {
      username: initialUsername,
      name: 'spirit',
      passwordHash,
      _id: initialUserId
    }

  const user = new User(initialUser)
  await user.save()
}

const login = async () => {
  const user = {
    username: initialUsername,
    password: initialPassword,
  }

  const response = await api
    .post('/api/login')
    .send(user)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  return response.body
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
  await User.deleteMany({})
  await saveInitialUser()
})

test('blogs are returned as json', async () => {
  await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('the correct number of blog posts are returned',  async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('the blog post object has a unique identifier which is called id', async() => {
  const response = await api.get('/api/blogs')
  const blogObject = response.body[0]
  expect(blogObject.id).toBeDefined()
  expect(blogObject._id).not.toBeDefined()

})

test('making a POST request successfully creates a new blog post', async () => {

  const loginResponse = await login()

  const newBlog = {
    title: 'Journey to Self Realization',
    author: 'Paramhansa Yogananda',
    url: 'http://www.yogananda.org',
    likes: 108,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${loginResponse.token} `)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(blog => blog.title)

  expect(response.body).toHaveLength(initialBlogs.length + 1)
  expect(titles).toContain(newBlog.title)
})

test('making a POST request without a token fails to create a new blog post', async () => {
  const newBlog = {
    title: 'Journey to Self Realization',
    author: 'Paramhansa Yogananda',
    url: 'http://www.yogananda.org',
    likes: 108,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(blog => blog.title)

  expect(response.body).toHaveLength(initialBlogs.length)
  expect(titles).not.toContain(newBlog.title)
})

test('the likes property assumes the correct default value when missing from request body', async () => {
  const loginResponse = await login()

  const newBlog = {
    title: 'The Holy Science',
    author: 'Sri Yukteswar',
    url: 'http://www.yogananda.org',
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${loginResponse.token}`)
    .send(newBlog)

  expect(response.status).toBe(201)
  expect(response.body.likes).toBe(0)
})

test('when title or url properties are missing from payload, status of response is 400', async () => {
  const loginResponse = await login()

  const newBlog = {
    author: 'Sri Yukteswar',
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${loginResponse.token}`)
    .send(newBlog)

  expect(response.status).toBe(400)
})

test('a single blog can be retrieved with the correct id', async() => {
  const response =  await api.get('/api/blogs/5a422a851b54a676234d17f7')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.title).toBe('React patterns')
})

test('a blog can be deleted with a valid id', async() => {
  const loginResponse = await login()

  const idForRemoval = initialBlogs[0].id

  await api
    .get(`/api/blogs/${idForRemoval}`)
    .expect(200)

  await api
    .delete(`/api/blogs/${idForRemoval}`)
    .set('Authorization', `Bearer ${loginResponse.token}`)
    .expect(204)

  await api
    .get(`/api/blogs/${idForRemoval}`)
    .expect(404)
})

test('a blog can be successfully updated', async () => {
  const originalNote =
    {
      id: '5a422a851b54a676234d17f7',
      title: 'React patterns',
      author: 'Michael Chan',
      url: 'https://reactpatterns.com/',
      likes: 7,
    }


  const originalBlog = await api
    .get(`/api/blogs/${originalNote.id}`)
    .expect(200)

  expect(originalBlog.body.title).toBe(originalNote.title)

  const updatedBody =
  {
    author: originalNote.author,
    url: originalNote.url,
    likes: originalNote.likes,
    title: 'React patterns - revised edition',
  }

  const updatedBlog = await api
    .put(`/api/blogs/${originalNote.id}`)
    .send(updatedBody)
    .expect(200)

  expect(updatedBlog.body.title).toBe(updatedBody.title)
  expect(updatedBlog.body.title).not.toBe(originalBlog.body.title)
})

afterAll(async () => {
  await mongoose.connection.close()
})