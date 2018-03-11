module.exports = function deepMerge (state, update) {
  if (typeof update === 'undefined') return state
  if (!isObject(update)) return update
  return Object.keys(update).reduce((acc, key) => {
    acc[key] = deepMerge(acc[key], update[key])
    return acc
  }, state || {})
}

function isObject (obj) {
  return typeof obj === 'object' &&
    Object.prototype.toString.call(obj) === '[object Object]'
}
