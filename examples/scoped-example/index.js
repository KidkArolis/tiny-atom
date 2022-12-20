/** @jsx Preact.h */

const Preact = require('preact')
const { Provider } = require('tiny-atom/preact')
const log = require('tiny-atom/log')
const App = require('./App')
const actions = require('./actions')
const createAtom = require('./scoped-atom')

const atom = (window.atom = createAtom({ debug: log() }))

Object.keys(actions).forEach((pack) => {
  const p = actions[pack]
  atom.fuse(pack, p.state, p.actions)
})

// eslint-disable-next-line
Preact.render(
  <Provider atom={atom}>
    <App />
  </Provider>,
  document.body,
  document.body.lastElementChild
)
