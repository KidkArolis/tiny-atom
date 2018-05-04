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
module.exports = function createAtom (initialState = {}, actions = {}, options = {}) {
  let state = initialState
  let actionSeq = 0
  const listeners = []
  const merge = options.merge || defaultMerge
  const debug = options.debug
  const set = createSet()
  const dispatch = createDispatch()
  const atom = { get, dispatch, observe, fuse }
  const mutableAtom = { get, set, dispatch, observe, fuse }
  const evolve = options.evolve || defaultEvolve
  return atom

  function defaultMerge (state, update) {
    return Object.assign({}, state, update)
  }

  function defaultEvolve (atom, action, actions) {
    if (!actions[action.type]) throw new Error(`Missing action: ${action.type}`)
    return actions[action.type](atom, action.payload)
  }

  function get () {
    return state
  }

  function observe (f) {
    listeners.push(f)
    return function unobserve () {
      if (listeners.indexOf(f) >= 0) {
        listeners.splice(listeners.indexOf(f), 1)
      }
    }
  }

  function fuse (moreState, moreActions) {
    if (moreActions) Object.assign(actions, moreActions)
    if (moreState) set(moreState)
  }

  function createDispatch (sourceActions) {
    sourceActions = sourceActions || []
    return function dispatch (type, payload) {
      let action = { seq: ++actionSeq, type: type }
      if (typeof payload !== 'undefined') action.payload = payload
      if (debug) {
        report('action', action, sourceActions)
        const history = sourceActions.concat([action])
        const dispatch = createDispatch(history)
        const set = createSet(history)
        const actionAtom = Object.assign({}, mutableAtom, { dispatch, set })
        return evolve(actionAtom, action, actions)
      } else {
        return evolve(mutableAtom, action, actions)
      }
    }
  }

  function createSet (sourceActions) {
    sourceActions = sourceActions || []
    return function set (update) {
      let action = { payload: update }
      let prevState = state
      state = merge(state, action.payload)
      if (debug) report('update', action, sourceActions, prevState)
      listeners.forEach(f => f(atom))
    }
  }

  function report (type, action, sourceActions, prevState) {
    const info = { type: type, action: action, sourceActions: sourceActions, atom: atom }
    if (prevState) info.prevState = prevState
    debug(info)
  }
}
