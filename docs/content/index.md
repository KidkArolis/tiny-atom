<h5 align="center">Minimal, yet awesome, state management.</h5>
<br />

* tiny api - easy to understand, easy to adapt
* tiny in size - 0.5KB
* single store modified via actions
* uni-directional data flow
* batteries included
  * [react bindings](/using-with-react)
  * [preact bindings](/using-with-preact)
  * [console logger](/console-logger)
  * [devtools integration](/devtools)

## Installation

    yarn add tiny-atom

## Example

```js
const createAtom = require('tiny-atom')
const log = require('tiny-atom/log')

const atom = createAtom({ count: 0 }, evolve, render, { debug: log })

const actions = {
  increment: (get, split, x) => {
    split({ count: get().count + x })
  },

  asyncIncrement: (get, split, x) => {
    split({ loading: true })
    setTimeout(() => {
      split('increment', x)
      split({ loading: false })
    }, 1000)
  }
}

function evolve (get, split, action) {
  actions[action.type](get, split, action.payload)
}

function render (atom) {
  document.body.innerHTML = `Count ${atom.get().count}`
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
