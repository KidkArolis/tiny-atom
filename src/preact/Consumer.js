import Preact from 'preact'
import { differs } from '../react/differs'
import { raf } from '../core/raf'

const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement)

export class Consumer extends Preact.Component {
  constructor(props, { atom }) {
    super()
    this.state = this.map(atom.get(), props)
    this.isPure = typeof props.pure === 'undefined' ? true : props.pure
    this.shouldObserve = typeof props.observe === 'undefined' ? canUseDOM : props.observe
    this.scheduleUpdate = props.sync ? () => this.update() : raf(() => this.update())
  }

  observe() {
    if (!this.shouldObserve) return
    const { atom } = this.context
    this.unobserve && this.unobserve()
    this.unobserve = atom.observe(() => {
      this.cancelUpdate = this.scheduleUpdate()
    })
    this.observedAtom = atom
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
  }

  componentWillReceiveProps(nextProps) {
    const { atom } = this.context
    const nextMappedProps = this.map(atom.get(), nextProps)
    this.setState(nextMappedProps)
  }

  componentDidUpdate() {
    this.cancelUpdate && this.cancelUpdate()
  }

  map(state, props) {
    const { originalProps, map } = props
    return Object.assign({}, originalProps, map ? map(state, originalProps) : {})
  }

  update() {
    const { atom } = this.context
    const nextMappedProps = this.map(atom.get(), this.props)
    this.setState(nextMappedProps)
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

  render({ actions, originalProps, render, children }, state, { atom }) {
    // do this in render, because:
    //  doing in constructor would cause memory leaks in SSR
    //  doing in componentDidMount leads to the wrong order of subscriptions
    //  we don't have another hook in Preact's context to check if atom was swapped
    if (!this.unobserve || this.observedAtom !== this.context.atom) this.observe()
    const mappedProps = this.state
    const boundActions = this.bindActions(actions, atom.dispatch, mappedProps)
    return (render || children[0])(Object.assign({}, originalProps, mappedProps, boundActions))
  }
}
