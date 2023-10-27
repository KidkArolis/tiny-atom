/** @jsx h */
import { h, render } from 'preact'
const { createAtom } = require('tiny-atom')
const { Provider } = require('tiny-atom/preact')
const { createLog } = require('tiny-atom/log')
const App = require('./App')
const { initialState, actions } = require('./actions')

require('preact/debug')

const atom = (window.atom = createAtom(initialState, actions, { debug: createLog() }))

render(
  <Provider atom={atom}>
    <App />
  </Provider>,
  document.querySelector('#root'),
)
