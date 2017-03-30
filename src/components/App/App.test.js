import React from 'react'
import ReactDOM from 'react-dom'
import { App, About, NotFound } from '../'

describe('React:App', () => {
  it('Renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render( <App /> , div)
    ReactDOM.render( <About /> , div)
    ReactDOM.render( <NotFound /> , div)
  })
})
