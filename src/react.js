const React = require('react')

const { Component, PureComponent, createContext } = React

class PureConnect extends PureComponent {
  render () {
    const {
      connectedComponent: ConnectedComponent,
      connectedActions,
      connectedDispatch,
      ...mappedProps
    } = this.props
    const mappedActions = mapActions(connectedActions, connectedDispatch, mappedProps)
    return <ConnectedComponent {...mappedProps} {...mappedActions} />
  }
}

module.exports = function createAtomContext (atom) {
  const Context = createContext()

  // connect is creates a HOC that will map props and bind actions
  // the component it creates is pure by default, and so if mapped
  // props or origina props hasn't changed, it doesn't rebind the
  // actions and it doesn't rerender the component
  const connect = (map, actions, options = {}) => Component => originalProps => (
    <Consumer>
      {({ state, dispatch }) => {
        const mappedProps = Object.assign({}, originalProps, map ? map(state, originalProps) : { state })
        if (options.pure !== false) {
          return (
            <PureConnect
              {...mappedProps}
              connectedActions={actions}
              connectedDispatch={dispatch}
              connectedComponent={Component}
            />
          )
        } else {
          const mappedActions = mapActions(actions, dispatch, mappedProps)
          return <Component {...mappedProps} {...mappedActions} />
        }
      }}
    </Consumer>
  )

  // Consumer is a wrapper around Context.Consumer with extra
  // props map and actions for transforming state and binding action fns
  function Consumer ({ map, actions, children }) {
    return (
      <Context.Consumer>
        {({ state, dispatch }) => {
          const mappedProps = map ? map(state) : { state }
          const mappedActions = mapActions(actions, dispatch, mappedProps)
          return children(Object.assign({}, mappedProps, mappedActions))
        }}
      </Context.Consumer>
    )
  }

  // Provider observes atom changes and updates the Context.Provider value
  class Provider extends Component {
    componentDidMount () {
      this.unobserve = atom.observe(() => this.setState({}))
    }

    componentWillUnmount () {
      this.unobserve && this.unobserve()
    }

    render () {
      return (
        <Context.Provider value={{ state: atom.get(), dispatch: atom.dispatch }}>
          {this.props.children}
        </Context.Provider>
      )
    }
  }

  return { Provider, Consumer, connect }
}

function mapActions (actions, dispatch, mappedProps) {
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
