const Preact = require('preact')
const App = require('./App')
const actions = require('./actions')
const { atom } = require('./atom')

Object.keys(actions).forEach(pack => {
  const p = actions[pack]
  atom.fuse(pack, p.state, p.actions)
})

Preact.render((
  <App />
), document.body, document.body.lastElementChild)
