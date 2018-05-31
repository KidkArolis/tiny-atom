const React = require('react')
const raf = require('./raf')

module.exports = function createAtomContext (atom) {
  const { get, dispatch } = atom

  // connect is creates a HOC that will map props and bind actions
  // the component it creates is pure by default, and so if mapped
  // props or origina props hasn't changed, it doesn't rebind the
  // actions and it doesn't rerender the component
  function connect (map, actions, options = {}) {
    if (typeof options.pure === 'undefined') {
      options.pure = true
    }

    return function connectComponent (Component) {
      class Pure extends React.PureComponent {
        render () {
          const mappedProps = this.props
          const boundActions = bindActions(actions, mappedProps)
          return <Component {...mappedProps} {...boundActions} />
        }
      }

      return function Connected (originalProps) {
        return (
          <Consumer sync={options.sync}>
            {({ state }) => {
              const mappedProps = Object.assign({}, originalProps, map ? map(state, originalProps) : { state })
              return options.pure
                ? <Pure {...mappedProps} />
                : <Component {...mappedProps} {...bindActions(actions, mappedProps)} />
            }}
          </Consumer>
        )
      }
    }
  }

  // Consumer is a wrapper around Context.Consumer with extra
  // props map and actions for transforming state and binding action fns
  class Consumer extends React.Component {
    constructor ({ sync }) {
      super()
      this.dirty = false
      this.scheduleUpdate = sync
        ? () => this.update()
        : raf(() => this.update(), { initial: false })
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

    componentDidUpdate () {
      this.dirty = false
    }

    update () {
      if (this.dirty) {
        this.setState({})
      }
    }

    render () {
      const { map, actions, children } = this.props
      const state = get()
      const mappedProps = map ? map(state) : { state }
      const boundActions = bindActions(actions, mappedProps)
      return children(Object.assign({}, mappedProps, boundActions))
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

  return { Consumer, connect }
}
