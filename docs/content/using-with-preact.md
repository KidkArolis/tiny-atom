---
title: Using with Preact
---

In principle, you don't need to use any extra components to utilise atom in your Preact application. The simplest way to use atom is to pass `state` and `split` to your app as props: `<App atom={atom.get()} split={atom.split} />`.

**Note**: the reason we name the first prop `atom` and not `state` is to avoid confusing `this.state` with `this.props.state`. The reason we pass `atom.get()` instead of the whole atom is to be able to utilise `componentShouldUpdate` and other lifecycle hooks. It can be useful in these hooks to inspect the current state and the next state.

While a lot of the time passing atom around as props can be enough, **Tiny Atom** comes with some helper components.

## `<ProvideAtom />`

```js
import { ProvideAtom } from 'tiny-atom/preact'

<ProvideAtom atom={atom}>
  <App />
</ProvideAtom>
```

Takes atom as a prop and provides it via context to the nested components.

## `<ConnectAtom />`

```js
import { ConnectAtom } from 'tiny-atom/preact'

export default () => {
  <ConnectAtom map={(state, split) => {}} render={props => (...)} />
}
```

Takes an optional `map` prop that transforms the `state` and `split` into props for the nested component. If not provided, the entire `state` and `split` is passed as props to the nested component. The `render` prop takes a function that is called to render the connected child component.

## `connect`

```js
import { connect } from 'tiny-atom/preact'

const map = (state, split) => {}
export default connect(map)(Component)
```

Takes an optional `map` prop that transforms the `state` and `split` into props for the connected component. And then takes a `Component` and returns the connected higher order component.

## Example

**index.js**

```js
const Preact = require('preact')
const createAtom = require('tiny-atom')
const { ProvideAtom } = require('tiny-atom/preact')
const log = require('tiny-atom/log')
const actions = require('./actions')
const App = require('./App')

// create the atom
const atom = createAtom({ count: 0 }, evolve, render, {
  debug: log
})

// a pretty typical evolver that calls the action handlers
function evolve (get, split, action) {
  actions[action.type](get, split, action.payload)
}

// wrap the rendering into a function for atom to call
function render (atom) {
  Preact.render((
    <ProvideAtom atom={atom}>
      <App />
    </ProvideAtom>
  ), document.body, document.body.lastElementChild)
}

// initial render
render(atom)
```

**actions.js**

```js
module.exports = {
  increment: (get, split, payload) => {
    split({ count: get().count + payload })
    split('track', { event: 'increment' })
  },

  decrement: (get, split, payload) => {
    split({ count: get().count - payload })
    split('track', { event: 'decrement' })
  },

  track: (get, split, payload) => {
    ga('send', payload)
  }
}
```

**App.js**

```js
const Preact = require('preact')
const Header = require('./Header')
const { ConnectAtom } = require('tiny-atom/preact')

const mapAtom = (state, split) => ({
  count: state.count,
  doubleCount: state.count * 2,
  inc: () => split('increment', 1),
  dec: () => split('decrement', 1)
})

module.exports = () => (
  <ConnectAtom map={mapAtom} render={({ count, doubleCount, inc, dec }) => (
    <div>
      <Header title='Counter' />
      <div>times one: {count}</div>
      <div>times two: {doubleCount}</div>
      <button onClick={inc}>Increment</button>
      <button onClick={dec}>Decrement</button>
    </div>
  )} />
)
```

**Header.js**

```js
const Preact = require('preact')
const { ConnectAtom } = require('tiny-atom/preact')

module.exports = ({ title }) => (
  <ConnectAtom render={({ state, split }) => (
    <div onClick={() => split('increment', 5)}>
      {title}
    </div>
  )} />
)
```

## Render prop vs children prop vs connect

Use the one that works best for your application.

Connect with a render prop:

```js
const Preact = require('preact')
const { ConnectAtom } = require('tiny-atom/preact')

module.exports = ({ title }) => (
  <ConnectAtom render={({ state, split }) => (
    <div>{title} - {state.id}</div>
  )} />
)
```

Connect with a children prop:

```js
const Preact = require('preact')
const { ConnectAtom } = require('tiny-atom/preact')

module.exports = ({ title }) => (
  <ConnectAtom>{
    ({ state, split }) => 
      <div>{title} - {state.id}</div>
    )
  }</ConnectAtom>
)
```

Connect with a hoc function:

```js
const Preact = require('preact')
const { connect } = require('tiny-atom/preact')

module.exports = connect()(({ title, state, split }) => (
  <div>{title} - {state.id}</div>
))
```
