
const _ = require('lodash')
const pluralize = require('pluralize')
const connection = require('../db')

class ApplicationController {
  get name() {
    return this.constructor.name.toLowerCase()
  }

  constructor(options = {}) {
    this.connection = connection.state.pool
  }

  end() {
    this.connection.end()
    return console.log('Connection closed')
  }

  query(statement, data, done) {
    this.connection.query(statement, data, (err, results, fields) => {
      if (err) {
        console.error(err) // should write to log
        return done(err)
      }
      return done(results, fields)
    })
  }

  // this necessary? validation now happens in model ...
  validateData(data) {
    if (!_.isPlainObject(data)) {
      throw new TypeError(`Parameter [data] must be Object, provided ${typeof data}`)
    }
    return true
  }

  validateId(_id) {
    const id = parseInt(_id, 10)
    if (typeof id !== 'number' || (typeof id === 'number' && id < 1)) {
      console.error('No [id] specified, aborting')
      process.exit(1)
    }
    return true
  }

  // data must be object:
  // var post  = {id: 1, title: 'Hello MySQL'};
  // var query = connection.query('INSERT INTO posts SET ?', post, (error, results, fields) => {
  // user.add({ name: 'foo' }).then(_ => console.log(_))
  add(data) {
    this.validateData(data)
    const model = pluralize(this.model.constructor.name).toLowerCase()
    return new Promise((resolve, reject) => {
      this.query(`INSERT INTO ${model} SET ?`, data, (err, results, fields) => {
        if (err) { return resolve(err) }
        console.log(`Added new model [${model}] with id [${results.insertId}]`)
        return resolve(results)
      })
    })
  }

  // get one model where key = val
  // user.find({ name: 'foo' }).then(_ => console.log(_))
  find(data) {
    this.validateData(data)
    const model = pluralize(this.model.constructor.name).toLowerCase()
    return new Promise((resolve, reject) =>
      this.query(`SELECT * FROM ${model} WHERE ? LIMIT 1`, data, (results, fields) => {
        const resp = results && results[0] ? results[0] : null
        return resolve(resp)
      })
    )
  }

  // get all models where key = val
  // user.findWhere({ name: 'foo' }).then(_ => console.log(_))
  findWhere(data) {
    this.validateData(data)
    const model = pluralize(this.model.constructor.name).toLowerCase()
    return new Promise((resolve, reject) =>
      this.query(`SELECT * FROM ${model} WHERE ?`, data, (results, fields) => {
        return resolve(results)
      })
    )
  }

  // get all models
  // user.findAll({ name: 'foo' }).then(_ => console.log(_))
  findAll(data) {
    // this.validateData(data)
    const model = pluralize(this.model.constructor.name).toLowerCase()
    return new Promise((resolve, reject) =>
      this.query(`SELECT * FROM ${model}`, data, (results, fields) => {
        return resolve(results)
      })
    )
  }

  // update model with data, must include `id` in `data`
  // UPDATE [table] SET [column] = '[updated-value]' WHERE [column] = [value];
  // user.update({ id: 1, name: 'bar' }).then(_ => console.log(_))
  update(data) {
    this.validateData(data)
    this.validateId(data.id)

    delete data.id // don't update id
    const model = pluralize(this.model.constructor.name).toLowerCase()
    return new Promise((resolve, reject) =>
      this.query(`UPDATE ${model} SET ? WHERE id = ${id}`, data, (results, fields) => {
        return resolve(results)
      })
    )
  }

   // remove model
   // user.remove({ id: 1 }).then(_ => console.log(_))
  remove(data) {
    const { id } = data
    this.validateId(id)
    const model = pluralize(this.model.constructor.name).toLowerCase() // table name
    return new Promise((resolve, reject) =>
      this.query(`DELETE FROM ${model} WHERE id = ${id}`, null, (results, fields) => {
        return resolve(results)
      })
    )
  }

  permit(params) {
    console.log(this)
  }
  require(params) {}
}

module.exports = ApplicationController
