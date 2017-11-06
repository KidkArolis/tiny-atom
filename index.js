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
  var atom = { get: get, split: createSplit() }
  var debug = options.debug
  return atom

  function defaultMerge (prev, next) {
    return Object.assign({}, prev, next)
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
        observe('action', action, sourceActions)
        var split = createSplit((sourceActions || []).concat([action]))
        evolve(get, split, action)
      } else {
        action = { payload: type }
        prevState = state
        state = merge(state, action.payload)
        observe('update', action, sourceActions, prevState)
        render(atom)
        return state
      }
    }
  }

  function observe (type, action, sourceActions, prevState) {
    if (debug) {
      var info = { type: type, action: action, sourceActions: sourceActions, atom: atom }
      if (prevState) info.prevState = prevState
      debug(info)
    }
  }
}
