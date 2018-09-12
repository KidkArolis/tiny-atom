const immediate = callback => callback()
const noop = () => {}

function getRequestAnimationFrame () {
  if (typeof window === 'undefined') return immediate
  return window.requestAnimationFrame || immediate
}

function getCancelAnimationFrame () {
  if (typeof window === 'undefined') noop
  return window.cancelAnimationFrame || noop
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
