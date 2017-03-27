
import React from 'react'
import { render } from 'react-dom'
import createBrowserHistory from 'history/createBrowserHistory'
import { BrowserRouter as Router } from 'react-router-dom'
import Routes from './routes'

const history = createBrowserHistory()

render((
  <Router history={history}>
    <Routes />
  </Router>
), document.getElementById('root'))
