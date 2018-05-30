module.exports = {
  increment: ({ get, set, dispatch }, payload) => {
    set({ count: get().count + payload })
    if (Math.random() > 0.9) {
      set({ stable: Math.random() })
    }
  },

  decrement: ({ get, set, dispatch }, payload) => {
    set({ count: get().count - payload })
  },

  asyncIncrement: ({ get, set, dispatch }, payload) => {
    dispatch('asyncIncrementNested', payload)
  },

  asyncIncrementNested: ({ get, set, dispatch }, payload) => {
    dispatch('increment', payload)
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
  },

  rnd: ({ set }) => {
    set({ rnd: Math.random() })
  }
}
