const createAtom = require('tiny-atom')
const merge = require('tiny-atom/deep-merge')
const debug = require('tiny-atom/log')

const subatoms = {}
const actions = {}
const atom = createAtom({}, evolve, { merge, debug })

function createNestedAtom (parent, name, pack) {
  const path = getPath(parent, name)

  if (subatoms[path]) {
    return subatoms[path]
  }

  const subatom = {
    name: name,
    parent: parent,
    get: namespacedGet(atom.get, path),
    split: namespacedSplit(atom.split, path),
    slice: function slice (name, pack) {
      return createNestedAtom(subatom, name, pack)
    }
  }

  if (name && pack) {
    actions[path] = pack.actions
    parent.split({ [name]: pack.state || {} })
  }

  if (path) {
    subatoms[path] = subatom
  }

  return subatom
}

module.exports = createNestedAtom(atom)

function getPath (node, name) {
  let path = []
  if (name) path.unshift(name)
  if (node.parent) {
    while (node.parent) {
      if (node.name) {
        path.unshift(node.name)
      }
      node = node.parent
    }
  }
  return path.join('.')
}

function evolve (get, split, action) {
  const fullPath = action.type.split('.')
  const type = fullPath.pop()
  const path = fullPath.join('.')

  get = namespacedGet(get, path)
  split = namespacedSplit(split, path)

  actions[path][type](get, split, action.payload)
}

function namespacedGet (get, path) {
  return () => {
    let res = get()
    if (path) {
      path.split('.').forEach(part => {
        if (res) {
          res = res[part]
        }
      })
    }
    return res
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
      const update = {}
      let subupdate = update
      let parts = path.split('.')
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          subupdate[part] = args[0]
        } else {
          subupdate[part] =  {}
          subupdate = subupdate[part]
        }
      })
      return split(update)
    }
  }
}
