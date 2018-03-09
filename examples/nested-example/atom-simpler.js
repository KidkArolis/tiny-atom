const createCoreAtom = require('tiny-atom')

module.exports = function createAtom (options, initialState) {
  const registry = { subatoms: {}, actions: {}, evolvers: {} }
  const getter = options.get || ((obj, key) => obj[key])
  const atom = createCoreAtom(initialState, evolve, options)
  const root = createNestedAtom()
  Object.assign(root, atom, { root, registry })
  return root

  function createNestedAtom (parent = atom, namespace = '', state, actions) {
    if (registry.subatoms[namespace] && !state && !actions) return registry.subatoms[namespace]

    const subatom = registry.subatoms[namespace] = Object.assign(function subatom (name, state, actions) {
      if (!name && !state) throw new Error('Call with (name, state, actions | evolve) or (state, actions | evolve)')
      if (typeof name !== 'string') {
        actions = state
        state = name
        name = ''
      }
      return createNestedAtom(subatom, subatom.namespace ? `${subatom.namespace}.${name}` : `${name}`, state, actions)
    }, {
      root: root,
      namespace: namespace,
      get: namespacedGet(atom.get, namespace, getter),
      split: namespacedSplit(atom.split, namespace)
    })

    if (state) atom.split(namespace ? { [namespace]: state } : state)
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
    if (registry.evolvers['']) return registry.evolvers[''](get, split, action, root)
    const namespace = action.type.split('.').slice(0, -1).join('.')
    if (namespace) {
      get = namespacedGet(get, namespace, getter)
      split = namespacedSplit(split, namespace)
    }
    if (registry.evolvers[namespace]) return registry.evolvers[namespace](get, split, action, root)
    if (!registry.actions[action.type]) throw new Error(`Action '${action.type} not found'`)
    registry.actions[action.type](get, split, action.payload, root)
  }
}

function namespacedGet (get, namespace, getter) {
  return () => getter(get(), namespace)
}

function namespacedSplit (split, namespace) {
  return (...args) => typeof args[0] === 'string'
    ? split(`${namespace}.${args[0]}`, ...args.slice(1))
    : split({ [namespace]: args[0] })
}
