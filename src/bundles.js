module.exports = function createBundles () {
  function fuse (bundle, atom) {
    const bundles = atom.bundles = atom.bundles || { map: {}, byAction: {} }
    // store the bundle
    bundles.map[bundle.slice] = bundle
    // index all the actions
    Object.keys(bundle.actions || {}).forEach(action => {
      if (bundles.byAction[action]) {
        throw new Error(`Action ${action} duplicated, exists in both ${bundles.byAction[action].slice} and ${bundle.slice}`)
      } else {
        bundles.byAction[action] = bundle
      }
    })
    // merge in the state
    atom.set({ [bundle.slice]: bundle.initialState })
  }

  function evolve ({ get: getRoot, set: setRoot, swap: swapRoot, dispatch }, { type, payload }, actions, atom) {
    const bundles = atom.bundles || {}
    const byAction = bundles.byAction || {}
    if (!byAction[type]) throw new Error(`Missing action ${type}`)
    const bundle = byAction[type]
    const action = bundle.actions[type]
    const get = () => getRoot()[bundle.slice]
    const set = (update) => setRoot({ [bundle.slice]: { ...get(), ...update } })
    const swap = (state) => setRoot({ [bundle.slice]: state })
    return action({ get, getRoot, set, swap, dispatch }, payload)
  }

  return { fuse, evolve }
}
