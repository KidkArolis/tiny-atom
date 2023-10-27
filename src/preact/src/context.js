import { Component } from 'preact'

export class Provider extends Component {
  getChildContext() {
    return {
      atom: this.props.atom,
    }
  }

  render() {
    return this.props.children[0]
  }
}
