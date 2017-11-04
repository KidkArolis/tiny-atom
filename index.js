/**
 * Minimal state management.
 *
 * const evolve = (get, split, action) => split({ count: get().count + 1 })
 * const render = (atom, details) => console.log(details, atom.get())
 * const atom = createAtom({ count: 1 }, evolve, render)
 *
 * atom.get() // { count: 1 }
 * atom.split('increment') // action
 * atom.split('increment', { by: 2 }) // action with payload
 * atom.split({ count: 0 }) // update state directly
 */
module.exports = function createAtom (initialState, evolve, render, options) {
  options = options || {}
  var actionSeq = 0
  var state = initialState || {}
  var merge = options.merge || defaultMerge
  var log = options.log
  var atom = { get: get, split: createSplit() }
  return atom

  function defaultMerge (prev, next) {
    return Object.assign({}, prev, next)
  }

  function get () {
    return state
  }

  function set (nextState, action, seq) {
    var prevState = state
    state = merge(state, nextState)
    action = action || { payload: nextState }
    if (log) {
      console.log(`(${seq}) ${(action.fn ? action.fn.name : action.type) || '--'} { ${Object.keys(nextState || {}).join(', ')} }`, {
        action: action || {},
        prevState: prevState,
        patch: nextState,
        currState: atom.get()
      })
    }
    render && render(atom, {
      seq: seq,
      action: action,
      update: nextState,
      prev: prevState
    })
    return state
  }

  function createSplit (sourceAction, seq) {
    return function split (type, payload) {
      if (typeof type === 'function') {
        // actionSeq++
        // return type(get, createSplit({ name: type.name || 'anonymous', fn: type }, seq))
        actionSeq++
        evolve(get, createSplit(type, actionSeq), type)
      } else if (typeof type !== 'string') {
        if (!sourceAction) actionSeq++
        return set(type, sourceAction, seq || actionSeq)
      } else {
        actionSeq++
        var action = { type: type, payload: payload }
        evolve(get, createSplit(action, actionSeq), action)
      }
    }
  }
}
