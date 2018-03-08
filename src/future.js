// For usage see:
// examples/future-example/atom.js
// examples/future-example/actions.js

const createAtomCore = require('./index')

module.exports = createAtom
module.exports.initialState = initialState
module.exports.evolve = evolve
module.exports.assignActions = assignActions

function createAtom (actions, options, state = {}) {
  const cache = {}
  actions = Object.assign({}, actions)
  const atom = createAtomCore(
    initialState(state, actions, options),
    evolve(actions, cache, options),
    options
  )
  assignActions(atom.split, actions)
  atom.fuse = fuse(atom, actions, cache)
  return atom
}

function initialState (state, actions, options) {
  if (options.merge) {
    return Object.keys(actions).reduce((state, namespace) => {
      const pack = actions[namespace]
      return typeof pack === 'function' ? state : options.merge(state, { [namespace]: pack.state })
    }, state)
  } else {
    return mapObj(actions, pack => typeof pack === 'function' ? null : pack.state)
  }
}

function evolve (actions, cache, options) {
  return function evolve (get, split, action) {
    if (action.type.indexOf('.') === -1) {
      if (options.strict) throw new Error('Invalid action, all actions need to be namespaced')
      if (!actions[action.type]) throw new Error(`No such action '${action.type}'`)
      actions[action.type](get, split, action.payload)
      return
    }

    const [pack, type] = action.type.split('.')

    if (!actions[pack]) throw new Error(`No such action pack '${pack}'`)
    if (!actions[pack].actions) throw new Error(`Action pack '${pack}' malformed, missing actions object`)
    if (!actions[pack].actions[type]) throw new Error(`No such action '${pack}.${type}'`)

    if (cache[pack]) {
      get = cache[pack].get
      split = cache[pack].split
    } else {
      get = namespacedGet(pack, get)
      split = assignActions(namespacedSplit(pack, split), actions)
      if (!options.debug) {
        cache[pack] = { get, split }
      }
    }

    actions[pack].actions[type](get, split, action.payload)
  }
}

function namespacedGet (pack, get) {
  return (namespace) => namespace
    ? namespace.root ? get()[namespace] : get()
    : get()[pack]
}

function namespacedSplit (pack, split) {
  return (...args) => typeof args[0] === 'string'
    ? split(...args)
    : split({ [pack]: args[0] })
}

function assignActions (split, actions) {
  return Object.assign(split, createActionPacks(split, actions))
}

function createActionPacks (split, actions, options) {
  return mapObj(actions, (pack, namespace) => {
    // support for plain action objects that people might have used
    if (typeof pack === 'function') {
      if (options.strict) throw new Error(`Malformed action pack ${namespace} expected object, but found a function`)
      return payload => split(`${namespace}`, payload)
    } else {
      return mapObj(pack.actions, (impl, action) => payload => split(`${namespace}.${action}`, payload))
    }
  })
}

function mapObj (obj, fn) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = fn(obj[key], key)
    return acc
  }, {})
}

function fuse (atom, actions, cache) {
  return function fuse (moreActions) {
    Object.assign(actions, moreActions)
    assignActions(atom.split, actions)
    Object.keys(cache).forEach(key => {
      delete cache[key]
    })
  }
}
