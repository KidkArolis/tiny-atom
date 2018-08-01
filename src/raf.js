function getRequestAnimationFrame () {
  if (typeof window === 'undefined') {
    return callback => callback()
  }

  const polyfill = (() => {
    let clock = Date.now()
    return (callback) => {
      const currentTime = Date.now()
      if (currentTime - clock > 16) {
        clock = currentTime
        callback(currentTime)
      } else {
        return setTimeout(() => {
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

function getCancelAnimationFrame () {
  if (typeof window === 'undefined') {
    return () => {}
  }
  return window.cancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    clearTimeout || (() => {})
}

module.exports = function raf (fn) {
  const requestAnimationFrame = getRequestAnimationFrame()
  const cancelAnimationFrame = getCancelAnimationFrame()

  let requested = false
  let reqId

  return function rafed (...args) {
    if (!requested) {
      requested = true
      reqId = requestAnimationFrame(() => {
        if (requested) {
          requested = false
          fn(...args)
        }
      })
    }

    return function cancel () {
      cancelAnimationFrame(reqId)
      requested = false
    }
  }
}
