module.exports.initialState = {
  count: 0,

  todo: {
    items: ['learn tiny-atom', 'use tiny-atom', 'star tiny-atom'],
    input: ''
  },

  hint: {
    text: 'Type + hit enter',
    show: true
  },

  analytics: {
    events: []
  }
}

module.exports.actions = {
  addItem: ({ get, set, actions }, payload) => {
    const { todo } = get()
    const { items, input } = todo
    const nextItems = items.concat([input])
    set({ todo: { ...todo, items: nextItems, input: '' } })
    actions.hideHint()
    actions.trackEvent({ type: 'added' })
  },

  completeItem: ({ get, set, actions }, index) => {
    const { todo } = get()
    const { items } = todo
    const nextItems = items.filter((item, i) => i !== index)
    set({ todo: { ...todo, items: nextItems } })
    actions.trackEvent({ user: 'anonymous', type: 'completed' })
  },

  updateItem: ({ get, set }, input) => {
    set({ todo: { ...get().todo, input } })
  },

  showHint: ({ get, set }) => {
    set({ hint: { ...get().hint, show: true } })
  },

  hideHint: ({ get, set }) => {
    set({ hint: { ...get().hint, show: false } })
  },

  trackEvent: ({ get, set }, event) => {
    const { events } = get().analytics
    const nextEvents = events.concat([event])
    set({
      analytics: {
        events: nextEvents
      }
    })
  }
}
