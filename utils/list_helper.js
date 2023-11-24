// eslint-disable-next-line no-unused-vars
const dummy = blogs => {
  return 1
}

const totalLikes = blogPosts => {
  return blogPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
}

const favoriteBlog = blogPosts => {
  if (blogPosts.length === 0) {
    return
  }
  return blogPosts.reduce((favorite, post) => post.likes > favorite.likes ? post : favorite, blogPosts[0])
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
}