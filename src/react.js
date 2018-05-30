const React = require('react')

const { PureComponent } = React

class PureConnect extends PureComponent {
  render () {
    const { children, actions, dispatch, ...mappedProps } = this.props
    if (this.props.stable) {
      console.log('RENDERING')
    }
    return children(actions
      ? Object.assign({}, mappedProps, actions(dispatch, mappedProps))
      : mappedProps
    )
  }
}

module.exports = function createAtomContext (atom) {
  const Context = React.createContext()

  class Consumer extends React.Component {
    constructor () {
      super()
      this.renderChildren = this.renderChildren.bind(this)
    }

    render () {
      const { map, actions, originalProps, pure = true } = this.props
      if (pure) {
        return (
          <Context.Consumer>
            {({ state, dispatch }) => {
              const mappedProps = Object.assign({}, originalProps, map ? map(state, originalProps) : { state, dispatch })
              return (
                <PureConnect {...mappedProps} actions={actions} dispatch={dispatch}>
                  {this.renderChildren}
                </PureConnect>
              )
            }}
          </Context.Consumer>
        )
      }
    }

    renderChildren (mappedProps, dispatch) {
      return this.props.children(mappedProps)
    }
  }

  const connect = (map, actions, options = {}) => Component => {
    const renderComponent = mappedProps => <Component {...mappedProps} />
    return props => (
      <Consumer map={map} actions={actions} pure={options.pure} originalProps={props}>
        {renderComponent}
      </Consumer>
    )
  }

  class Provider extends React.Component {
    componentDidMount () {
      this.unobserve = atom.observe(() => {
        this.setState({})
      })
    }

    componentWillUnmount () {
      this.unobserve && this.unobserve()
      delete this.unobserve
    }

    render () {
      const value = {
        state: atom.get(),
        dispatch: atom.dispatch
      }
      return (
        <Context.Provider value={value}>
          {this.props.children}
        </Context.Provider>
      )
    }
  }

  return {
    Provider,
    Consumer,
    connect
  }
}
