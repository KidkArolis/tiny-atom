const createCoreAtom = require('tiny-atom')

module.exports = function createFractalAtom (options = {}) {
  const registry = { subatoms: {}, actions: {} }

  options = Object.assign({}, options, { evolve })

  const atom = createCoreAtom({}, {}, options)
  const root = createNestedAtom()
  Object.assign(root, atom, { root, registry })
  return root

  function createNestedAtom (parent = atom, namespace = '', state, actions) {
    if (registry.subatoms[namespace] && !state && !actions) {
      return registry.subatoms[namespace]
    }

    const subatom = registry.subatoms[namespace] = function subatom (name, state, actions) {
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
      get: namespaceGet(atom.get, namespace),
      set: namespaceSet(atom.fuse, namespace),
      dispatch: namespaceDispatch(atom.dispatch, namespace)
    })

    if (state) {
      atom.fuse(namespace ? setIn({}, namespace.split('.'), state) : state)
    }

    if (actions) {
      Object.keys(actions).forEach(type => {
        registry.actions[namespace ? `${namespace}.${type}` : type] = actions[type]
      })
    }

    return namespace === '' && root ? root : subatom
  }

  function evolve ({ get, set, dispatch }, action) {
    const namespace = action.type.split('.').slice(0, -1).join('.')

    if (namespace) {
      get = Object.assign(namespaceGet(get, namespace), { root: get })
      set = Object.assign(namespaceSet(set, namespace), { root: set })
      dispatch = Object.assign(namespaceDispatch(dispatch, namespace), { root: dispatch })
    }

    if (!registry.actions[action.type]) {
      throw new Error(`Action '${action.type} not found'`)
    }

    registry.actions[action.type]({ get, set, dispatch }, action.payload)
  }
}

function namespaceGet (get, namespace) {
  return () => namespace.split('.').reduce((ref, segment) => ref[segment], get())
}

function namespaceSet (set, namespace) {
  return (update) => set(setIn({}, namespace.split('.'), update))
}

function namespaceDispatch (dispatch, namespace) {
  return (type, payload) => dispatch(`${namespace}.${type}`, payload)
}

function setIn (obj, path, val) {
  return path.reduce((ref, segment, i) => {
    ref[segment] = ref[segment] || {}
    if (i < path.length - 1) return ref[segment]
    ref[segment] = val
    return obj
  }, obj)
}
