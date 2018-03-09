const atom = window.atom = require('./atom')

atom.split({ top1: 1 })
atom.split({ top2: 2 })

const events = atom('events', {
  state: { list: [] },
  actions: {
    push: (get, split, payload) => {
      split({ list: get().list.concat([payload]) })
    }
  }
})

events.split('push', 'item1')
events.split('push', 'item2')
events.split('push', 'item3')

const prefs = events('preferences', {
  state: { on: false },
  actions: {
    toggle: (get, split, payload) => {
      split({ on: !get().on })
    }
  }
})

prefs.split('toggle')

console.log(JSON.stringify(atom.get(), null, 2))
