const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs)

})

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { title, url } = request.body

  if (!title || !title.trim()) {
    return response.status(400).json({ error: 'title is missing' })
  }

  if (!url || !url.trim()) {
    return response.status(400).json({ error: 'url is missing' })
  }

  let user = request.user

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

blogRouter.delete('/:id', middleware.userExtractor, async(request, response) => {
  const blogForDeletion = await Blog.findById(request.params.id)
  const userWhoCreatedBlog = blogForDeletion.user
  const loggedInUser = request.user

  if (userWhoCreatedBlog.toString() === loggedInUser._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    return response.status(204).end()
  }
  return response.status(401).json({ error: 'unauthorized user' })
})

blogRouter.put('/:id', async (request, response) => {
  const { title, url, author, likes, userId } = request.body
  const payloadForUpdate = {
    title,
    url,
    author,
    likes,
    user: userId
  }
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, payloadForUpdate, { new: true })
  if (!updatedBlog) {
    return response.status(404).json({ error: 'invalid id' })
  }
  return response.json(updatedBlog)
})

module.exports = blogRouter