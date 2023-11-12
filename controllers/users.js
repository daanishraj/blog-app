const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')


userRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
  return response.json(users)
})

userRouter.post('/', async(request, response) => {
  const { username, name, password } = request.body
  if (password.length < 3) {
    return response.status(400).json({ error: 'password must be at least 3 characters long' })
  }
  const saltRounds = 1
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const user = new User({ username, name, passwordHash })
  const savedUser = await user.save()
  return response.status(201).json(savedUser)
})

userRouter.delete('/:id', async(request, response) => {
  const user = await User.findById(request.params.id)
  if (! user) {
    return response.status(404).json({ error: 'user could note be found' })
  }
  const blogsToDelete = user.blogs.map(blogId => blogId.toString())
  await Blog.deleteMany({ _id: { $in: blogsToDelete } })
  await User.findByIdAndRemove(request.params.id)
  return response.status(204).end()
})

module.exports = userRouter
