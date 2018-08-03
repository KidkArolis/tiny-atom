const React = require('react')
const raf = require('./raf')
const printDebug = require('./debug')

const dev = process.env.NODE_ENV !== 'production'

function createContext () {
  const AtomContext = React.createContext()

  class Provider extends React.Component {
    render () {
      return (
        <AtomContext.Provider value={{ atom: this.props.atom, debug: this.props.debug }}>
          {this.props.children}
        </AtomContext.Provider>
      )
    }
  }

  class ConsumerInner extends React.Component {
    constructor (props) {
      super()
      this.state = {}
      this.pure = typeof props.pure === 'undefined' ? true : props.pure
      this.scheduleUpdate = props.sync
        ? () => this.update()
        : raf(() => this.update())
    }

    componentDidMount () {
      this.observe()
    }

    componentWillUnmount () {
      this.unobserve && this.unobserve()
      this.cancelUpdate && this.cancelUpdate()
    }

    shouldComponentUpdate (nextProps, nextState) {
      if (!this.pure) return true

      // if it's <Consumer> with dynamic children, shortcut the check
      if (this.props.children !== nextProps.children) {
        if (dev && (this.context.debug || this.props.debug)) {
          printDebug.children(this.debugName(), this.props.children, nextProps.children)
        }
        return true
      }

      // our state is mappedProps, this is the main optimisation
      if (differ(this.state, nextState)) {
        if (dev && (this.context.debug || this.props.debug)) {
          printDebug.props(this.debugName(), this.state, nextState)
        }
        return true
      }

      // in connect() case don't need to diff further, no extra props
      if (this.props.originalProps) return false

      // in <Consumer /> case we also diff props
      if (differ(this.props, nextProps)) {
        if (dev && (this.context.debug || this.props.debug)) {
          printDebug.props(this.debugName(), this.props, nextProps)
        }
        return true
      }

      return false
    }

    debugName () {
      return this.props.displayName || this.constructor.name
    }

    componentDidUpdate (prevProps) {
      this.cancelUpdate && this.cancelUpdate()
      if (prevProps.atom !== this.props.atom) {
        this.observe()
      }
    }

    observe () {
      this.unobserve && this.unobserve()
      this.unobserve = this.props.atom.observe(() => {
        this.cancelUpdate = this.scheduleUpdate()
      })
    }

    update () {
      this.setState({})
    }

    render () {
      const { atom, actions, originalProps, render, children } = this.props
      const mappedProps = this.state
      const boundActions = bindActions(actions, atom.dispatch, mappedProps)
      return (render || children)(Object.assign({}, originalProps, mappedProps, boundActions))
    }
  }

  ConsumerInner.getDerivedStateFromProps = (props, state) => {
    const { atom, originalProps, map } = props
    return Object.assign({}, originalProps, map ? map(atom.get(), originalProps) : {})
  }

  const Consumer = props => (
    <AtomContext.Consumer>
      {({ atom, debug }) => <ConsumerInner {...props} atom={atom} debug={debug} />}
    </AtomContext.Consumer>
  )

  function connect (map, actions, options = {}) {
    return function connectComponent (Component) {
      const render = mappedProps => <Component {...mappedProps} />
      const Connected = (props) => (
        <Consumer
          displayName={Component.displayName || Component.name}
          map={map}
          actions={actions}
          pure={options.pure}
          sync={options.sync}
          options={options.debug}
          originalProps={props}
          render={render}
        />
      )
      return Connected
    }
  }

  function bindActions (actions, dispatch, mappedProps) {
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
    for (let i in nextMappedProps) {
      if (!(i in mappedProps)) return true
    }
    return false
  }

  return { Provider, Consumer, connect }
}

const { Provider, Consumer, connect } = createContext()
module.exports = { Provider, Consumer, connect, createContext }
