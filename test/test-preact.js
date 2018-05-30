const test = require('ava')
const Preact = require('preact')
const createContext = require('../src/preact')
const testApp = require('./generic-app')

test('usage', async t => {
  const h = global.h = Preact.h
  const { root, assert, render } = testApp({ h, createContext })
  render(App => Preact.render(h(App), root, root.lastElementChild))
  await assert(t)
  Preact.render(null, root)
})
