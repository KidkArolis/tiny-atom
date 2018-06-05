const test = require('ava')
const React = require('react')
const ReactDOM = require('react-dom')
const createContext = require('../src/react')
const testApp = require('./generic-app')

test('usage', async t => {
  const h = global.h = React.createElement
  const { root, assert, render } = testApp({ h, createContext })
  render(App => ReactDOM.render(h(App), root))
  await assert(t)
  ReactDOM.render(null, root)
})
