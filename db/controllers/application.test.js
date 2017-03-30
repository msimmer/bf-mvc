
const db = require('../db')
const Application = require('./application')

describe('Application', () => {
  let app
  beforeAll(() => db.connect(() => {
    app = new Application()
    return app
  }))
  it('Should connect to the database', () =>
    expect(app.connection.query).toBeDefined()
  )
  it('Should validate queries', () => {
    expect(() => app.add(1)).toThrow(TypeError)
  })
})
