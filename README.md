# tiny-atom

Minimal, yet awesome, state management.

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

### `createAtom(initialState, evolve, render)`

Create an atom.

* `initialState` - should be an object, defaults to `{}`
* `evolve(get, split, action)` - a function that will receive actions and control the evolution of the state
  * `get()` - get current state
  * `split(update)` or `split(type, payload)` - see `atom.split`
  * `action` - an object of shape `{ type, payload }`
* `render(atom, details)` - a function called on each state change
  * `atom` - atom itself
  * `details` - an object of shape { seq, action, update, prev }, should be used mostly for debugging, but could also be an integration point

### `atom.get`

Return current state.

### `atom.split`

Can be used in 2 ways:

* `atom.split(update)` - a shortcut to directly extend the state with the `update` object, doesn't go via `evolve`, extends using Object.assign.
* `atom.split(type, payload)` - dispatch an action to `evolve`.

### Advanced

Tiny Atom's constructor takes a 4th argument, a function `merge` with signature `(prevState, nextState)`. This function is called each time the old state `prevState` needs to merge a possibly partial update `nextState`. Default implementation is `Object.assign({}, prev, next)`.

You can use this hook to use a different data structure for your state, such as Immutable.js. Or you could use it to extend the state instead of cloning `Object.assign(prev, next)` if that makes performance or architectural difference.
