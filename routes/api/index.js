
const express = require('express')
const router = express.Router()
const User = require('../../db/controllers/user')

// GET
router.get('/', (req, res) =>
  res.status(200).json({ message: 'ok' })
)

router.get('/users', (req, res) => {
  const user = new User()
  user.findAll().then(data =>
    res.status(200).json({ data })
  )
})

router.get('/users/:id', (req, res) => {
  const user = new User()
  const { id } = req.params
  return user.findWhere({ id }).then(data =>
    res.status(200).json({ data })
  )
})

// POST
router.post('/users', (req, res) => {
  const user = new User()
  return user.add(req.query).then(data =>
    res.status(200).json({ data })
  )
})


// UPDATE
router.patch('/users/:id', (req, res) => {
  const user = new User()
  const { id } = req.params
  const { query } = req
  const q = Object.assign({}, { id }, query)
  return user.update(q).then(data =>
    res.status(200).json({ data })
  )
})

// DELETE
router.delete('/users/:id', (req, res) => {
  const user = new User()
  const { id } = req.params
  return user.remove({ id }).then(data =>
    res.status(200).json({ data })
  )
})


module.exports = router
