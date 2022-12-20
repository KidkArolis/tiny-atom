import test from 'ava'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, Consumer, connect, createContext, createConnect, createConsumer } from '../src/react'
import testApp from './generic-app'

test.serial('usage', async function (t) {
  const h = (global.h = React.createElement)
  const { root: rootEl, assert, render } = testApp({ h, Provider, Consumer, connect })
  let root
  render((App) => {
    root = createRoot(rootEl)
    root.render(h(App))
  })
  await assert(t)
  root.unmount()
})

test.serial('usage with createContext, createConsumer and createConnect', async function (t) {
  const h = (global.h = React.createElement)
  const { root: rootEl, assert, render } = testApp({ h, createContext, createConnect, createConsumer })
  let root
  render((App) => {
    root = createRoot(rootEl)
    root.render(h(App))
  })
  await assert(t)
  root.unmount()
})
