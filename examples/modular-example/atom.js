module.exports = function createAtom (options) {
  const registry = {}
  const atom = createAtom({}, evolve, options)
  return Object.assign(atom, { fuse })

  function fuse ({ state, actions }) {
    Object.assign(registry, actions)
    atom.split(state)
  }

  function evolve (get, split, action) {
    registry.actions[action.type](get, split, action.payload)
  }
}
