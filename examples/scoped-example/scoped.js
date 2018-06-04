const createAtom = require('tiny-atom')

module.exports = function scopedAtom (options) {
  options = Object.assign({}, options, { evolve })

  const atom = createAtom({}, {}, options)

  const fuse = atom.fuse
  atom.fuse = function (namespace, initialState, actions) {
    actions = Object.keys(actions).reduce((acc, action) => {
      acc[`${namespace}.${action}`] = actions[action]
      return acc
    }, {})
    fuse({ [namespace]: initialState }, actions)
  }

  function evolve ({ get, set, dispatch }, action, actions) {
    const namespace = action.type.split('.').slice(0, -1).join('.')
    const top = { get, set, dispatch }
    get = () => namespace.split('.').reduce((ref, segment) => ref[segment], top.get())
    set = (update) => top.set({ [namespace]: update })
    dispatch = (type, payload) => top.dispatch(`${namespace}.${type}`, payload)
    actions[action.type]({ get, set, dispatch, top }, action.payload)
  }

  return atom
}
