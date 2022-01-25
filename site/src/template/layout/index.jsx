import React, { Component } from 'react'
import Header from './header'

if (typeof window !== 'undefined') {
  require('@src/static/style')
}
class Layout extends Component {
  render() {
    const { children } = this.props
    return (
      <>
        <Header />
        {children}
      </>
    )
  }
}

export default Layout
