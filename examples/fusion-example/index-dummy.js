// const merge = require('tiny-atom/deep-merge')
const debug = require('tiny-atom/log')
const createAtom = require('./atom')

const atom = window.atom = createAtom({}, { debug })

const events = atom('events', { list: [], other: 'key' }, {
  push: (get, split, payload) => {
    split({ list: get().list.concat([payload]) })
  }
})

const preferences = events('preferences', { on: false }, {
  toggle: (get, split, payload) => {
    split({ on: !get().on })
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

// could also expose
// atom.get.events.preferences()
// events.get.preferences()

console.log(JSON.stringify(atom.get(), null, 2))
