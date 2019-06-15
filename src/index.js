/**
 * Minimal state management.
 *
 * const actions = { inc: (atom, payload) => {} }
 * const atom = createAtom({ count: 1 }, actions)
 *
 * atom.observe(atom => console.log(atom.get()))
 *
 * atom.get() // { count: 1 }
 * atom.dispatch('increment') // action
 * atom.dispatch('increment', { by: 2 }) // action with payload
 */
module.exports = function createAtom(initialState = {}, actions = {}, options = {}) {
  let state = initialState
  let actionSeq = 0
  const listeners = []
  const debug = options.debug
  const get = () => state
  const set = createSet()
  const swap = createSwap()
  const dispatch = createDispatch()
  const bindActions = options.bindActions || defaultBindActions
  const atom = { get, set, swap, dispatch, observe, fuse, actions: bindActions(dispatch, actions) }
  const evolve = options.evolve || defaultEvolve
  return atom

  function defaultEvolve(atom, action, actions) {
    if (!actions[action.type]) throw new Error(`Missing action: ${action.type}`)
    return actions[action.type](atom, action.payload)
  }

  function defaultBindActions(dispatch, actions) {
    return Object.keys(actions).reduce((boundActions, actionType) => {
      boundActions[actionType] = payload => dispatch(actionType, payload)
      return boundActions
    }, {})
  }

  function insert(listeners, f, i) {
    if (typeof i !== 'undefined') {
      for (let j = 0; j < listeners.length; j++) {
        if (listeners[j].i > i) {
          listeners.splice(j, 0, { f, i })
          return
        }
      }
    }
    listeners.push({ f, i })
  }

  function observe(f, i) {
    insert(listeners, f, i)
    return function unobserve() {
      for (let j = 0; j < listeners.length; j++) {
        if (listeners[j].f === f) {
          listeners.splice(j, 1)
          break
        }
      }
    }
  }

  function fuse(moreState, moreActions) {
    Object.assign(actions, moreActions)
    atom.actions = bindActions(dispatch, actions)
    if (moreState) set(moreState)
  }

  function createDispatch(sourceActions) {
    sourceActions = sourceActions || []
    return function dispatch(type, payload) {
      let action = { seq: ++actionSeq, type: type }
      if (typeof payload !== 'undefined') action.payload = payload
      if (debug) {
        report('action', action, sourceActions)
        const history = sourceActions.concat([action])
        const dispatch = createDispatch(history)
        const set = createSet(history)
        const swap = createSwap(history)
        const boundActions = bindActions(dispatch, actions)
        const actionAtom = Object.assign({}, atom, { dispatch, actions: boundActions, set, swap })
        return evolve(actionAtom, action, actions)
      } else {
        return evolve(atom, action, actions)
      }
    }
  }

  function createSet(sourceActions, { swap = false } = {}) {
    sourceActions = sourceActions || []
    return function set(update, options = {}) {
      let action = { payload: update }
      let prevState = state
      state = swap ? action.payload : Object.assign({}, state, action.payload)
      if (debug) report('update', action, sourceActions, prevState)
      listeners.forEach(l => l.f(atom))
    }
  }

  function createSwap(sourceActions) {
    return createSet(sourceActions, { swap: true })
  }

  function report(type, action, sourceActions, prevState) {
    const info = { type: type, action: action, sourceActions: sourceActions, atom: atom }
    if (prevState) info.prevState = prevState
    typeof debug === 'function' ? debug(info) : debug.forEach(debug => debug(info))
  }
}
