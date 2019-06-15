function getRequestAnimationFrame() {
  if (typeof window === 'undefined') {
    return callback => callback()
  }

  const polyfill = callback => {
    return setTimeout(callback, 16)
  }

  return (
    window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || polyfill
  )
}

function getCancelAnimationFrame() {
  if (typeof window === 'undefined') {
    return () => {}
  }
  return window.cancelAnimationFrame || window.mozCancelAnimationFrame || clearTimeout || (() => {})
}

export function raf(fn) {
  const requestAnimationFrame = getRequestAnimationFrame()
  const cancelAnimationFrame = getCancelAnimationFrame()

  let requested = false
  let reqId

  return function rafed(...args) {
    if (!requested) {
      requested = true
      reqId = requestAnimationFrame(() => {
        if (requested) {
          requested = false
          fn(...args)
        }
      })
    }

    return function cancel() {
      cancelAnimationFrame(reqId)
      requested = false
    }
  }
}
