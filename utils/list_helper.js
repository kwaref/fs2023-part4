// eslint-disable-next-line no-unused-vars
const dummy = blogs => {
  return 1
}

const totalLikes = blogPosts => {
  return blogPosts.reduce((sum, post) => sum + (post.likes || 0), 0)
}

module.exports = {
  dummy,
  totalLikes,
}