const React = require('react')
const raf = require('./raf')

function createContext () {
  const AtomContext = React.createContext()

  class Provider extends React.Component {
    render () {
      return (
        <AtomContext.Provider value={this.props.atom}>
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
      this.dirty = false
      this.observe()
    }

    componentWillUnmount () {
      this.unobserve && this.unobserve()
      this.cancelUpdate && this.cancelUpdate()
    }

    shouldComponentUpdate (nextProps, nextState) {
      if (!this.pure) return true
      // if it's <Consumer> with dynamic children, shortcut the check
      if (this.props.children !== nextProps.children) return true
      // our state is mappedProps, this is the main optimisation
      if (differ(this.state, nextState)) return true
      // in connect() case don't need to diff further, no extra props
      if (this.props.originalProps) return false
      // in <Consumer /> case we also diff props
      return differ(this.props, nextProps)
    }

    componentDidUpdate (prevProps) {
      this.dirty = false
      if (prevProps.atom !== this.props.atom) {
        this.observe()
      }
    }

    observe () {
      this.unobserve && this.unobserve()
      this.unobserve = this.props.atom.observe(() => {
        this.dirty = true
        this.cancelUpdate = this.scheduleUpdate()
      })
    }

    update () {
      if (this.dirty) this.setState({})
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
      {atom => <ConsumerInner {...props} atom={atom} />}
    </AtomContext.Consumer>
  )

  function connect (map, actions, options = {}) {
    return function connectComponent (Component) {
      const render = mappedProps => <Component {...mappedProps} />
      return (props) => (
        <Consumer
          map={map}
          actions={actions}
          pure={options.pure}
          sync={options.sync}
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
    for (let i in mappedProps) {
      if (!(i in nextMappedProps)) return true
    }
    return false
  }

  return { Provider, Consumer, connect }
}

const { Provider, Consumer, connect } = createContext()
module.exports = { Provider, Consumer, connect, createContext }
