# Scoped tiny-atom

See `scoped.js` to see how to make each slice of the atom state scoped by default. The `get`, `set` and `dispatch` in each action of each module is scoped to that namespace by default with the ability to dispatch actions into other slices with `top.dispatch`.

```js
const atom = createAtom()

atom.fuse('onboarding', ...require('./actions/onboarding'))
atom.fuse('widget', ...require('./actions/widget'))
atom.fuse('feedback', ...require('./actions/feedback'))
atom.fuse('feeds', ...require('./actions/feeds'))
atom.fuse('entities', ...require('./actions/entities'))
atom.fuse('api', ...require('./actions/api'))
```

Where each module is something like:

```js
const state = {
  items: [
    'learn tiny-atom',
    'use tiny-atom',
    'star tiny-atom'
  ],
  input: ''
}

const actions = {
  add: ({ get, set, dispatch, top }, item) => {
    const items = get().items.concat([item])
    set({ items })
    top.dispatch('hint.hide')
  },
  done: ({ get, set }, index) => {
    const items = get().items.filter((item, i) => i !== index)
    set({ items })
  }
}

module.exports = [state, actions]
```

## Running

     npm start
     open http://localhost:3000
