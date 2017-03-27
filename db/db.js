const fs = require('fs')
const path = require('path')
const mysql = require('mysql')
const config = require('../config/db')

class Database {
  get pool() {
    return this._state.pool
  }
  get env() {
    return this._state.env
  }

  set pool(val) {
    this._state.pool = val
  }
  set env(val) {
    this._state.env = val
  }

  get state() {
    return this._state
  }
  set state(val) {
    return this._state = val
  }

  onAquire(connection) {
    return console.log('Acquires thread: %d', connection.threadId)
  }
  onConnection(connection) {
    return console.log('Connects to thread: %d', connection.threadId)
  }
  onEnqueue() {
    return console.log('Awaiting connection slot ...')
  }
  onRelease(connection) {
    return console.log('Connection released: %d', connection.threadId)
  }

  bindPoolEvents() {
    this.pool.on('acquire', _ => this.onAquire(_))
    this.pool.on('connection', _ => this.onConnection(_))
    this.pool.on('enqueue', _ => this.onEnqueue(_))
    this.pool.on('release', _ => this.onRelease(_))
  }

  connect(done) {
    const env = process.env.NODE_ENV || 'development'
    this.defaults = config[env]
    this.settings = Object.assign({}, this.defaults)
    this.state = {}
    this.env = env
    this.pool = mysql.createPool(this.settings)

    Object.freeze(this._state) // freeze alias
    this.bindPoolEvents()

    done(this.pool)
  }
}

const db = new Database()
module.exports = db
