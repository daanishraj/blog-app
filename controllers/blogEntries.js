const blogRouter = require('express').Router()
const Blog = require('../models/blog')



blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
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

  const blog = new Blog({ ...request.body })
  blog.likes = request.body.likes || 0

  const result = await blog.save()
  return response.status(201).json(result)
})

module.exports = blogRouter