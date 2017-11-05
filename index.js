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
  render = render || function () {}
  var log = options.log
  var atom = { get: get, split: createSplit() }
  var debug = options.debug ? options.debug(atom) : null
  return atom

  function defaultMerge (prev, next) {
    return Object.assign({}, prev, next)
  }

  function get () {
    return state
  }

  function set (nextState, sourceActions) {
    var prevState = state
    state = merge(state, nextState)

    // var sourceAction = action
    // action = action || { payload: nextState }

    if (log) {
      console.groupCollapsed(`%c${!sourceActions.length ? '••%c%c' : '  '} ${sourceActions.map((s, i, list) => list.length - 1 === i ? `%c${s.type}%c` : s.type).join(' → ')} `, 'font-weight: normal', 'color: black; font-weight: bold;', 'color: black; font-weight: normal', nextState || '')
      console.log('actions', sourceActions || [])
      console.log('patch', nextState)
      console.log('prevState', prevState)
      console.log('currState', atom.get())
      console.groupEnd()
    }

    if (debug) {
      debug({ type: 'update', atom: atom, sourceActions: sourceActions, patch: nextState, prevState: prevState })
    }

    render(atom)

    return state
  }

  function createSplit (sourceActions) {
    return function split (type, payload) {
      actionSeq++
      if (typeof type === 'string') {
        var action = { type: type, payload: payload, seq: actionSeq }
        var split = createSplit((sourceActions || []).concat([action]))

        if (log) {
          console.groupCollapsed(`%c${!sourceActions ? '•' : ' '}• ${(sourceActions || []).concat([action]).map((s, i, list) => list.length - 1 === i ? `%c${s.type}%c` : s.type).join(' → ')}`, 'font-weight: normal', 'color: black; font-weight: bold;', 'color: black; font-weight: normal', action.payload || '')
          console.log('actions', (sourceActions || []).concat([action]))
          console.groupEnd()
        }

        if (debug) {
          debug({ type: 'action', atom: atom, action: action, sourceActions: sourceActions })
        }

        evolve(get, split, action)
      } else {
        var nextState = type
        return set(nextState, sourceActions || [])
      }
    }
  }
}
