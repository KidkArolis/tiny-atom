const createCoreAtom = require('tiny-atom')
const merge = require('tiny-atom/deep-merge')

module.exports = function createFractalAtom (options, initialState) {
  options = Object.assign({ merge }, options)
  const registry = { subatoms: {}, actions: {}, evolvers: {} }
  const getter = options.get || ((obj, key) => obj[key])
  const atom = createCoreAtom(initialState, evolve, options)
  const root = createNestedAtom()
  Object.assign(root, atom, { root, registry })
  return root

  function createNestedAtom (parent = atom, namespace = '', state, actions) {
    if (registry.subatoms[namespace] && !state && !actions) {
      return registry.subatoms[namespace]
    }

    const subatom = registry.subatoms[namespace] = function subatom (name, state, actions) {
      if (!name && !state) {
        throw new Error('Call with (name, state, actions | evolve) or (state, actions | evolve)')
      }

      if (typeof name !== 'string') {
        actions = state
        state = name
        name = ''
      }

      if (subatom.namespace) {
        name = `${subatom.namespace}.${name}`
      }

      return createNestedAtom(subatom, name, state, actions)
    }

    Object.assign(subatom, {
      root: root,
      namespace: namespace,
      get: namespacedGet(atom.get, namespace, getter),
      split: namespacedSplit(atom.split, namespace)
    })

    if (state) atom.split(namespace ? setIn({}, namespace.split('.'), state) : state)
    if (actions && typeof actions === 'function') {
      registry.evolvers[namespace] = actions
    } else if (actions) {
      Object.keys(actions).forEach(type => {
        registry.actions[namespace ? `${namespace}.${type}` : type] = actions[type]
      })
    }

    return namespace === '' && root ? root : subatom
  }

  function evolve (get, split, action) {
    // there's a custom alternative root evolve, use that
    if (registry.evolvers['']) {
      return registry.evolvers[''](get, split, action)
    }

    // separate the namespace from action type
    const namespace = action.type.split('.').slice(0, -1).join('.')
    if (namespace) {
      get = Object.assign(namespacedGet(get, namespace, getter), { root: get })
      split = Object.assign(namespacedSplit(split, namespace), { root: split })
    }

    // it's an evolve fn
    if (registry.evolvers[namespace]) {
      return registry.evolvers[namespace](get, split, action)
    }

    // it's an action fn
    if (!registry.actions[action.type]) {
      throw new Error(`Action '${action.type} not found'`)
    }

    registry.actions[action.type](get, split, action.payload)
  }
}

function namespacedGet (get, namespace, getter) {
  const segments = namespace.split('.')
  return () => segments.reduce((ref, segment) => getter(ref, segment), get())
}

function namespacedSplit (split, namespace) {
  return (...args) => typeof args[0] === 'string'
    ? split(`${namespace}.${args[0]}`, ...args.slice(1))
    : split(setIn({}, namespace.split('.'), args[0]))
}

function setIn (obj, path, val) {
  return path.reduce((ref, segment, i) => {
    ref[segment] = ref[segment] || {}
    if (i < path.length - 1) return ref[segment]
    ref[segment] = val
    return obj
  }, obj)
}
