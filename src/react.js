const React = require('react')
const { useContext, useState, useEffect } = React
const raf = require('./raf')
const printDebug = require('./debug')

const dev = process.env.NODE_ENV !== 'production'
const canUseDOM = !!(typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement)

function createContext () {
  const AtomContext = React.createContext()

  function useAtom (selector, action, options) {
    const value = useAtomState(selector, options)
    const setValue = useAtomAction(action)
    return [value, setValue]
  }

  function useAtomState (selector, options = {}) {
    const { pure = true, observe = true } = options
    const { atom } = useContext(AtomContext)
    const [value, setValue] = useState(selector(atom.get()))

    useEffect(() => {
      if (!observe) return
      return atom.observe(atom => {
        const nextValue = selector(atom.get())
        if (!pure || value !== nextValue) {
          setValue(nextValue)
        }
      })
    })
    return value
  }

  function useAtomAction (action) {
    const { atom } = useContext(AtomContext)
    return payload => atom.dispatch(action, payload)
  }

  function Provider ({ atom, debug, children }) {
    return (
      <AtomContext.Provider value={{ atom, debug }}>
        {children}
      </AtomContext.Provider>
    )
  }

  class ConsumerInner extends React.Component {
    constructor (props) {
      super()
      this.state = {}
      this.isPure = typeof props.pure === 'undefined' ? true : props.pure
      this.shouldObserve = typeof props.observe === 'undefined'
        ? canUseDOM
        : props.observe
      this.scheduleUpdate = props.sync
        ? () => this.update()
        : raf(() => this.update())
    }

    observe () {
      if (!this.shouldObserve) return
      this.unobserve && this.unobserve()
      this.unobserve = this.props.atom.observe(() => {
        this.cancelUpdate = this.scheduleUpdate()
      })
      this.observedAtom = this.props.atom
      delete this.boundActions
      delete this.boundActionsSpec
    }

    componentWillUnmount () {
      this.unobserve && this.unobserve()
      this.cancelUpdate && this.cancelUpdate()
      delete this.unobserve
      delete this.cancelUpdate
      delete this.observedAtom
      delete this.boundActions
      delete this.boundActionsSpec
    }

    shouldComponentUpdate (nextProps, nextState) {
      if (!this.isPure) return true

      // if it's <Consumer> with dynamic children, shortcut the check
      if (this.props.children !== nextProps.children) {
        if (dev && (this.context.debug || this.props.debug)) {
          printDebug.children(
            this.debugName(),
            this.props.children,
            nextProps.children
          )
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
      if (this.props.originalProps) {
        this.cancelUpdate && this.cancelUpdate()
        return false
      }

      // in <Consumer /> case we also diff props
      if (differ(this.props, nextProps)) {
        if (dev && (this.context.debug || this.props.debug)) {
          printDebug.props(this.debugName(), this.props, nextProps)
        }
        return true
      }

      this.cancelUpdate && this.cancelUpdate()
      return false
    }

    debugName () {
      return this.props.displayName || this.constructor.name
    }

    componentDidUpdate (prevProps) {
      this.cancelUpdate && this.cancelUpdate()
    }

    update () {
      this.setState({})
    }

    bindActions (actions, dispatch, mappedProps) {
      if (!actions) return { dispatch }
      if (typeof actions === 'function') return actions(dispatch, mappedProps)
      if (!this.boundActions || this.boundActionsSpec !== actions) {
        this.boundActionsSpec = actions
        this.boundActions = actions.reduce((acc, action) => {
          acc[action] = payload => dispatch(action, payload)
          return acc
        }, {})
      }
      return this.boundActions
    }

    render () {
      // do this in render, because:
      //  doing in constructor would cause memory leaks in SSR
      //  doing in componentDidMount leads to the wrong order of subscriptions
      if (!this.unobserve || this.observedAtom !== this.props.atom) {
        this.observe()
      }
      const { atom, actions, originalProps, render, children } = this.props
      const mappedProps = this.state
      const boundActions = this.bindActions(actions, atom.dispatch, mappedProps)
      return (render || children)(
        Object.assign({}, originalProps, mappedProps, boundActions)
      )
    }
  }

  ConsumerInner.getDerivedStateFromProps = (props, state) => {
    const { atom, originalProps, map } = props
    return Object.assign(
      {},
      originalProps,
      map ? map(atom.get(), originalProps) : {}
    )
  }

  const Consumer = props => (
    <AtomContext.Consumer>
      {({ atom, debug }) => (
        <ConsumerInner {...props} atom={atom} debug={debug} />
      )}
    </AtomContext.Consumer>
  )

  function connect (map, actions, options = {}) {
    return function connectComponent (Component) {
      const render = mappedProps => <Component {...mappedProps} />
      const Connected = props => (
        <Consumer
          displayName={Component.displayName || Component.name}
          map={map}
          actions={actions}
          pure={options.pure}
          sync={options.sync}
          observe={options.observe}
          debug={options.debug}
          originalProps={props}
          render={render}
        />
      )
      return Connected
    }
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

  return { Provider, Consumer, connect, useAtomState, useAtomAction, useAtom }
}

const {
  Provider,
  Consumer,
  connect,
  useAtomState,
  useAtomAction,
  useAtom
} = createContext()
module.exports = {
  Provider,
  Consumer,
  connect,
  createContext,
  useAtomState,
  useAtomAction,
  useAtom
}
