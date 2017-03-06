/**
 * Minimal state management.
 *
 * const evolve = (get, set, action) => set({ counter: get().counter + 1 })
 * const atom = createAtom({ counter: 1 }, evolve, render)
 *
 * atom.get() // { counter: 1 }
 * atom.split('increment') // pass action
 * atom.split('increment', { by: 2 }) // pass action with payload
 * atom.split({ counter: 0 }) // set new state value directly, extends
 *
 */
module.exports = function createAtom (initialState, evolve, render) {
  var state = initialState || {}
  var atom = { get: get, split: split }
  return atom

  function get () {
    return state
  }

  function set (nextState) {
    state === nextState
      ? state = nextState
      : state = Object.assign({}, state, nextState)
    render && render(atom)
    return state
  }

  function split (type, payload) {
    if (typeof type === 'string') {
      var action = { type: type, payload: payload }
      evolve(get, set, action)
    } else {
      set(type)
    }
  }
}
