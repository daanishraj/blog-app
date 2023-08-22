const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((prevLikes, blog) => {
    return prevLikes + blog.likes
  },0)
}

module.exports = {
  dummy,
  totalLikes
}
