const createAtomCore = require('tiny-atom')

module.exports = function createAtom (packs, options) {
  const atom = createAtomCore(initialState(packs), evolve(packs), options)
  assignGetters(packs, atom.get)
  assignActions(packs, atom.split)
  return atom

  function initialState (packs) {
    return mapObj(packs, pack => pack.state)
  }

  function evolve (packs) {
    return function evolve (get, split, action) {
      const [pack, type] = action.type.split('.')
      get = assignGetters(packs, namespacedGet(pack, get), get)
      split = assignActions(packs, namespacedSplit(pack, split))
      packs[pack].actions[type](get, split, action.payload)
    }
  }

  function namespacedGet (pack, get) {
    return () => get()[pack]
  }

  function namespacedSplit (pack, split) {
    return (...args) => typeof args[0] === 'string'
      ? split(...args)
      : split({ [pack]: args[0] })
  }

  function assignGetters (packs, get, rootGet) {
    return Object.assign(get, mapObj(packs, (pack, namespace) => {
      return () => (rootGet || get)()[namespace]
    }))
  }

  function assignActions (packs, split) {
    return Object.assign(split, mapObj(packs, (pack, namespace) => {
      return mapObj(pack.actions, (impl, action) => {
        return payload => split(`${namespace}.${action}`, payload)
      })
    }))
  }

  function mapObj (obj, fn) {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = fn(obj[key], key)
      return acc
    }, {})
  }
}
