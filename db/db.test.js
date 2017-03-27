
const db = require('./db')

describe('Database', () => {
  beforeAll(() => db.connect())
  it('Should be an instance of [Database]', () =>
    expect(db.constructor.name).toEqual('Database')
  )
  it('Should set a [pool] variable', () =>
    expect(db.state).toHaveProperty('pool')
  )
  it('Should set an [env] variable', () =>
    expect(db.state).toHaveProperty('env')
  )
  it('Should freeze the [pool] variable after setting', () =>
    expect(() => db.pool = 'foo').toThrow(TypeError)
  )
  it('Should freeze the [env] variable after setting', () =>
    expect(() => db.env = 'foo').toThrow(TypeError)
  )
})
