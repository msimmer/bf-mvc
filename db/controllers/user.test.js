
const User = require('./user')
const db = require('../db')

const rand = () => String(Math.round(Math.random() * 100000))
const email = () => `${rand()}@${rand()}.com`

describe('Application:User', () => {
  let userId
  let user
  beforeAll(() => db.connect(() => {
    user = new User()
    return user
  }))
  afterAll(() => {
    user.findWhere({ name: 'foo' }).then(_ =>
      _.forEach(({ id }) => user.remove({ id }))
    )
  })

  it('Should add a user', () =>
    user.add({ name: 'foo', email: email() }).then((_) => {
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
    user.add({ name: 'foo', email: email() }).then(() =>
      user.findWhere({ name: 'foo' }).then(_ =>
        expect(_.length).toBeGreaterThan(1)
      )
    )
  )

  it('Should get all users', () =>
    user.add({ name: 'foo', email: email() }).then(() =>
      user.findAll().then(_ =>
        expect(_.length).toBeGreaterThan(1)
      )
    )
  )

  it('Should update a user', () =>
    user.update({ id: userId, name: 'bar' }).then(() =>
      user.find({ id: userId }).then(_ =>
        expect(_).toHaveProperty('name', 'bar')
      )
    )
  )

  it('Should remove a user', () =>
    user.remove({ id: userId }).then(() =>
      user.find({ id: userId }).then(_ =>
        expect(_).toBe(null)
      )
    )
  )
})
