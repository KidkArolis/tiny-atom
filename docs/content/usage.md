---
title: Usage
---

This is a guide explaining how to think in Tiny Atom.

This guide does not assume any previous understanding of state management approaches in JavaScript. If you are an experienced developer, you might want to also read [Alternatives](/alternatives) or usage guides.

### Example

```js
const createAtom = require('tiny-atom')

const atom = createAtom({ count: 0 }, evolve, render)

function evolve (get, split, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    split({ count: state.count + payload })
  }

  if (type === 'asyncIncrement') {
    split({ loading: true })
    setTimeout(() => {
      split({ count: get().count + payload, loading: false })
    }, 1000)
  }
}

function render (atom, details) {
  console.log('change', {
    id: details.id,
    action: details.action,
    state: atom.get()
  })
}

atom.split({ count: 5 })
  // -> { count: 5 }
atom.split('increment', 5)
  // -> { count: 10 }
atom.split('asyncIncrement', 3)
  // -> { count: 10, loading: true }
atom.split('increment', 2)
  // -> { count: 12, loading: true }
  // -> 1 second later...
  // -> { count: 15, loading: false }
```

