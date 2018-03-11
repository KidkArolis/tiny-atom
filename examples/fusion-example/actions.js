const { push } = require('tiny-atom/immutable')

module.exports = {
  todo: {
    state: {
      items: [
        'learn tiny-atom',
        'use tiny-atom',
        'star tiny-atom'
      ],
      input: ''
    },
    actions: {
      add: (get, split, payload) => {
        const items = push(get().items, get().input)
        split({ items, input: '' })
        split.root('hint.hide')
        split.root('analytics.track', { type: 'added' })
      },
      done: (get, split, index) => {
        const items = get().items.filter((item, i) => i !== index)
        split({ items })
        split.root('analytics.track', { type: 'removed' })
      },
      update: (get, split, input) => {
        split({ input })
      }
    }
  },

  hint: {
    state: {
      text: 'Type + hit enter',
      show: true
    },
    actions: {
      show: (get, split) => {
        split({ show: true })
      },
      hide: (get, split) => {
        split({ show: false })
      }
    }
  },

  analytics: {
    state: {
      events: []
    },
    actions: {
      track: (get, split, event) => {
        split({ events: push(get().events, event) })
      }
    }
  }
}
