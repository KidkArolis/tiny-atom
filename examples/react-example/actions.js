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
    set({ todo: { items: nextItems, input: '' } }, input)
    dispatch('hideHint')
    dispatch('trackEvent', { type: 'added' })
  },

  completeItem: ({ get, set, dispatch }, index) => {
    const { items } = get().todo
    const nextItems = items.filter((item, i) => i !== index)
    set({ todo: { items: nextItems } }, `completed item ${index}`)
    dispatch('trackEvent', { user: 'anonymous', type: 'completed' })
  },

  updateItem: ({ get, set }, input) => {
    set({ todo: { ...get().todo, input } }, { silence: true })
  },

  showHint: ({ set }) => {
    set({ hint: { show: true } })
  },

  hideHint: ({ set }) => {
    set({ hint: { show: false } })
  },

  trackEvent: ({ get, set }, event) => {
    const { events } = get().analytics
    const nextEvents = events.concat([event])
    set(
      {
        analytics: {
          events: nextEvents,
        },
      },
      event.type
    )
  },
}
