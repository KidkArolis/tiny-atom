const React = require('react')

const { Component, PureComponent, createContext } = React

module.exports = function createAtomContext (atom) {
  const { get, dispatch } = atom
  const Context = createContext()

  // connect is creates a HOC that will map props and bind actions
  // the component it creates is pure by default, and so if mapped
  // props or origina props hasn't changed, it doesn't rebind the
  // actions and it doesn't rerender the component
  function connect (map, actions, options = {}) {
    if (typeof options.pure === 'undefined') {
      options.pure = true
    }

    return function connectComponent (Component) {
      class PureConnectedComponent extends PureComponent {
        render () {
          const mappedProps = this.props
          const boundActions = bindActions(actions, mappedProps)
          return <Component {...mappedProps} {...boundActions} />
        }
      }

      return function Connected (originalProps) {
        return (
          <Context.Consumer>
            {({ state }) => {
              const mappedProps = Object.assign({}, originalProps, map ? map(state, originalProps) : { state })
              return options.pure
                ? <PureConnectedComponent {...mappedProps} />
                : <Component {...mappedProps} {...bindActions(actions, mappedProps)} />
            }}
          </Context.Consumer>
        )
      }
    }
  }

  // Consumer is a wrapper around Context.Consumer with extra
  // props map and actions for transforming state and binding action fns
  function Consumer ({ map, actions, children }) {
    return (
      <Context.Consumer>
        {({ state }) => {
          const mappedProps = map ? map(state) : { state }
          const boundActions = bindActions(actions, mappedProps)
          return children(Object.assign({}, mappedProps, boundActions))
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
        <Context.Provider value={{ state: get(), dispatch }}>
          {this.props.children}
        </Context.Provider>
      )
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

  return { Provider, Consumer, connect }
}
