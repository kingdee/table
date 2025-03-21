import React, { PureComponent } from 'react'

import {
  GlobalStyle
} from './styles'

interface GlobalStyleComponentProps {
  direction: string;
}

export default class GlobalStyleComponent extends PureComponent<GlobalStyleComponentProps> {
  render () {
    return <GlobalStyle direction={this.props.direction}/>
  }
}
