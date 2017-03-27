
const Model = require('./model')

class User extends Model {
  constructor() {
    super()
    this.isValidateable()
    this.hasStrongParams()

    /*

      // schema
      this.id = { type: Number, index: true, unique: true }
      this.name = { type: String, 'null': false, limit: 255 }
      this.email = { type: String, 'null': false, unique: true }
      this.password = { type: String }
      this.created_at = { type: Date, default: Date.now }

      // strong params
      this.require('bar')
      this.permit('foo', 'bar', 'qux')

      this.params({ foo: 1, bar: 2 }, (err, params) => {
        console.log(err, params)
      })

      // validateable
      this.validatesPresenceOf('id', 'email')
      this.validate((result) => {
        console.log('result: ', result)
      })

     */

  }
}

const user = new User()
module.exports = user
