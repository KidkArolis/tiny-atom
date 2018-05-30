const Preact = require('preact')

module.exports = function createContext (atom) {
  const { get, dispatch } = atom

  // this doesn't do much, it doesn't pass atom via context
  // it's just there to simulate the new React context API
  const Provider = props => props.children[0]

  class Consumer extends Preact.Component {
    constructor ({ map }) {
      super()
      this.state = map ? map(get()) : { state: get() }
    }

    componentDidMount () {
      this.dispose = atom.observe(() => this.update())
    }

    componentWillUnmount () {
      this.dispose && this.dispose()
    }

    update () {
      const { map } = this.props
      const nextMappedProps = map ? map(get()) : { state: get() }
      this.setState(nextMappedProps)
    }

    render ({ actions, children }) {
      const mappedProps = this.state
      const boundActions = bindActions(actions, mappedProps)
      return children[0](Object.assign({}, mappedProps, boundActions))
    }
  }

  function connect (map, actions, options = {}) {
    if (typeof options.pure === 'undefined') {
      options.pure = true
    }

    return function connectComponent (Component) {
      return class Connected extends Preact.Component {
        constructor () {
          super()
          this.state = map ? map(get(), this.props) : { state: get() }
        }

        shouldComponentUpdate (nextProps, nextState) {
          if (!options.pure) {
            return true
          }
          return differ(this.state, nextState)
        }

        componentWillReceiveProps (nextProps) {
          const nextMappedProps = map ? map(get(), nextProps) : { state: get() }
          this.setState(nextMappedProps)
        }

        update () {
          const nextMappedProps = map ? map(get(), this.props) : { state: get() }
          this.setState(nextMappedProps)
        }

        componentDidMount () {
          this.dispose = atom.observe(() => this.update())
        }

        componentWillUnmount () {
          this.dispose && this.dispose()
        }

        render (props) {
          const mappedProps = this.state
          const boundActions = bindActions(actions, mappedProps)
          return <Component {...props} {...mappedProps} {...boundActions} />
        }
      }
    }
  }

  function bindActions (actions, mappedProps) {
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

  function differ (mappedProps, nextMappedProps) {
    for (let i in mappedProps) {
      if (mappedProps[i] !== nextMappedProps[i]) {
        return true
      }
    }
    for (let i in mappedProps) {
      if (!(i in nextMappedProps)) {
        return true
      }
    }
    return false
  }

  return { Provider, Consumer, connect }
}
