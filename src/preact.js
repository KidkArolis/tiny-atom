const Preact = require('preact')

class ProvideAtom extends Preact.Component {
  getChildContext () {
    return { atom: this.props.atom }
  }
  render () {
    return this.props.children[0]
  }
}

function ConnectAtom ({ map, actions, children }, { atom }) {
  const mappedProps = map ? map(atom.get(), atom.dispatch) : { state: atom.get(), dispatch: atom.dispatch }
  const mappedActions = mapActions(actions, atom.dispatch, mappedProps)
  return children[0](Object.assign({}, mappedProps, mappedActions))
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

function mapActions (actions, dispatch, mappedProps) {
  if (!actions) {
    return { dispatch }
  }
  if (typeof actions === 'function') {
    return actions(dispatch, mappedProps)
  }
  return actions.reduce((acc, action) => {
    acc[action] = payload => dispatch(action, payload)
    return acc
  }, {})
}

module.exports = { ProvideAtom, ConnectAtom, connect }
