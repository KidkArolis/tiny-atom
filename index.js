/**
 * Minimal state management.
 *
 * const evolve = (get, split, action) => split({ count: get().count + 1 })
 * const render = (atom) => console.log(atom.get())
 * const atom = createAtom({ count: 1 }, evolve, render)
 *
 * atom.observe(atom => console.log(atom.get()))
 *
 * atom.get() // { count: 1 }
 * atom.split('increment') // action
 * atom.split('increment', { by: 2 }) // action with payload
 * atom.split({ count: 0 }) // update state directly
 */
module.exports = function createAtom (initialState, evolve, render, options) {
  if (typeof render !== 'function') {
    options = render
    render = null
  }
  options = options || {}
  evolve = evolve || function () {}
  var actionSeq = 0
  var listeners = []
  var state = initialState || {}
  var merge = options.merge || defaultMerge
  var debug = options.debug
  if (render) observe(render)
  var atom = { get: get, split: createSplit(), observe: observe }
  return atom

  function defaultMerge (state, update) {
    return Object.assign({}, state, update)
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

  function createSplit (sourceActions) {
    sourceActions = sourceActions || []
    return function split (type, payload) {
      var action, prevState
      if (typeof type === 'string') {
        action = { seq: ++actionSeq, type: type }
        if (typeof payload !== 'undefined') action.payload = payload
        if (debug) report('action', action, sourceActions)
        var split = debug ? createSplit(sourceActions.concat([action])) : atom.split
        evolve(get, split, action)
      } else {
        action = { payload: type }
        prevState = state
        state = merge(state, action.payload)
        if (debug) report('update', action, sourceActions, prevState)
        listeners.forEach(function (f) { f(atom) })
      }
    }
  }

  function report (type, action, sourceActions, prevState) {
    var info = { type: type, action: action, sourceActions: sourceActions, atom: atom }
    if (prevState) info.prevState = prevState
    debug(info)
  }
}
