
import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { App, About, NotFound } from '../components'

const Routes = () =>
  <div>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/about" component={About} />
      <Route path="*" component={NotFound} />
    </Switch>
  </div>

export default Routes
