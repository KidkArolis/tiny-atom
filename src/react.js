const React = require('react')

function Any () {
  return null
}

class ProvideAtom extends React.Component {
  getChildContext () {
    return { atom: this.props.atom }
  }
  render () {
    return React.Children.only(this.props.children)
  }
}

ProvideAtom.childContextTypes = { atom: Any }

function ConnectAtom (props, { atom }) {
  const { map } = props
  const render = props.render || props.children
  const data = map ? map(atom.get(), atom.split) : { state: atom.get(), split: atom.split }
  return render(data)
}

ConnectAtom.contextTypes = { atom: Any }

function connect (map) {
  return function connectComponent (Component) {
    return function Connected (props) {
      return React.createElement(ConnectAtom, {
        map: map,
        render: function (mappedProps) {
          return React.createElement(Component, Object.assign({}, props, mappedProps))
        }
      })
    }
  }
}

module.exports.ProvideAtom = ProvideAtom
module.exports.ConnectAtom = ConnectAtom
module.exports.connect = connect
