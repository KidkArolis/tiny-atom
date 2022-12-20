module.exports.initialState = {
  todo: {
    items: ['learn tiny-atom', 'use tiny-atom', 'star tiny-atom'],
    input: '',
  },

  hint: {
    text: 'Type + hit enter',
    show: true,
  },

  analytics: {
    events: [],
  },
}

module.exports.actions = {
  addItem: ({ get, set, dispatch }, payload) => {
    const { items, input } = get().todo
    const nextItems = items.concat([input])
    set({ todo: { items: nextItems, input: '' } })
    dispatch('hideHint')
    dispatch('trackEvent', { type: 'added' })
  },

  completeItem: ({ get, set, dispatch }, index) => {
    const { items } = get().todo
    const nextItems = items.filter((item, i) => i !== index)
    set({ todo: { items: nextItems } })
    dispatch('trackEvent', { user: 'anonymous', type: 'completed' })
  },

  updateItem: ({ set }, input) => {
    set({ todo: { input } })
  },

  showHint: ({ get, set }) => {
    if (!get().hint.show) set({ hint: { show: true } })
  },

  hideHint: ({ get, set }) => {
    if (get().hint.show) set({ hint: { show: false } })
  },

  trackEvent: ({ get, set }, event) => {
    const { events } = get().analytics
    const nextEvents = events.concat([event])
    set({
      analytics: {
        events: nextEvents,
      },
    })
  },
}
