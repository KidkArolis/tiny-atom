/** @jsx h */
const Preact = require('preact')
const createAtom = require('tiny-atom')
const { Provider } = require('tiny-atom/preact')
const log = require('tiny-atom/log')
const App = require('./App')
const { initialState, actions } = require('./actions')

const { h } = Preact

require('preact/debug')

const atom = (window.atom = createAtom(initialState, actions, { debug: log() }))

Preact.render(
  <Provider atom={atom}>
    <App />
  </Provider>,
  document.querySelector('#root')
)
