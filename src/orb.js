// For usage see:
// examples/future-example/atom.js
// examples/future-example/actions.js

const createAtomCore = require('./index')

module.exports = createAtom

function createAtom (initialActions, options, state = {}) {
  if (!isObject(initialActions)) throw new Error('First arg should be an object with action packs')
  if (options && !isObject(initialActions)) throw new Error('Second arg should be an object with options')

  options = Object.assign({}, options)
  options.get = options.get || ((obj, key) => obj[key])

  const cache = {}
  const actions = {}
  const initialState = createInitialState(state, initialActions, options)
  const evolve = createEvolve(actions, cache, options)
  const atom = createAtomCore(initialState, evolve, options)
  atom.fuse = fuse(atom, actions, cache, options)
  atom.fuse(initialActions)
  return atom
}

function createInitialState (state, actions, options) {
  if (options.merge) {
    return Object.keys(actions).reduce((state, namespace) => {
      const pack = actions[namespace]
      return typeof pack === 'function' ? state : options.merge(state, { [namespace]: pack.state })
    }, state)
  } else {
    return Object.assign({}, state, mapObj(actions, pack => typeof pack === 'function' ? null : pack.state))
  }
}

function createEvolve (actions, cache, options) {
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
      get = assignGetters(namespacedGet(pack, get, options), get, actions, options)
      split = assignActions(namespacedSplit(pack, split), actions)
      if (!options.debug) {
        cache[pack] = { get, split }
      }
    }

    actions[pack].actions[type](get, split, action.payload)
  }
}

function namespacedGet (pack, get, options) {
  return () => options.get(get(), pack)
}

function assignGetters (get, rootGet, actions) {
  return Object.assign(get, createGetters(rootGet, actions))
}

function createGetters (get, actions, options) {
  return mapObj(actions, (pack, namespace) => {
    return () => options.get(get(), namespace)
  })
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
    // support for plain action objects that people might have used in non strict mode
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

function fuse (atom, actions, cache, options) {
  let initial = true
  return function fuse (moreActions) {
    Object.assign(actions, moreActions)
    assignGetters(atom.get, atom.get, actions, options)
    assignActions(atom.split, actions)
    Object.keys(cache).forEach(key => {
      delete cache[key]
    })
    if (!initial) {
      atom.split(createInitialState(atom.get(), moreActions, options))
    } else {
      initial = false
    }
  }
}

function isObject (obj) {
  return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]'
}
