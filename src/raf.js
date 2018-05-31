function getRequestAnimationFrame () {
  if (typeof window === 'undefined') {
    return (callback) => callback()
  }

  const polyfill = (() => {
    let clock = Date.now()
    return (callback) => {
      const currentTime = Date.now()
      if (currentTime - clock > 16) {
        clock = currentTime
        callback(currentTime)
      } else {
        setTimeout(() => {
          polyfill(callback)
        }, 0)
      }
    }
  })()

  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    polyfill
}

module.exports = function raf (fn, options = {}) {
  const requestAnimationFrame = getRequestAnimationFrame()

  if (typeof options.initial === 'undefined') {
    options.initial = true
  }

  let scheduled = false
  let requested = false
  let cancelled = false

  function cancel () {
    cancelled = true
  }

  return function rafed (...args) {
    if (scheduled) {
      requested = true
      return cancel
    }

    if (options.initial) {
      fn(...args)
    } else {
      requested = true
    }

    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      if (requested) {
        requested = false
        if (!cancelled) {
          fn(...args)
        }
      }
    })

    return cancel
  }
}
