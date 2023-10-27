import test from 'ava'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { Provider, Consumer, connect, createContext, createConnect, createConsumer } from '../src/react'
import testApp from './generic-app'

test.serial('usage', async function (t) {
  const h = (global.h = React.createElement)
  const { root: rootEl, assert, render, unmount } = testApp({ h, Provider, Consumer, connect, act })
  let root
  render((App) => {
    root = createRoot(rootEl)
    root.render(h(App))
  })
  await assert(t)
  unmount(root)
})

test.serial('usage with createContext, createConsumer and createConnect', async function (t) {
  const h = (global.h = React.createElement)
  const { root: rootEl, assert, render, unmount } = testApp({ h, createContext, createConnect, createConsumer, act })
  let root
  render((App) => {
    root = createRoot(rootEl)
    root.render(h(App))
  })
  await assert(t)
  unmount(root)
})
