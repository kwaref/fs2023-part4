const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/info', async (_, response) => {
  const blogs = await Blog.find({})
  response.send(`<p>There is info for ${blogs.length} blogs</p><p>${new Date().toString()}</p>`)
})

blogsRouter.get('/', async (_, response) => {
  const blogs = await Blog.find({})
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
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url } = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id,
    { title, author, url },
    { new: true, runValidators: true, context: 'query' }
  )
  response.json(updatedBlog)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const { title, author, url } = body
  if (!title) {
    return response.status(400).json({
      error: 'title is missing',
    })
  }
  if (!author) {
    return response.status(400).json({
      error: 'author is missing',
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
  })

  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

module.exports = blogsRouter