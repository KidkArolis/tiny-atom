const { Map, fromJS } = require('immutable')

module.exports = {
  todo: {
    state: fromJS({
      items: [
        'learn tiny-atom',
        'use tiny-atom',
        'star tiny-atom'
      ],
      input: ''
    }),
    actions: {
      add: (state, split) => {
        split(
          state()
            .set('input', '')
            .updateIn(['items'], items => items.push(
              state().get('input')
            ))
        )
        split.hint.hide()
        split.analytics.track({ type: 'added' })
      },
      done: (state, split, index) => {
        split(
          state()
            .updateIn(['items'], items =>
              items.delete(index)
            )
        )
        split.analytics.track({ type: 'removed' })
      },
      update: (state, split, input) => {
        split(
          state().set('input', input)
        )
      }
    }
  },

  hint: {
    state: fromJS({
      text: 'Type + hit enter',
      show: true
    }),
    actions: {
      show: (state, split) => {
        split(Map({ show: true }))
      },
      hide: (state, split) => {
        split(Map({ show: false }))
      }
    }
  },

  analytics: {
    state: fromJS({
      events: []
    }),
    actions: {
      track: (state, split, event) => {
        split(
          state()
            .updateIn(['events'], events => events.push(Map(event)))
        )
      }
    }
  }
}
