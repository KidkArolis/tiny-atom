const test = require('ava')
const Preact = require('preact')
const { Provider, Consumer, connect, createContext } = require('../src/preact')
const testApp = require('./generic-app')

test.serial('usage', async t => {
  const h = global.h = Preact.h
  const { root, assert, render } = testApp({ h, Provider, Consumer, connect })
  render(App => Preact.render(h(App), root, root.lastElementChild))
  await assert(t)
  Preact.render(null, root)
})

test.serial('usage with createContext', async t => {
  const h = global.h = Preact.h
  const { root, assert, render } = testApp({ h, createContext })
  render(App => Preact.render(h(App), root, root.lastElementChild))
  await assert(t)
  Preact.render(null, root)
})
