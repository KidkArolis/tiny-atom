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

module.exports = function raf (fn) {
  const requestAnimationFrame = getRequestAnimationFrame()

  let scheduled = false
  let requested = false

  return function rafed (...args) {
    if (scheduled) {
      requested = true
      return
    }

    fn(...args)

    scheduled = true
    requestAnimationFrame(() => {
      scheduled = false
      if (requested) {
        requested = false
        fn(...args)
      }
    })
  }
}
