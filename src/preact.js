const Preact = require('preact')
const raf = require('./raf')
const printDebug = require('./debug')

const dev = process.env.NODE_ENV !== 'production'

function createContext () {
  class Provider extends Preact.Component {
    getChildContext () {
      return {
        atom: this.props.atom,
        debug: this.props.debug
      }
    }

    render () {
      return this.props.children[0]
    }
  }

  class Consumer extends Preact.Component {
    constructor (props, { atom }) {
      super()
      this.state = this.map(atom.get(), props)
      this.pure = typeof props.pure === 'undefined' ? true : props.pure
      this.scheduleUpdate = props.sync
        ? () => this.update()
        : raf(() => this.update())
    }

    componentDidMount () {
      this.observe()
    }

    observe () {
      const { atom } = this.context
      this.unobserve && this.unobserve()
      this.observedAtom = atom
      this.unobserve = atom.observe(() => {
        this.cancelUpdate = this.scheduleUpdate()
      })
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
    }

    debugName () {
      return this._component
        ? this._component.constructor.name
        : this._parentComponent.constructor.name + ' → ' + this.constructor.name
    }

    componentWillReceiveProps (nextProps) {
      const { atom } = this.context
      const nextMappedProps = this.map(atom.get(), nextProps)
      this.setState(nextMappedProps)
    }

    componentDidUpdate () {
      this.cancelUpdate && this.cancelUpdate()
    }

    map (state, props) {
      const { originalProps, map } = props
      return Object.assign({}, originalProps, map ? map(state, originalProps) : {})
    }

    update () {
      const { atom } = this.context
      const nextMappedProps = this.map(atom.get(), this.props)
      this.setState(nextMappedProps)
    }

    render ({ actions, originalProps, render, children }, state, { atom }) {
      // we don't have a hook to check atom in the <Provider> has been
      // swapped, so check here if we're still observing the right atom
      if (this.observedAtom !== this.context.atom) this.observe()
      const mappedProps = this.state
      const boundActions = bindActions(actions, atom.dispatch, mappedProps)
      return (render || children[0])(Object.assign({}, originalProps, mappedProps, boundActions))
    }
  }

  function connect (map, actions, options = {}) {
    return function connectComponent (Component) {
      const render = mappedProps => <Component {...mappedProps} />
      return (props) => (
        <Consumer
          map={map}
          actions={actions}
          pure={options.pure}
          sync={options.sync}
          debug={options.debug}
          originalProps={props}
          render={render}
        />
      )
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
