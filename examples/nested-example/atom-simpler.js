const createCoreAtom = require('tiny-atom')

module.exports = function createAtom (options, initialState) {
  const subatoms = {}
  const actionRegistry = {}
  const evolveRegistry = {}
  const getter = options.get || ((obj, key) => obj[key])

  const atom = createCoreAtom(initialState, evolve, options)
  const root = createNestedAtom()
  Object.assign(root, atom, { root })
  return root

  function createNestedAtom (parent = atom, namespace = '', state, actions) {
    if (subatoms[namespace] && !state && !actions) return subatoms[namespace]

    const subatom = subatoms[namespace] = Object.assign(function subatom (name, state, actions) {
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
    if (actions && typeof actions === 'function') evolveRegistry[namespace] = actions
    else if (actions) Object.keys(actions).forEach(type => { actionRegistry[namespace ? `${namespace}.${type}` : type] = actions[type] })

    return namespace === '' && root ? root : subatom
  }

  function evolve (get, split, action) {
    if (evolveRegistry['']) return evolveRegistry[''](get, split, action, root)
    const namespace = action.type.split('.').slice(0, -1).join('.')
    if (namespace) {
      get = namespacedGet(get, namespace, getter)
      split = namespacedSplit(split, namespace)
    }
    if (evolveRegistry[namespace]) return evolveRegistry[namespace](get, split, action, root)
    if (!actionRegistry[action.type]) throw new Error(`Action '${action.type} not found'`)
    actionRegistry[action.type](get, split, action.payload, root)
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
