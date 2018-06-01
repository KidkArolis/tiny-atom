module.exports = function createEvolve (actions) {
  const registry = { '': Object.assign({}, actions) }

  return { evolve, add }

  function add (namespace, actions) {
    registry[namespace] = actions
  }

  function evolve ({ get, set, dispatch }, action) {
    const namespace = action.type.split('.').slice(0, -1).join('.')
    const root = { get, set, dispatch }
    if (namespace && registry[namespace]) {
      get = () => namespace.split('.').reduce((ref, segment) => ref[segment], get())
      set = (update) => set({ [namespace]: update })
      dispatch = (type, payload) => dispatch(`${namespace}.${type}`, payload)
    }
    registry.actions[action.type]({ get, set, dispatch, root }, action.payload)
  }
}
