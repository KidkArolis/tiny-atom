function defaultIsEqual (a, b) {
  return a === b
}

function isShallowlyEqual (isEqual, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false
  }

  for (let i = 0; i < prev.length; i++) {
    if (!isEqual(prev[i], next[i])) {
      return false
    }
  }

  return true
}

function memoize (fn, isEqual = defaultIsEqual) {
  let lastArgs = null
  let lastResult = null
  return (...args) => {
    if (!isShallowlyEqual(isEqual, lastArgs, args)) {
      lastResult = fn(...args)
    }
    lastArgs = args
    return lastResult
  }
}

module.exports = function createSelectorCreator (selectors, isEqual) {
  return function createSelector (dependencies) {
    if (typeof dependencies === 'function') return dependencies
    const resultFn = dependencies.pop()
    const memoizedResultFn = memoize(resultFn, isEqual)
    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
    return memoize((...args) => {
      const params = dependencies.map(d => {
        console.log(d, selectors[d])
        if (!selectors[d]) throw new Error(`Selector ${d} not found`)
        return selectors[d](...args)
      })
      return memoizedResultFn(...params)
    })
  }
}
