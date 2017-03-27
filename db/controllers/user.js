
const ApplicationController = require('./application')
const user = require('../models/user')

class UserController extends ApplicationController {
  constructor(options = {}) {
    super(options)
    this.model = user
  }
}

module.exports = UserController
