# tiny-atom/quarks

An example of how you can generate action functions for all of your actions instead of splitting them as strings.

## Running

     yarn
     npm start
     open http://localhost:3000

## API

```js
const createAtom = require('tiny-atom/quarks')
const merge = require('tiny-atom/deep-merge')
const debug = require('tiny-atom/log')

// signature is now (options, initialState = {})
const atom = = createAtom({ merge, debug })

// first of all, you can add top level state and actions
atom({ a: 1 }, {
  plus: (get, split) => split({ a: get().a + 1 })
})

// and extends top level dynamically
atom({ b: 1 }, {
  minus: (get, split) => { split({ b: get().b - 1 })
})

// but you can also create scoped slices of atom - quarks
atom('todo', { list: [], val: '' }, {
  add: (get, split, item, root) => {
    // gets are scoped
    const curr = get().list
    const next = curr.concat([item])

    // splits are scoped
    split({ list: next })

    // can call local actions
    split('reset')

    // can call global actions
    root.split('plus')
    root.split('minus')
    root.split('analytics.track')
  },

  reset: (get, split, item, root) => {
    split({ val: '' })
  }
})

const analytics = atom('analytics', { events: [] }, {
  track: (get, split, event) {
    split({ events: get().events.concat([event] )})
  }
})

// it's possible to nest atoms further
const deep = analytics('deep', {})

deep.split({ value: 123 })

// observation only possible at the top
// all actions go through the global evolver
atom.observe(render)

// it's possible to override the global evolver
atom({}, customEvolve)
function customEvolve (get, split, action) {
  // this means you have to fully manually manage what happens with all the actions and how you namespace your state, etc.
  console.log('All actions are now intercepted', action)
}

// it's also possible to instead only override evolve of a subatom
atom('analytics')('deep', {}, evolve)

// and once you've constructed your atoms, you can pass them around
// or provide/connect

e.g. in the root
<Provide atom={atom} />

e.g. in some subapp
<Provide atom={atom('feedback')} />
<Connect>
  {(state, split) => <div>{state.text}</div>}
</Connect>
```

Seems pretty elegant overall! Lots of little hidden features, but the core usage is quite pragmatic and straightforward and same atom we know!

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
atom('feedback').split('submit')
atom.split('feedback.submit')
atom('feedback').get()
atom.get().feedback
```
