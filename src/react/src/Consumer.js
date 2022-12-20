import React from 'react'
import { differs } from './differs'
import { raf } from './raf'
import { AtomContext } from './context'

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
  }

  componentWillUnmount() {
    this.unobserve && this.unobserve()
    this.cancelUpdate && this.cancelUpdate()
    delete this.unobserve
    delete this.cancelUpdate
    delete this.observedAtom
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

  render() {
    // do this in render, because:
    //  doing in constructor would cause memory leaks in SSR
    //  doing in componentDidMount leads to the wrong order of subscriptions
    if (!this.unobserve || this.observedAtom !== this.props.atom) this.observe()
    const { atom, originalProps, render, children } = this.props
    const { actions } = atom
    const mappedProps = this.state
    return (render || children)(Object.assign({}, originalProps, { actions }, mappedProps))
  }
}

ConsumerInner.getDerivedStateFromProps = (props, state) => {
  const { atom, originalProps, map } = props
  return Object.assign({}, originalProps, map ? map(atom.get(), originalProps) : {})
}

export const createConsumer = AtomContext => props => (
  <AtomContext.Consumer>{({ atom }) => <ConsumerInner {...props} atom={atom} />}</AtomContext.Consumer>
)

export const Consumer = createConsumer(AtomContext)
