---
title: Using with router
---

The URL is part of your app's state, but it's stored and rendered by the browser. A good way of integrating seamlessly with this extra state is with two way binding between the url (or your router) and atom.

The url and all url changes are sent to `atom`. Therefore url changes rerender the app. Navigations are done by sending actions to `atom`, which actually updates the `router`, which then updates `atom` state.

Here's how it looks with [space-router](https://github.com/KidkArolis/space-router).

```js
const Preact = require('preact')
const createAtom = require('tiny-atom')
const createRouter = require('space-router')
const { Consumer } = require('tiny-atom/preact')

const router = createRouter([
  ['/', require('./Main')],
  ['/space', require('./Space')],
])

const atom = createAtom({ count: 0 }, {
  increment: ({ get, set }) => set({ count: get().count + 1 }),
  navigate: (atom, route) => router.push(route.path, route),
  navigated: ({ set }, route) => set({ route })
})

const App = () => (
  <Consumer map={state => state.route}>
    {(route) => {
      const [ Component ] = router.data(route.pattern)
      return <Component />
    }}
  </Consumer>
)

Preact.render(<App />, document.body, document.body.lastElementChild)

// start routing, and store route on each url change
router.start((route) => atom.dispatch('navigated', route))
```

For a more thorough example and for reusable prepackaged solution, see [moonwave](https://github.com/KidkArolis/moonwave) - a small web application framework based on **Tiny Atom**.
