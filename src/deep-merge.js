module.exports = function deepMerge (state, update) {
  const merged = Object.assign({}, state, update)
  Object.keys(update).forEach(key => {
    if (state &&
        update &&
        update[key] !== state[key] &&
        isObject(update[key]) &&
        isObject(state[key])
    ) {
      merged[key] = deepMerge(state[key], update[key])
    }
  })
  return merged
}

function isObject (obj) {
  return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]'
}
