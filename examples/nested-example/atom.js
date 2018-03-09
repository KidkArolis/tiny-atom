const createCoreAtom = require('tiny-atom')

module.exports = function createAtom (state, options) {
  const subatoms = {}
  const actionRegistry = {}

  const getter = options.get || ((obj, key) => obj[key])
  const atom = createCoreAtom(state, evolve(actionRegistry, getter), options)
  const root = createNestedAtom(atom)
  root.root = root
  return root

  function createNestedAtom (parent, namespace, state, actions) {
    const path = getPath(parent, namespace)

    if (subatoms[path]) {
      return subatoms[path]
    }

    const subatom = Object.assign(function subatom (namespace, state, actions) {
      return createNestedAtom(subatom, namespace, state, actions)
    }, {
      namespace: namespace,
      parent: parent,
      root: root,
      get: namespacedGet(atom.get, path, getter),
      split: namespacedSplit(atom.split, path)
    })

    if (!namespace) {
      subatom.observe = atom.observe
    }

    if (namespace && state && actions) {
      actionRegistry[path] = actions
      atom.split({ [path]: state || {} })
    }

    if (path) {
      subatoms[path] = subatom
    }

    assignActions(subatom.split, actions)
    if (root) assignActions(root.split, actionRegistry, true)
    if (root) assignGetters(root.get, root, Object.keys(subatoms))

    return subatom
  }

  function evolve (actions, getter) {
    return function evolve (get, split, action) {
      const fullPath = action.type.split('.')
      const type = fullPath.pop()
      const path = fullPath.join('.')

      get = assignGetters(namespacedGet(get, path, getter), root, Object.keys(actions))
      split = assignActions(namespacedSplit(split, path), actions, true, split)

      actions[path][type](get, split, action.payload)
    }
  }
}

function getPath (node, namespace) {
  let path = []
  if (namespace) path.unshift(namespace)
  if (node.parent) {
    while (node.parent) {
      if (node.namespace) {
        path.unshift(node.namespace)
      }
      node = node.parent
    }
  }
  return path.join('.')
}

function namespacedGet (get, path, getter) {
  return () => {
    if (path) return getter(get(), path)
    return get()
  }
}

function namespacedSplit (split, path) {
  return (...args) => {
    if (typeof args[0] === 'string') {
      return split(path ? [path, args[0]].join('.') : args[0], ...args.slice(1))
    } else {
      if (!path) {
        return split(...args)
      }
      split({
        [path]: args[0]
      })
    }
  }
}

function assignGetters (get, root, namespaces) {
  namespaces.forEach(namespace => {
    set(get, namespace, () => {
      let res = root
      namespace.split('.').forEach(part => {
        res = res(part)
      })
      return res.get()
    })
  })
  return get
}

function assignActions (split, actions, isRegistry, unscopedSplit) {
  if (actions) {
    if (isRegistry) {
      mapObj(actions, (actions, namespace) => {
        mapObj(actions, (impl, type) => {
          const key = [namespace, type].join('.')
          set(split, key, payload => (unscopedSplit || split)(key, payload))
        })
      })
    } else {
      mapObj(actions, (impl, key) => {
        set(split, key, payload => (unscopedSplit || split)(key, payload))
      })
    }
  }
  return split
}

function mapObj (obj, fn) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key] = fn(obj[key], key)
    return acc
  }, {})
}

function set (obj, key, val) {
  let ref = obj
  const parts = key.split('.')
  parts.forEach((part, i) => {
    ref[part] = ref[part] || {}
    if (i === parts.length - 1) {
      ref[part] = val
    } else {
      ref = ref[part]
    }
  })
}
