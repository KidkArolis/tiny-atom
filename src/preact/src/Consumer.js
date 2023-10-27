import { Component } from 'preact'
import { raf, differs } from '../../react'

const canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement)

export class Consumer extends Component {
  constructor(props, { atom }) {
    super()
    this.state = this.map(atom.get(), props)
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

  render({ originalProps, render, children }, state, { atom }) {
    // do this in render, because:
    //  doing in constructor would cause memory leaks in SSR
    //  doing in componentDidMount leads to the wrong order of subscriptions
    //  we don't have another hook in Preact's context to check if atom was swapped
    if (!this.unobserve || this.observedAtom !== atom) this.observe()
    const { actions, dispatch } = atom
    const mappedProps = this.state
    return (render || children[0])(Object.assign({}, originalProps, { actions, dispatch }, mappedProps))
  }
}
