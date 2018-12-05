module.exports = {
  slice: 'hint',

  initialState: {
    text: 'Type + hit enter',
    show: true
  },

  actions: {
    showHint: ({ set }) => {
      set({ show: true })
    },

    hideHint: ({ set }) => {
      set({ show: false })
    }
  }
}
