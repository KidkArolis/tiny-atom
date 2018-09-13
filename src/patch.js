function defaultEvolve (atom, action, actions) {
  if (!actions[action.type]) throw new Error(`Missing action: ${action.type}`)
  Object.assign(atom, { patch: (update) => atom.swap(patch(atom.get(), update)) })
  return actions[action.type](atom, action.payload, atom.context)
}

function patch (state, update) {
  if (typeof update === 'undefined') return state
  if (!isObject(update)) return update
  return Object.keys(update).reduce((acc, key) => {
    acc[key] = deepMerge(acc[key], update[key])
    return acc
  }, Object.assign({}, state))
}
