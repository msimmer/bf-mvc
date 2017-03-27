
import { get } from 'jquery'
import React, { Component } from 'react'
import logo from '../../assets/images/logo.svg'
import './App.css'

class App extends Component {
  constructor() {
    super()
    this.state = { users: [] }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    e.preventDefault()
    return get('https://localhost:5000/api/users', ({ data }) => {
      this.setState({ users: data })
      return this.state
    })
  }

  render() {
    const { users } = this.state
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <button onClick={this.handleClick}>Get Users</button>
        { users && users.length > 0 &&
          <ul>{ users.map((_, i) => (
              <li key={i}>{_.name}</li>
            ))
        } </ul> }
      </div>
    )
  }
}

export default App
