/**
 * Minimalistic state management.
 *
 * const reducer = (get, set, action) => set({ counter: get().counter + 1 })
 * const atom = createAtom({ counter: 1 }, reduce, render)
 *
 * atom.get() // { counter: 1 }
 * atom.split('increment') // pass action
 * atom.split('increment', { by: 2 }) // pass action with payload
 * atom.split({ counter: 0 }) // set values directly
 *
 */
module.exports = function createAtom (initialState = {}, reduce, onChange) {
  let state = initialState

  return {
    get: function get () {
      return state
    },

    split: function split (...args) {
      if (typeof args[0] === 'string') {
        let action = { type: args[0], payload: args[1] }
        reduce(() => state, set, action)
      } else {
        set(args[0])
      }

      function set (nextState) {
        state = Object.assign({}, state, nextState)
        onChange && onChange(state)
        return state
      }
    }
  }
}
