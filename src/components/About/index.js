import React, { Component } from 'react'
import classnames from 'classnames'

import './style.css'

class About extends Component {
  static propTypes = {}
  static defaultProps = {}
  state = {}

  render() {
    const { className } = this.props
    return (
      <div className={classnames('About', className)}>
        <h1>
          About
        </h1>
      </div>
    )
  }
}

export default About
