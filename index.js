require('dotenv').config()
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const Blog = require('./models/blog')

const app = express()
app.use(cors())

morgan.token('postReceivedData', req => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

const errorHandler = (error, _, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (_, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(express.static('dist'))
app.use(express.json())
app.use(
  morgan('tiny', {
    skip: req => req.method === 'POST',
  })
)
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :postReceivedData',
    {
      skip: req => req.method !== 'POST',
    }
  )
)

app.get('/', (_, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (_, response) => {
  Blog.find({}).then(blogs => {
    response.send(`<p>There is info for ${blogs.length} blogs</p><p>${new Date().toString()}</p>`)
  })
})

app.get('/api/blogs', (_, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs)
  })
})

app.get('/api/blogs/:id', (request, response, next) => {
  Blog.findById(request.params.id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/blogs/:id', (request, response, next) => {
  Blog.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/blogs/:id', (request, response, next) => {
  const { title, author, url } = request.body

  Blog.findByIdAndUpdate(request.params.id,
    { title, author, url },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedBlog => {
      response.json(updatedBlog)
    })
    .catch(error => next(error))
})

app.post('/api/blogs', (request, response, next) => {
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

  blog.save().then(savedBlog => {
    response.json(savedBlog)
  })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
