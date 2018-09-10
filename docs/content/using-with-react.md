---
title: Using with React
---

**Tiny Atom** comes with connectors for mapping atom state to your components and reacting to changes efficiently. The connectors can all be found in `tiny-atom/react` module:

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider, Consumer, connect } from 'tiny-atom/react'
import App from './App'

ReacrDOM.render((
  <Provider atom={atom}>
    <App />
  </Provider>
), root)
```

## `connect(map, actions, options)(Component)`

Connects a component to atom and rerenders it upon relevant changes.

#### map
*type*: `function`
*default*: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only rerendered if they differ. A shallow object diff is used in the comparison.

#### actions
*type*: `array | function`
*default*: `null`

An array of action names that will be turned into functions and passed via props or a function that takes dispatch and can return an object with functions that will be passed to the component.

#### options.pure
*type*: `boolean`
*default*: `true`

If the connection is `pure`, the mapped props are compared to previously mapped props for avoiding rerenders. Set this to false to rerender on any state change.

#### options.sync
*type*: `boolean`
*default*: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to rerender immediately on change state.

#### options.observe
*type*: `boolean`
*default*: `true` in the browser, `false` on the server

Use this to control if the connector subscribes to the store or simply projects the state on parent rerenders.

#### options.debug
*type*: `boolean`
*default*: `false`

Log information about changed props when this component re-renders. Useful when optimising the application to remove needless re-renders.

### Example

```js
import { connect } from 'tiny-atom/connect'

const map = (state) => {
  return {
    count: state.count
  }
}

const actions = (dispatch) => {
  return {
    inc: (x) => dispatch('inc', x),
    dec: (x) => dispatch('dec', x)
  }  
}

// or
const actions = ['inc', 'dec']

export default connect(map, actions, options)(Component)
```

## `<Consumer />`

A render props style component that can be used inline of your component's render function to map the state similarly to how `connect works`. It supports the following props.

#### map
*type*: `function`
*default*: `null`

Map atom state to props for your component. Upon changes to atom, the mapped props are compared to the previously mapped props and the connected component is only rerendered if they differ. A shallow object diff is used in the comparison.

#### actions
*type*: `array | function`
*default*: `null`

An array of action names that will be turned into functions and passed via props or a function that takes dispatch and can return an object with functions that will be passed to the component.

#### pure
*type*: `boolean`
*default*: `true`

If the connection is `pure`, the mapped props are compared to previously mapped props for avoiding rerenders. Set this to false to rerender on any state change. **Note!** Children prop is also compared in this case and if you're using an inline render function, it will be different every time thus removing the benefits of setting `pure` to `true`.

#### sync
*type*: `boolean`
*default*: `false`

By default, the change listeners are debounced such that at most one render occurs per frame. Set to true to rerender immediately on change state.

#### debug
*type*: `boolean`
*default*: `false`

Log information about changed props when this component re-renders. Useful when optimising the application to remove needless re-renders.

#### displayName
*type*: `boolean`
*default*: `false`

When debug is true, you can set the displayName value to improve the debug log output. Without the displayName it would be difficult to identify component in the logs. This is only an issue when using `<Consumer />` since `connect()` knows the name of the connected component.

### Example

```js
import { Consumer } from 'tiny-atom/connect'

const map = (state) => {
  return {
    count: state.count
  }
}

const actions = (dispatch) => {
  return {
    inc: (x) => dispatch('inc', x),
    dec: (x) => dispatch('dec', x)
  }  
}

// or
const actions = ['inc', 'dec']

export default () => {
  <Consumer map={map} actions={actions}>
    {({ count, inc, dec })} => (
      <button onClick={inc}>{count}</button>
    )
  </Consumer>
}
```

## `<Provider />`

Injects atom into the context of the render tree.

#### atom
*type*: `object`

Your atom instance created by `createAtom`.

#### debug
*type*: `boolean`
*default*: `false`

Log information about changed props when all of the connected components re-render. Useful when optimising the application to remove needless re-renders.

## Example

To see a full working example, have a look at the [examples/react-example](https://github.com/QubitProducts/tiny-atom/tree/master/examples/react-example)
