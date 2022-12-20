module.exports = {
  todo: {
    state: {
      items: ['learn tiny-atom', 'use tiny-atom', 'star tiny-atom'],
      input: '',
    },
    actions: {
      add: ({ get, set, dispatch, top }, payload) => {
        const items = get().items.concat([get().input])
        set({ items, input: '' })
        top.dispatch('hint.hide')
        top.dispatch('analytics.track', { type: 'added' })
      },
      done: ({ get, set, dispatch, top }, index) => {
        const items = get().items.filter((item, i) => i !== index)
        set({ items })
        top.dispatch('analytics.track', { type: 'removed' })
      },
      update: ({ get, set, dispatch }, input) => {
        set({ input })
      },
    },
  },

  hint: {
    state: {
      text: 'Type + hit enter',
      show: true,
    },
    actions: {
      show: ({ get, set, dispatch }) => {
        set({ show: true })
      },
      hide: ({ get, set, dispatch }) => {
        set({ show: false })
      },
    },
  },

  analytics: {
    state: {
      events: [],
    },
    actions: {
      track: ({ get, set, dispatch }, event) => {
        set({ events: get().events.concat([event]) })
      },
    },
  },
}
