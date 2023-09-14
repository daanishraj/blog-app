const User = require('../../models/user')

const getUsersInDB = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  getUsersInDB
}