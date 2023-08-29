const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
// const helper = require('../utils/list_helper')
const api = supertest(app)

const initialBlogs = [
  {
    id: '5a422a851b54a676234d17f7',
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    id: '5a422aa71b54a676234d17f8',
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    id: '5a422b3a1b54a676234d17f9',
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    id: '5a422b891b54a676234d17fa',
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
  {
    id: '5a422bc61b54a676234d17fc',
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)

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
  const newBlog = {
    title: 'Journey to Self Realization',
    author: 'Paramhansa Yogananda',
    url: 'http://www.yogananda.org',
    likes: 108,
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')

  const titles = response.body.map(blog => blog.title)

  expect(response.body).toHaveLength(initialBlogs.length + 1)
  expect(titles).toContain(newBlog.title)
})

test('the likes property assumes the correct default value when missing from request body', async () => {
  const newBlog = {
    title: 'The Holy Science',
    author: 'Sri Yukteswar',
    url: 'http://www.yogananda.org',
  }

  const response = await api
    .post('/api/blogs')
    .send(newBlog)

  expect(response.status).toBe(201)
  expect(response.body.likes).toBe(0)
})

test('when title or url properties are missing from payload, status of response is 400', async () => {
  const newBlog = {
    author: 'Sri Yukteswar',
  }

  const response = await api
    .post('/api/blogs')
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
  const idForRemoval = '5a422a851b54a676234d17f7'

  await api
    .get(`/api/blogs/${idForRemoval}`)
    .expect(200)

  await api
    .delete(`/api/blogs/${idForRemoval}`)
    .expect(204)

  await api
    .get(`/api/blogs/${idForRemoval}`)
    .expect(404)
})

afterAll(async () => {
  await mongoose.connection.close()
})