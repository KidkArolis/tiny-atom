import React from 'react'
import { differs } from './differs'
import { raf } from '../core/raf'
import { StoreContext } from './context'

const isServer = typeof navigator === 'undefined'

class ConsumerInner extends React.Component {
  constructor(props) {
    super()
    this.state = {}
    this.isPure = typeof props.pure === 'undefined' ? true : props.pure
    this.shouldObserve = typeof props.observe === 'undefined' ? !isServer : props.observe
    this.scheduleUpdate = props.sync ? () => this.update() : raf(() => this.update())
  }

  observe() {
    if (!this.shouldObserve) return
    this.unobserve && this.unobserve()
    this.unobserve = this.props.atom.observe(() => {
      this.cancelUpdate = this.scheduleUpdate()
    })
    this.observedAtom = this.props.atom
    delete this.boundActions
    delete this.boundActionsSpec
  }

  componentWillUnmount() {
    this.unobserve && this.unobserve()
    this.cancelUpdate && this.cancelUpdate()
    delete this.unobserve
    delete this.cancelUpdate
    delete this.observedAtom
    delete this.boundActions
    delete this.boundActionsSpec
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (!this.isPure) return true

    // if it's <Consumer> with dynamic children, shortcut the check
    if (this.props.children !== nextProps.children) {
      return true
    }

    // our state is mappedProps, this is the main optimisation
    if (differs(this.state, nextState)) {
      return true
    }

    // in connect() case don't need to diff further, no extra props
    if (this.props.originalProps) {
      this.cancelUpdate && this.cancelUpdate()
      return false
    }

    // in <Consumer /> case we also diff props
    if (differs(this.props, nextProps)) {
      return true
    }

    this.cancelUpdate && this.cancelUpdate()
    return false
  }

  componentDidUpdate(prevProps) {
    this.cancelUpdate && this.cancelUpdate()
  }

  update() {
    this.setState({})
  }

  bindActions(actions, dispatch, mappedProps) {
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

  render() {
    // do this in render, because:
    //  doing in constructor would cause memory leaks in SSR
    //  doing in componentDidMount leads to the wrong order of subscriptions
    if (!this.unobserve || this.observedAtom !== this.props.atom) this.observe()
    const { atom, actions, originalProps, render, children } = this.props
    const mappedProps = this.state
    const boundActions = this.bindActions(actions, atom.dispatch, mappedProps)
    return (render || children)(Object.assign({}, originalProps, mappedProps, boundActions))
  }
}

ConsumerInner.getDerivedStateFromProps = (props, state) => {
  const { atom, originalProps, map } = props
  return Object.assign({}, originalProps, map ? map(atom.get(), originalProps) : {})
}

export const createConsumer = StoreContext => props => (
  <StoreContext.Consumer>{({ atom }) => <ConsumerInner {...props} atom={atom} />}</StoreContext.Consumer>
)

export const Consumer = createConsumer(StoreContext)
