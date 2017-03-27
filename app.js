
const fs = require('fs')
const path = require('path')
const express = require('express')
const parser = require('body-parser')
const morgan = require('morgan')
const engines = require('consolidate')
const cors = require('./config/cors')

// routes
const api = require('./routes/api')
const webapp = require('./routes/webapp')

// https://github.com/facebookincubator/create-react-app/issues/637
const cwd = fs.realpathSync(process.cwd())
// const port = process.env.PORT || 3000
const port = 5000
const env = process.env.NODE_ENV || 'development'

const app = express()
app.set('port', port)

// register HTML engine and set views
app.set('views', path.join(__dirname, 'build'))
app.engine('html', engines.ejs)
app.set('view engine', 'html')

// logging
morgan.token('protocol', req => {
  if (req.socket._spdyState &&
    req.socket._spdyState.parent &&
    req.socket._spdyState.parent.alpnProtocol) {
    if (req.socket._spdyState.parent.alpnProtocol === 'h2') {
      return 'HTTP/2'
    } else {
      return req.socket._spdyState.parent.alpnProtocol
    }
  } else {
    return `HTTP/${req.httpVersion}`
  }
})

app.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url :protocol" :status :res[content-length] :response-time ms')) // eslint-disable-line max-len
app.use(cors[env])
// setup api
app.use(parser.urlencoded({ extended: true }))
app.use(parser.json())
// assets
app.use(express.static(path.resolve(__dirname, 'build')))
// register routes
app.use('/api', api)
app.use('/', webapp)

module.exports = app
