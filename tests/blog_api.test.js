const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

describe('when ther is some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)
    expect(titles).toContain(
      'React patterns'
    )
  })

  test('blogs have an id key', async () => {
    const blogsAtStart = await helper.blogsInDb()
    blogsAtStart.forEach(blog => expect(blog.id).toBeDefined())
  })

  test('a if a blog witout likes gets its likes set to 0', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Yakov Perelman',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd= await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const justAddedBlog = blogsAtEnd[blogsAtEnd.length-1]

    expect(justAddedBlog.likes).toBe(0)
  })
})

describe('viewing a specific blog', () => {
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultblog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(resultblog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('adding a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'async/await simplifies making async calls',
      author: 'Yakov Perelman',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 3
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd= await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(r => r.title)
    expect(titles).toContain(
      'async/await simplifies making async calls'
    )
    const justAddedBlog = blogsAtEnd[blogsAtEnd.length - 1]

    expect(justAddedBlog.title).toBe(newBlog.title)
    expect(justAddedBlog.author).toBe(newBlog.author)
    expect(justAddedBlog.url).toBe(newBlog.url)
    expect(justAddedBlog.likes).toBe(newBlog.likes)
  })
  test('blog without title is not added', async () => {
    const newBlog = {
      important: true
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAtEnd= await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('if adding a blog without title gets 400 bad request as response', async () => {
    const newBlog = {
      author: 'Yakov Perelman',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })

  test('if adding a blog without url gets 400 bad request as response', async () => {
    const newBlog = {
      title: 'Importance of proteins',
      author: 'Yakov Perelman',
      likes: 2
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })
})

describe('deleting a blog', () => {

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(r => r.title)

    expect(titles).not.toContain(blogToDelete.title)
  })
})

describe('update a blog', () => {
  test('updating likes', async () => {
    const blogsAtStart= await helper.blogsInDb()
    const firstBlog = blogsAtStart[0]
    const newDataBlog = { ...firstBlog, likes: firstBlog.likes + 1 }

    await api
      .put(`/api/blogs/${firstBlog.id}`)
      .send(newDataBlog).expect(200)

    const blogsAtEnd= await helper.blogsInDb()
    const firstBlogAfter = blogsAtEnd[0]

    expect(firstBlogAfter.likes).toBe(firstBlog.likes + 1)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})