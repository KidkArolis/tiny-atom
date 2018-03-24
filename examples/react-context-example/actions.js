module.exports = {
  increment: (get, split, payload) => {
    split({ count: get().count + payload })
  },

  decrement: (get, split, payload) => {
    split({ count: get().count - payload })
  },

  asyncIncrement: (get, split, payload) => {
    split('asyncIncrementNested', payload)
  },

  asyncIncrementNested: (get, split, payload) => {
    split('increment', payload)
    setTimeout(() => {
      split({
        count: get().count + payload,
        extra: (get().extra || 'a') + 'a'
      })
      setTimeout(() => {
        split('decrement', 1)
      }, 1000)
    }, 1000)
  },

  track: (get, split, payload) => {
    // track is a side effect, no store updates
  }
}
