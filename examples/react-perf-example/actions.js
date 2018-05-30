module.exports = {
  increment: ({ get, set, dispatch }, payload) => {
    set({ count: get().count + payload })
  },

  decrement: ({ get, set, dispatch }, payload) => {
    set({ count: get().count - payload })
  },

  asyncIncrement: ({ get, set, dispatch }, payload) => {
    dispatch('asyncIncrementNested', payload)
  },

  asyncIncrementNested: ({ get, set, dispatch }, payload) => {
    set('increment', payload)
    setTimeout(() => {
      set({
        count: get().count + payload,
        extra: (get().extra || 'a') + 'a'
      })
      setTimeout(() => {
        dispatch('decrement', 1)
      }, 1000)
    }, 1000)
  },

  track: ({ get, set }, payload) => {
    // track is a side effect, no store updates
  }
}
