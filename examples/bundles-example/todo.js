module.exports = {
  name: 'todo',

  initialState: {
    items: [
      'learn tiny-atom',
      'use tiny-atom',
      'star tiny-atom'
    ],
    input: ''
  },

  actions: {
    init ({ get, set, dispatch }, payload) {
      if (!payload.isServer) dispatch('fetchStuffs')
    },

    addItem: ({ get, set, dispatch }, payload) => {
      const { items, input } = get()
      const nextItems = items.concat([input])
      set({ items: nextItems, input: '' })
      dispatch('hideHint')
      dispatch('trackEvent', { type: 'added' })
    },

    completeItem: ({ get, set, dispatch }, index) => {  
      const { items } = get()
      const nextItems = items.filter((item, i) => i !== index)
      set({ items: nextItems })
      dispatch('trackEvent', { user: 'anonymous', type: 'completed' })
    },

    updateItem: ({ set }, input) => {
      set({ input })
    },

    trackEvent: ({ get, set }, event) => {
      // const { events } = get().analytics
      // const nextEvents = events.concat([event])
      // set({
      //   analytics: {
      //     events: nextEvents
      //   }
      // })
    },

    react: ({ get, set, dispatch }, { prev }) => {
      // to something based on curr and prev state
    }
  },

  selectors: {
    todo: state => state.todo,
    undoneItems: ['todo', state => state.items.filter(i => !i.done)],
    isListEmpty: ['undoneItems', undoneItems => undoneItems.length === 0],
    todoCount: ['undoneItems', items => items.length]
  },

  // reactors: {
  //   trackDoneItem ({ prev, curr, get, set, dispatch }, { isListEmpty }) {
  //     if (isListEmpty()) return
  //     if (prev.propertyId !== get().propertyId) {
  //       dispatch('fetchProperty')
  //     }
  //   }
  // }
}
