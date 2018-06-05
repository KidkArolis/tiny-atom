const Preact = require('preact')
const raf = require('./raf')

// For now, React and Preact bindings are different implementation
// just because Preact doesn't have getDerivedStateFromProps yet
// once that's shipped, we can reuse the React implementation in both
module.exports = function createContext (atom) {
  const { get, dispatch } = atom

  class Consumer extends Preact.Component {
    constructor (props) {
      super()
      this.state = this.map(get(), props)
      this.pure = typeof props.pure === 'undefined' ? true : props.pure
      this.scheduleUpdate = props.sync
        ? () => this.update()
        : raf(() => this.update(), { initial: false })
    }

    componentDidMount () {
      this.dirty = false
      this.unobserve = atom.observe(() => {
        this.dirty = true
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
      if (this.props.children !== nextProps.children) return true
      // our state is mappedProps, this is the main optimisation
      if (differ(this.state, nextState)) return true
      // in connect() case don't need to diff further, we're in control
      if (this.props.originalProps) return false
      // in <Consumer /> case we also diff props
      return differ(this.props, nextProps)
    }

    componentWillReceiveProps (nextProps) {
      const nextMappedProps = this.map(get(), nextProps)
      this.setState(nextMappedProps)
    }

    componentDidUpdate () {
      this.dirty = false
    }

    map (state, props) {
      const { originalProps, map } = props
      return Object.assign({}, originalProps, map ? map(state, originalProps) : {})
    }

    update () {
      if (!this.dirty) return
      const nextMappedProps = this.map(get(), this.props)
      this.setState(nextMappedProps)
    }

    render ({ actions, originalProps, render, children }) {
      const mappedProps = this.state
      const boundActions = bindActions(actions, dispatch, mappedProps)
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

  return { Consumer, connect }
}
