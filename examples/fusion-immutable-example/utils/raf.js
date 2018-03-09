module.exports = function raf (fn) {
  let scheduled = false
  let requested = false

  return function rafed (...args) {
    if (scheduled) {
      requested = true
      return
    }

    fn(...args)

    scheduled = true
    window.requestAnimationFrame(() => {
      scheduled = false
      if (requested) {
        fn(...args)
      }
    })
  }
}
