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
  const merge = options.merge || deepMerge
  const debug = options.debug
  const get = () => state
  const set = createSet()
  const dispatch = createDispatch()
  const boundActions = bindDispatchToActions(dispatch)
  const atom = { get, dispatch, observe, fuse, actions: boundActions }
  const mutableAtom = { get, set, dispatch, observe, fuse }
  const evolve = options.evolve || defaultEvolve
  return atom

  function defaultEvolve (atom, action, actions) {
    if (!actions[action.type]) throw new Error(`Missing action: ${action.type}`)
    return actions[action.type](atom, action.payload)
  }

  function observe (f) {
    listeners.push(f)
    return function unobserve () {
      if (listeners.indexOf(f) >= 0) {
        listeners.splice(listeners.indexOf(f), 1)
      }
    }
  }

  function fuse (moreState, moreActions, options) {
    Object.assign(actions, moreActions)
    if (moreState) set(moreState, options)
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
        const boundActions = bindDispatchToActions(dispatch)
        const set = createSet(history)
        const actionAtom = Object.assign({}, mutableAtom, { dispatch, set, actions: boundActions })
        return evolve(actionAtom, action, actions)
      } else {
        return evolve(mutableAtom, action, actions)
      }
    }
  }

  function bindDispatchToActions (dispatch) {
    return Object.keys(actions).reduce((boundActions, action) => {
      boundActions[action] = payload => dispatch(action, payload)
      return boundActions
    }, {})
  }

  function createSet (sourceActions) {
    sourceActions = sourceActions || []
    return function set (update, options = {}) {
      let action = { payload: update }
      let prevState = state
      state = options.replace ? action.payload : merge(state, action.payload)
      if (debug) report('update', action, sourceActions, prevState)
      listeners.forEach(f => f(atom))
    }
  }

  function report (type, action, sourceActions, prevState) {
    const info = { type: type, action: action, sourceActions: sourceActions, atom: atom }
    if (prevState) info.prevState = prevState
    typeof debug === 'function' ? debug(info) : debug.forEach(debug => debug(info))
  }

  function deepMerge (state, update) {
    if (typeof update === 'undefined') return state
    if (!isObject(update)) return update
    return Object.keys(update).reduce((acc, key) => {
      acc[key] = deepMerge(acc[key], update[key])
      return acc
    }, Object.assign({}, state))
  }

  function isObject (obj) {
    return typeof obj === 'object' &&
      Object.prototype.toString.call(obj) === '[object Object]'
  }
}
