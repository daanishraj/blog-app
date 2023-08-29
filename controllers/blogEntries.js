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