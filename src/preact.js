const Preact = require('preact')

class ProvideAtom extends Preact.Component {
  getChildContext () {
    return { atom: this.props.atom }
  }
  render () {
    return this.props.children[0]
  }
}

function ConnectAtom ({ map, render, children }, { atom }) {
  render = render || children[0]
  const data = map ? map(atom.get(), atom.dispatch) : { state: atom.get(), dispatch: atom.dispatch }
  return render(data)
}

function connect (map) {
  return function connectComponent (Component) {
    return function Connected (props) {
      return (
        <ConnectAtom map={map}>
          { mappedProps => <Component {...props} {...mappedProps} /> }
        </ConnectAtom>
      )
    }
  }
}

module.exports.ProvideAtom = ProvideAtom
module.exports.ConnectAtom = ConnectAtom
module.exports.connect = connect
