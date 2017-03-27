
const User = require('./user')
const db = require('../db')

const user = new User()

describe('Application:User', () => {
  let userId
  beforeAll(() => db.connect())
  afterAll(() => {
    user.find({ name: 'foo' }).then(_ =>
      user.remove({ id: _.id })
    )
  })

  it('Should add a user', () =>
    user.add({ name: 'foo' }).then((_) => {
      expect(_.insertId).toBeGreaterThan(0)
      userId = _.insertId
      return userId
    })
  )

  it('Should get one user', () =>
    user.find({ id: userId }).then(_ =>
      expect(_).toHaveProperty('id', userId)
    )
  )

  it('Should get some users', () =>
    user.add({ name: 'foo' }).then(() =>
      user.findWhere({ name: 'foo' }).then(_ =>
        expect(_.length).toBeGreaterThan(1)
      )
    )
  )

  it('Should get all users', () =>
    user.add({ name: 'foo' }).then(() =>
      user.findAll().then(_ =>
        expect(_.length).toBeGreaterThan(1)
      )
    )
  )

  it('Should update a user', () =>
    user.update({ id: userId, name: 'bar' }).then(_ =>
      user.find({ id: userId }).then(_ =>
        expect(_).toHaveProperty('name', 'bar')
      )
    )
  )

  it('Should remove a user', () =>
    user.remove({ id: userId }).then(_ =>
      user.find({ id: userId }).then(_ =>
        expect(_).toBe(null)
      )
    )
  )
})
