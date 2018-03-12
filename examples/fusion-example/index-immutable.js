const createAtom = require('./atom-simpler')
const debug = require('tiny-atom/log')
const { fromJS } = require('immutable')

const merge = (state, update) => state.mergeDeep(update)
const get = (obj, key) => obj.get(key)
const atom = window.atom = createAtom({ merge, get, debug }, fromJS({}))

const events = atom('events', fromJS({ list: [], other: 'key' }), {
  push: (get, split, payload) => {
    split(
      get()
        .updateIn(['list'], list => list.push(payload))
    )
  }
})

const preferences = events('preferences', fromJS({ on: false }), {
  toggle: (get, split, payload) => {
    split(
      get().set('on', !get().get('on'))
    )
  }
})

atom.split({ top1: 1 })
atom.split({ top2: 2 })

events.split('push', 'item1')
events.split('push', 'item2')
events.split('push', 'item3')

preferences.split('toggle')

// equivalent
atom('events')('preferences').get()
events('preferences').get()
preferences.get()

console.log(atom.get())
console.log(JSON.stringify(atom.get(), null, 2))
