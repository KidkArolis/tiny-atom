const Preact = require('preact')
const { ProvideAtom } = require('tiny-atom/preact')
const App = require('./components/App')
const raf = require('./utils/raf')
const atom = window.atom = require('./atom')

// const render = raf(function render () {
//   Preact.render((
//     <ProvideAtom atom={atom}>
//       <App />
//     </ProvideAtom>
//   ), document.body, document.body.lastElementChild)
// })

// atom.observe(render)
// render()

// const atom = createAtom()

atom.split({ top1: 1 })
atom.split({ top2: 2 })

const events = atom.slice('events', {
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

const prefs = events.slice('preferences', {
  state: { on: false },
  actions: {
    toggle: (get, split, payload) => {
      split({ on: !get().on })
    }
  }
})

prefs.split('toggle')

atom.get()
// {
//   "top1": 1,
//   "top2": 2,
//   "events": {
//     "list": [
//       "item1",
//       "item2",
//       "item3"
//     ],
//     "preferences": {
//       "on": true
//     }
//   }
// }

atom.get()


// console.log('STATE', JSON.stringify(atom.get(), null, 2))
// console.log('EVENTS', JSON.stringify(events.get(), null, 2))
// console.log('PREFERENCES', JSON.stringify(prefs.get(), null, 2))
