const _ = require('lodash')

const dummy = (blogs) => {
  console.log(blogs)
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((prevLikes, blog) => {
    return prevLikes + blog.likes
  },0)
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return { author: '', blogs: 0 }
  }

  const authorMap = new Map()
  blogs.forEach((blog) => {
    if (authorMap.has(blog.author)) {
      authorMap.set(blog.author, authorMap.get(blog.author) + 1)
    } else {
      authorMap.set(blog.author, 1)
    }
  })

  const authorList = Array.from(authorMap.entries())
  const initialValue = { author: authorList[0][0], blogs: authorList[0][1] }


  return authorList.reduce((mostPopular, currAuthor) => {
    if (currAuthor[1] > mostPopular.blogs) {
      mostPopular.author = currAuthor[0]
      mostPopular.blogs = currAuthor[1]
    }
    return mostPopular

  }, initialValue)

}

const mostLikes = (blogs) => {
  if (!blogs || blogs.length === 0) {
    return null
  }

  const blogWithHighestLikes = _.maxBy(blogs, 'likes')
  return _.pick(blogWithHighestLikes, ['author', 'likes'])

}

module.exports = {
  dummy,
  totalLikes,
  mostBlogs,
  mostLikes
}
