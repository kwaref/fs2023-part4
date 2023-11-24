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

const mostBlogs = blogPosts => {
  if (blogPosts.length === 0) {
    return
  }
  const authorCounts = blogPosts.reduce((counts, post) => {
    const author = post.author || 'anonymous'
    counts[author] = (counts[author] || 0) + 1
    return counts
  }, {})

  const result = Object.entries(authorCounts).reduce((max, [author, count]) => {
    if (count > max.blogs) {
      return { author, blogs: count }
    } else {
      return max
    }
  }, { author: 'anonymous', blogs: 0 })

  return result
}

const mostLikes = blogPosts => {
  if (blogPosts.length === 0) {
    return
  }
  const authorLikes = blogPosts.reduce((likes, post) => {
    const author = post.author || 'anonymous'
    const postLikes = post.likes !== undefined ? post.likes : 0
    likes[author] = (likes[author] || 0) + postLikes
    return likes
  }, {})

  const result = Object.entries(authorLikes).reduce((max, [author, totalLikes]) => {
    if (totalLikes > max.likes) {
      return { author, likes: totalLikes }
    } else {
      return max
    }
  }, { author: 'anonymous', likes: 0 })

  return result
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
}