const React = require('react')
const raf = require('./raf')

module.exports = function createAtomContext (atom) {
  const Context = React.createContext()

  const Consumer = ({ map, children }) => (
    React.createElement(Context.Consumer, {}, ({ state, dispatch }) => (
      children(map ? map(state, dispatch) : { state, dispatch })
    ))
  )

  const connect = map => Component => props => (
    React.createElement(Consumer, { map }, (mappedProps) => (
      React.createElement(Component, Object.assign({}, props, mappedProps))
    ))
  )

  class Provider extends React.Component {
    componentDidMount () {
      if (!this.props.atom) {
        const update = raf(() => this.unobserve && this.forceUpdate())
        this.unobserve = atom.observe(update)
      }
    }

    componentWillUnmount () {
      this.unobserve && this.unobserve()
      delete this.unobserve
    }

    render () {
      const currAtom = this.props.atom || atom
      const value = Object.assign({
        state: currAtom.get(),
        dispatch: currAtom.dispatch
      }, this.props.value)
      return (
        React.createElement(Context.Provider, { value }, this.props.children)
      )
    }
  }

  return {
    Provider,
    Consumer,
    connect
  }
}
