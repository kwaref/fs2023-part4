const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')

blogsRouter.get('/info', async (_, response) => {
  const blogs = await Blog.find({})
  response.send(`<p>There is info for ${blogs.length} blogs</p><p>${new Date().toString()}</p>`)
})

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog?.user?.toString() !== request.user._id.toString()) {
    return response.status(401).json({ error: 'unauthorized' })
  }
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes, comments } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id,
    { title, author, url, likes, comments },
    { new: true, runValidators: true, context: 'query' }
  ).populate('user')
  response.json(updatedBlog)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const { title, author, url, likes } = body

  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }

  const user = request.user

  if (!title) {
    return response.status(400).json({
      error: 'title is missing',
    })
  }
  if (!url) {
    return response.status(400).json({
      error: 'url is missing',
    })
  }

  const blog = new Blog({
    title,
    author,
    url,
    likes: likes ?? 0,
    user: user._id,
    comments: []
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})

module.exports = blogsRouter