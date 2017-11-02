<h1 align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/324440/32469476-cf1a8918-c34a-11e7-8ad2-c7a0c33d373c.png" alt="tiny atom logo" title="tiny atom logo" width='140px'>
  <br>
  <br>
</h1>

<h5 align="center">Minimal, yet awesome, state management.</h5>
<br />

* single store with little boilerplate
* small API surface - simple to understand, simple to adapt
* Only 532 bytes - perfect for size sensitive applications
* Batteries included, ships with
  * preact bindings
  * console logger
  * redux devtools integration

## Usage

    $ yarn add tiny-atom

### Counter Example

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

### Preact example

```js
const Preact = require('preact')
const createAtom = require('tiny-atom')

const atom = createAtom({ count: 0 }, evolve, render)

function evolve (get, split, action) {
  const state = get()
  const { type, payload } = action

  if (type === 'increment') {
    // sync
    split({ count: state.count + payload })

    // or do it async
    setTimeout(() => {
      split({ count: get().count + payload })
    }, 1000)
  }
}

function App ({ atom, split }) {
  return <div>
    <h1>count is {atom.count}</h1>
    <button onclick={onclick}>Increment</button>
  </div>

  function onclick () {
    split('increment', 1)
  }
}

function render () {
  Preact.render(<App atom={atom.get()} split={atom.split} />, document.body, document.body.lastElementChild)
}

render()
```

## API

### `createAtom(initialState, evolve, render, options)`

Create an atom.

* `initialState` - should be an object, defaults to `{}`
* `evolve(get, split, action)` - a function that will receive actions and control the evolution of the state
  * `get()` - get current state
  * `split(update)` or `split(type, payload)` - see `atom.split`
  * `action` - an object of shape `{ type, payload }`
* `render(atom, details)` - a function called on each state change
  * `atom` - atom itself
* `options`
  * `debug` - a function which gets passed `{ type, atom, action, sourceActions, prevState }` on each `action` and each `update`.
  * 'merge' - a function with signature `(prevState, nextState) => state`, called each time a possible partial update `nextState` needs to be merged into the old state `prevState`. Default implementation is `Object.assign({}, prev, next)`. You can use this hook to use a different data structure for your state, such as Immutable.js. Or you could use it to extend the state instead of cloning `Object.assign(prev, next)` if that makes performance or architectural difference.

### `atom.get`

Return current state.

### `atom.split`

Can be used in 2 ways:

* `atom.split(update)` - a shortcut to directly update the state with the `update` object, doesn't go via `evolve`.
* `atom.split(type, payload)` - dispatch an action to `evolve`.
