const React = require('react')

const { createElement, createContext, Component, PureComponent } = React

module.exports = function createAtomContext (atom) {
  const Context = createContext()

  const Consumer = ({ map, actions, pure = true, props, children }) => (
    createElement(Context.Consumer, {}, ({ state, dispatch }) => {
      if (map) {
        props = Object.assign({}, props, map(state, props))
      }

      if (pure) {
        return createElement(PureConnect, { props, actions }, (props) => children(props || { state, dispatch }))
      } else {
        if (actions) {
          props = Object.assign({}, props, actions(dispatch, props))
        }
        return children(props || { state, dispatch })
      }
    })
  )

  const connect = (map, actions, options = {}) => Component => props => (
    createElement(Consumer, { map, actions, pure: options.pure, props }, (mappedProps) => (
      createElement(Component, Object.assign({}, props, mappedProps))
    ))
  )

  class Provider extends React.Component {
    componentDidMount () {
      this.unobserve = atom.observe(() => {
        this.setState({})
      })
    }

    componentWillUnmount () {
      this.unobserve && this.unobserve()
    }

    render () {
      return (
        createElement(Context.Provider, {
          value: {
            state: atom.get(),
            dispatch: atom.dispatch
          }
        }, this.props.children)
      )
    }
  }

  class Consumer extends React.Component {
    componentDidMount () {
      this.unobserve = atom.observe(() => {
        this.setState({})
      })
    }

    componentWillUnmount () {
      this.unobserve && this.unobserve()
    }

    render () {
      return (
        createElement(Context.Provider, {
          value: {
            state: atom.get(),
            dispatch: atom.dispatch
          }
        }, this.props.children)
      )
    }
  }

  class PureConnect extends PureComponent {
    render () {
      return this.props.children(Object.assign(
        {},
        this.props.props,
        this.props.actions(this.props.props)
      ))
    }
  }

  return {
    Provider,
    Consumer,
    connect
  }
}
