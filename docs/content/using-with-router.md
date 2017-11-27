---
title: Using with router
---

The URL is part of your app's state, but it's stored and rendered by the browser. A good way of integrating seamlessly with this extra state is with two way binding between the url (or your router) and atom.

The url and all url changes are sent to `atom`. Therefore url changes rerender the app. Navigations are done by sending actions to `atom`, which actually updates the `router`, which then in turn updates `atom` again. And so we have a cycle.

Here's how it looks with [space-router](https://github.com/KidkArolis/space-router).

```js
const Preact = require('preact')
const createAtom = require('tiny-atom')
const createRouter = require('space-router')
const { ProvideAtom } = require('tiny-atom/preact')

const routes = [
  ['/', require('./Main')],
  ['/space', require('./Space')],
]

const actions = {
  increment: (get, split) => split({ count: get().count + 1 })
}

// create the router and atom
const router = createRouter(routes)
const atom = createAtom({ count: 0 }, evolve, onChange)

// start routing, every time the url changes
// store the route information in atom
router.start(() => atom.split({ route }))

// to navigate, we dedicate an action
// e.g. split('navigate', { path: '/space' })
function evolve (get, split, action) {
  if (action.type === 'navigate') {
    router.push(action.payload.path, action.payload)
  } else {
    actions(get, split, action)
  }
}

function render (atom) {
  const route = atom.get().route
  const [Component] = router.data(route.pattern)
  Preact.render((
  <ProvideAtom atom={atom}>
    <Component />
  </ProvideAtom>
  ), document.body, document.body.lastElementChild)
}
```

For a more thorough example and for reusable prepackaged solution, see [moonwave](https://github.com/KidkArolis/moonwave) - a small web application framework based on **Tiny Atom**.
