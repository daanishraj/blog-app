const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

const getToken = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs)

})

blogRouter.post('/', async (request, response) => {
  const { title, url } = request.body

  if (!title || !title.trim()) {
    return response.status(400).json({ error: 'title is missing' })
  }

  if (!url || !url.trim()) {
    return response.status(400).json({ error: 'url is missing' })
  }

  const token = getToken(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)

  if(!decodedToken.id) {
    response.status(401).json({ error: 'invalid token' })
  }


  let user = await User.findById(decodedToken.id)

  const blog = new Blog({
    title,
    url,
    user: user._id,
    author: request.body.author,
    likes: request.body.likes || 0
  })

  const savedBlog = await blog.save()


  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  return response.status(201).json(savedBlog)
})

blogRouter.get('/:id', async (request, response) => {
  const requiredBlog = await Blog.findById(request.params.id)
  if (requiredBlog) {
    return response.status(200).json(requiredBlog)
  }
  return response.status(404).end()
})

blogRouter.delete('/:id', async(request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  return response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })
  if (updatedBlog) {
    return response.json(updatedBlog)
  }
})

module.exports = blogRouter