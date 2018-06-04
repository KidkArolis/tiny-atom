# Fractal tiny-atom

An example of how you can turn tiny atom into a nested fractal structure. Instead of one atom, you can create scoped nested subatoms that operate on some substate. See the example below for mode details.

This is an extreme example to demonstrate how the various extension points of the tiny-atom work.

## Running

     npm start
     open http://localhost:3000

## API

```js
const debug = require('tiny-atom/log')
const createAtom = require('./fractal')

const atom = = createAtom({ debug })

// you can add top level state and actions
atom({ a: 1 }, {
  plus: ({ get, set }) => set({ a: get().a + 1 })
})

// and extend the top level dynamically
atom({ b: 1 }, {
  minus: ({ get, set }) => { set({ b: get().b - 1 })
})

// you can also create scoped slices of atom
atom('todo', { list: [], val: '' }, {
  add: ({ get, set, dispatch }, item) => {
    // gets are scoped
    const curr = get().list
    const next = curr.concat([item])

    // sets are scoped
    set({ list: next })

    // can call local actions
    dispatch('reset')

    // can call global actions
    dispatch.root('plus')
    dispatch.root('minus')
    dispatch.root('analytics.track')
  },

  reset: ({ get, set }, item) => {
    set({ val: '' })
  }
})

const analytics = atom('analytics', { events: [] }, {
  track: ({ get, set }, event) {
    set({ events: get().events.concat([event] )})
  }
})

// it's possible to nest atoms further
const deep = analytics('deep', {})
deep.set({ value: 123 })

// observation only possible at the top
// all actions go through the global evolve
atom.observe(render)

// and once you've constructed your atoms, you can pass them around
// or connect to the root atom

e.g. in some subapp
<Connect map={map}>
  {(state, dispatch) => <div>{state.text}</div>}
</Connect>
```

Typical usage would probably be:

```
const atom = createAtom({ merge, debug })

atom('onboarding', ...require('./actions/onboarding'))
atom('widget', ...require('./actions/widget'))
atom('feedback', ...require('./actions/feedback'))
atom('feeds', ...require('./actions/feeds'))
atom('entities', ...require('./actions/entities'))
atom('api', ...require('./actions/api'))

// and then pass this stuff around
atom('feedback').dispatch('submit')
atom.dispatch('feedback.submit')
atom('feedback').get()
atom.get().feedback
```
