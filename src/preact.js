const Preact = require('preact')
const raf = require('./raf')

module.exports = function createContext (atom) {
  const { get, dispatch } = atom

  function createConnectedComponent () {
    return class ConnectedComponent extends Preact.Component {
      constructor (props) {
        super()
        this.setup(props)
        this.dirty = false
        this.state = this.map(get(), props)
        this.scheduleUpdate = this.options.sync
          ? () => this.update()
          : raf(() => this.update(), { initial: false })
      }

      componentDidUpdate () {
        this.dirty = false
      }

      map (state, props) {
        return this.options.map ? this.options.map(state, props) : { state }
      }

      update () {
        if (this.dirty) {
          const nextMappedProps = this.map(get(), this.props)
          this.setState(nextMappedProps)
        }
      }

      componentDidMount () {
        this.unobserve = atom.observe(() => {
          this.dirty = true
          this.scheduleUpdate()
        })
      }

      componentWillUnmount () {
        this.unobserve && this.unobserve()
      }

      render () {}
    }
  }

  const BaseConnectedComponent = createConnectedComponent('consumer')

  class Consumer extends BaseConnectedComponent {
    setup (props) {
      this.options = { map: props.map, sync: props.sync }
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

    const BaseConnectedComponent = createConnectedComponent('connect', map, options)

    return function connectComponent (Component) {
      return class ConnectedComponent extends BaseConnectedComponent {
        setup () {
          this.options = Object.assign({}, options, { map })
        }

        shouldComponentUpdate (nextProps, nextState) {
          if (!this.options.pure) return true
          return differ(this.state, nextState)
        }

        componentWillReceiveProps (nextProps) {
          const nextMappedProps = this.map(get(), nextProps)
          this.setState(nextMappedProps)
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
    if (!actions) return { dispatch }
    if (typeof actions === 'function') return actions(dispatch, mappedProps)
    return actions.reduce((acc, action) => {
      acc[action] = payload => dispatch(action, payload)
      return acc
    }, {})
  }

  function differ (mappedProps, nextMappedProps) {
    for (let i in mappedProps) {
      if (mappedProps[i] !== nextMappedProps[i]) return true
    }
    for (let i in mappedProps) {
      if (!(i in nextMappedProps)) return true
    }
  }

  return { Consumer, connect }
}
