const test = require('ava')
const React = require('react')
const ReactDOM = require('react-dom')
const { Provider, Consumer, connect, createContext } = require('../src/react')
const testApp = require('./generic-app')

test.serial('usage', async function (t) {
  const h = global.h = React.createElement
  const { root, assert, render } = testApp({ h, Provider, Consumer, connect })
  render(App => ReactDOM.render(h(App), root))
  await assert(t)
  ReactDOM.render(null, root)
})

test.serial('usage with createContext', async function (t) {
  const h = global.h = React.createElement
  const { root, assert, render } = testApp({ h, createContext })
  render(App => ReactDOM.render(h(App), root))
  await assert(t)
  ReactDOM.render(null, root)
})
