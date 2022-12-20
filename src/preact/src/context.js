import Preact from 'preact'

export class Provider extends Preact.Component {
  getChildContext() {
    return {
      atom: this.props.atom,
    }
  }

  render() {
    return this.props.children[0]
  }
}
