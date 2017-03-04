/**
 * Minimal state management.
 *
 * const reducer = (get, set, action) => set({ counter: get().counter + 1 })
 * const atom = createAtom({ counter: 1 }, reduce, render)
 *
 * atom.get() // { counter: 1 }
 * atom.split('increment') // pass action
 * atom.split('increment', { by: 2 }) // pass action with payload
 * atom.split({ counter: 0 }) // set new state value directly, extends
 *
 */
module.exports = function createAtom (initialState, reduce, onChange) {
  var state = initialState || {}

  function get () {
    return state
  }

  function set (nextState) {
    state === nextState
      ? state = nextState
      : state = Object.assign({}, state, nextState)
    onChange && onChange(state)
    return state
  }

  function split (type, payload) {
    if (typeof type === 'string') {
      var action = { type: type, payload: payload }
      reduce(get, set, action)
    } else {
      set(type)
    }
  }

  return { get: get, split: split }
}
