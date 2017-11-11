<h1 align="center">
  <br>
  <img src="https://user-images.githubusercontent.com/324440/32469476-cf1a8918-c34a-11e7-8ad2-c7a0c33d373c.png" alt="tiny atom logo" title="tiny atom logo" width='140px'>
  <br>
  <br>
</h1>

<h5 align="center">Minimal, yet awesome, state management.</h5>
<br />

* tiny api - easy to understand, easy to adapt
* tiny size - 0.5KB
* single store modified via actions
* batteries included
  * preact bindings
  * console logger
  * redux devtools integration

## Installation

    $ yarn add tiny-atom

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

![image](https://user-images.githubusercontent.com/324440/32691553-3e7767f4-c701-11e7-91b2-bf80fc918c71.png)

## Preact example

```js
const Preact = require('preact')
const createAtom = require('tiny-atom')
const { ProvideAtom, ConnectAtom } = require('tiny-atom/preact')

const atom = createAtom({ count: 0 }, evolve, render)

const actions = {
  increment: (get, split, x) => {
    split({ count: get().count + x })
  }
}

function evolve (get, split, action) {
  actions[action.type](get, split, action.payload)
}

const mapAtom = (state, split) => ({
  count: state.count,
  increment: x => split('increment', x)
})

const App = () => (
  <ConnectAtom map={mapAtom} render={({ count, increment }) => (
    <div>
      <h1>count is {count}</h1>
      <button onclick={() => increment(1)}>Increment</button>
    </div>
  )} />
)

function render () {
  Preact.render((
    <ProvideAtom atom={atom}>
      <App />
    </ProvideAtom>
  ), document.body, document.body.lastElementChild)
}

render()

```

## API

### `createAtom(initialState, evolve, render, options)`

Create an atom.

* `initialState` - defaults to `{}`
* `evolve(get, split, action)` - receives actions and controls the evolution of the state
  * `get()` - get current state
  * `split(update)` or `split(type, payload)` - see `atom.split`
  * `action` - an object of shape `{ type, payload }`
* `render(atom)` - called on each state update
* `options`
  * `debug(info)` - called on each `action` and `update` with `{ type, atom, action, sourceActions, prevState }`
  * 'merge(state, update)' - called each time `split(update)` is called. Default implementation is `(state, update) => Object.assign({}, state, update)`. You can use this hook to use a different data structure for your state, such as Immutable. Or you could use it to extend the state instead of cloning with `Object.assign(state, update)` if that makes performance or architectural difference.

### `atom.get`

Returns current state.

### `atom.split`

Can be used in 2 ways:

* `atom.split(type, payload)` - send an action to `evolve`.
* `atom.split(update)` - update the state with the `update` object, doesn't go via `evolve`.
