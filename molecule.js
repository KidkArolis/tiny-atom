var createAtom = require('.')

module.exports = function createMolecule (render, options) {
  if (render && typeof render === 'object') {
    options = render
    render = null
  }
  if (!options) options = {}

  var _actions = {}
  var _startedEvolving = false

  var _debug = options.debug
  if (_debug) {
    options.debug = function debug () {
      if (!_startedEvolving) return
      _debug.apply(options, arguments)
    }
  }

  var _merge = options.merge
  if (_merge) {
    options.merge = function merge (state, update) {
      if (!_startedEvolving) return Object.assign({}, state, update)
      return _merge(state, update)
    }
  }

  function evolve (get, split, action) {
    _startedEvolving = true
    var fn = action.type in _actions
      ? _actions[action.type]
      : options.defaultEvolve || function () {}
    return fn(get, split, action)
  }

  function delayedRender (atom) {
    if (render && _startedEvolving) {
      render(atom)
    }
  }

  var atom = createAtom({}, evolve, delayedRender, options)

  var _split = atom.split
  atom.split = function split () {
    _startedEvolving = true
    return _split.apply(atom, arguments)
  }

  atom.registerInitialState = function registerInitialState (initialState) {
    if (_startedEvolving) throw new Error('The state of this molecule has already started evolving. You can no longer add initial states.')
    if (!initialState) initialState = {}
    Object.keys(initialState).forEach(function (key) {
      if (key in atom.get()) {
        throw new Error("Trying to add '" + key + "' to a molecule's initial state, but the state already has that key.")
      }
    })
    _split.call(atom, initialState)
  }

  atom.registerActions = function registerActions (actions) {
    if (_startedEvolving) throw new Error('The state of this molecule has already started evolving. You can no longer add actions.')
    if (!actions) actions = {}
    Object.keys(actions).forEach(function (key) {
      if (key in _actions) {
        throw new Error("Trying to add '" + key + "' to a molecule's actions, but that action already exist.")
      }
    })
    Object.assign(_actions, actions)
  }

  return atom
}
