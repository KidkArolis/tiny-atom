module.exports = function createEvolve (actions) {
  const registry = { '': Object.assign({}, actions) }

  return { evolve, fuse }

  function fuse (namespace, actions) {
    registry[namespace] = actions
  }

  function evolve (get, split, action) {
    const namespace = action.type.split('.').slice(0, -1).join('.')
    if (namespace && registry[namespace]) {
      get = Object.assign(namespacedGet(get, namespace), { root: get })
      split = Object.assign(namespacedSplit(split, namespace), { root: split })
    }
    registry.actions[action.type](get, split, action.payload)
  }

  function namespacedGet (get, namespace) {
    return () => namespace.split('.').reduce((ref, segment) => ref[segment], get())
  }

  function namespacedSplit (split, namespace) {
    return (...args) => typeof args[0] === 'string'
      ? split(`${namespace}.${args[0]}`, ...args.slice(1))
      : split({ [namespace]: args[0] })
  }
}
