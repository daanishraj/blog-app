const blogRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')


const getInvalidTokenResponse = (response) => {
  response.status(401).json({ error: 'invalid token' })
}

const getInvalidAuthorizationHeaderResponse =  (response) => {
  response.status(401).json({
    error: 'invalid authorization header'
  })
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

  if (!request.token) {
    return getInvalidAuthorizationHeaderResponse(response)
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if(!decodedToken.id) {
    return getInvalidTokenResponse(response)
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
  const blogForDeletion = await Blog.findById(request.params.id)

  if (!request.token) {
    return getInvalidAuthorizationHeaderResponse(response)
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if(!decodedToken.id) {
    return getInvalidTokenResponse(response)
  }

  const userWhoCreatedBlog = blogForDeletion.user
  const loggedInUserid = decodedToken.id

  if (userWhoCreatedBlog.toString()=== loggedInUserid) {
    await Blog.findByIdAndRemove(request.params.id)
    return response.status(204).end()
  }
  return response.status(401).json({ error: 'unauthorized user' })
})

blogRouter.put('/:id', async (request, response) => {
  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, request.body, { new: true })
  if (updatedBlog) {
    return response.json(updatedBlog)
  }
})

module.exports = blogRouter