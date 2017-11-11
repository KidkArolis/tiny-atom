/**
 * Minimal state management.
 *
 * const evolve = (get, split, action) => split({ count: get().count + 1 })
 * const render = (atom) => console.log(atom.get())
 * const atom = createAtom({ count: 1 }, evolve, render)
 *
 * atom.get() // { count: 1 }
 * atom.split('increment') // action
 * atom.split('increment', { by: 2 }) // action with payload
 * atom.split({ count: 0 }) // update state directly
 */
module.exports = function createAtom (initialState, evolve, render, options) {
  options = options || {}
  evolve = evolve || function () {}
  render = render || function () {}
  var actionSeq = 0
  var state = initialState || {}
  var merge = options.merge || defaultMerge
  var debug = options.debug
  var atom = { get: get, split: createSplit() }
  return atom

  function defaultMerge (state, update) {
    return Object.assign({}, state, update)
  }

  function get () {
    return state
  }

  function createSplit (sourceActions) {
    sourceActions = sourceActions || []
    return function split (type, payload) {
      var action, prevState
      if (typeof type === 'string') {
        action = { seq: ++actionSeq, type: type }
        if (payload) action.payload = payload
        if (debug) observe('action', action, sourceActions)
        var split = createSplit(sourceActions.concat([action]))
        evolve(get, split, action)
      } else {
        action = { payload: type }
        prevState = state
        state = merge(state, action.payload)
        if (debug) observe('update', action, sourceActions, prevState)
        render(atom)
      }
    }
  }

  function observe (type, action, sourceActions, prevState) {
    var info = { type: type, action: action, sourceActions: sourceActions, atom: atom }
    if (prevState) info.prevState = prevState
    debug(info)
  }
}
