/**
 * Minimal state management.
 *
 * const evolve = (get, set, action) => set({ count: get().count + 1 })
 * const render = (atom, details) => console.log(details, atom.get())
 * const atom = createAtom({ count: 1 }, evolve, render)
 *
 * atom.get() // { count: 1 }
 * atom.split('increment') // pass action
 * atom.split('increment', { by: 2 }) // pass action with payload
 * atom.split({ count: 0 }) // set new state value directly, extends
 */
module.exports = function createAtom (initialState, evolve, render, merge) {
  var actionCount = 0
  var state = initialState || {}
  merge = merge || Object.assign
  var atom = { get: get, split: split }
  return atom

  function get () {
    return state
  }

  function createSet (id, action) {
    return function set (nextState) {
      state === nextState
        ? state = nextState
        : state = merge({}, state, nextState)
      render && render(atom, { id: id, action: action })
      return state
    }
  }

  function split (type, payload) {
    if (typeof type !== 'string') {
      payload = type
      type = null
    }
    var action = { type: type, payload: payload }
    var set = createSet(++actionCount, action)
    action.type
      ? evolve(get, set, action)
      : set(action.payload)
  }
}
