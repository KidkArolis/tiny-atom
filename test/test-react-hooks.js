import test from 'ava'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { JSDOM } from 'jsdom'
import { createAtom, Provider, useSelector, useActions, useDispatch } from '../src'
import renderHooksApp from './hooks-app'

test.serial.only('usage', async function (t) {
  const h = (global.h = React.createElement)
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const container = document.getElementById('root')
  const root = createRoot(container)

  const { atom, stats } = renderHooksApp({ h, useSelector, useActions, useDispatch, root })

  await frame()

  t.is(document.getElementById('count-outer').innerHTML, '0')
  t.is(document.getElementById('count-inner').innerHTML, '0')
  t.is(stats.childRenderCount, 1)

  atom.dispatch('increment')
  await frame()
  t.is(document.getElementById('count-outer').innerHTML, '1')
  t.is(document.getElementById('count-inner').innerHTML, '10')
  t.is(stats.childRenderCount, 2)

  atom.dispatch('increment')
  await frame()
  t.is(document.getElementById('count-outer').innerHTML, '2')
  t.is(document.getElementById('count-inner').innerHTML, '20')
  t.is(stats.childRenderCount, 3)

  document.getElementById('increment-outer').dispatchEvent(click(dom))
  await frame()
  t.is(document.getElementById('count-outer').innerHTML, '3')
  t.is(document.getElementById('count-inner').innerHTML, '30')
  t.is(stats.childRenderCount, 4)

  atom.dispatch('incrementUnrelated')
  await frame()
  t.is(stats.childRenderCount, 4)

  document.getElementById('increment-inner').dispatchEvent(click(dom))
  await frame()
  t.is(document.getElementById('count-outer').innerHTML, '5')
  t.is(document.getElementById('count-inner').innerHTML, '50')
  t.is(stats.childRenderCount, 5)

  atom.dispatch('replaceUser', { loggedIn: true })
  await frame()
  t.is(stats.childRenderCount, 5)

  atom.dispatch('replaceUser', { loggedIn: false })
  await frame()
  t.is(stats.childRenderCount, 6)

  root.render(null)
})

test.serial('minimal rerenders required', async function (t) {
  const h = (global.h = React.createElement)
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const container = document.getElementById('root')
  const root = createRoot(container)

  const { atom, stats } = renderHooksApp({ h, useSelector, useActions, useDispatch, root })

  await frame()

  t.is(stats.childRenderCount, 1)
  stats.childRenderCount = 0

  for (let i = 1; i < 20; i++) {
    atom.dispatch('increment')
    atom.dispatch('decrement')
    atom.dispatch('increment')
    atom.dispatch('decrement')
    atom.dispatch('increment')
    await frame()
    t.is(document.getElementById('count-outer').innerHTML, String(i))
    t.is(document.getElementById('count-inner').innerHTML, String(i * 10))
    t.is(stats.childRenderCount, i)
  }

  root.render(null)
})

test.serial('a race condition between commit phase/observing and atom changing', async function (t) {
  const h = (global.h = React.createElement)
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const container = document.getElementById('root')
  const root = createRoot(container)

  const atom = createAtom({ state: { count: 0, extra: 0 } })

  const App = () => {
    const mapState = (state) => state.count + state.extra
    const count = useSelector(mapState, { observe: true })
    return h('div', {}, [h('div', { key: 'a', id: 'count-outer' }, count), h(Child, { key: 'b' })])
  }

  const Child = () => {
    const count = useSelector((state) => state.count, { observe: true })
    return h('div', { id: 'count-inner' }, count)
  }

  root.render(h(Provider, { atom }, h(App)))

  // assert
  t.is(atom.get().count, 0)

  // note, update atom immediately after render
  // this "reveals" an edge case where changes to atom
  // before useEffect() is called could get missed
  atom.set({ count: 1 })

  await frame()

  // expect DOM to match atom, even if atom changed before useEffect/atom.observe was flushed
  t.is(atom.get().count, 1)
  t.is(document.getElementById('count-outer').innerHTML, String(1))
  t.is(document.getElementById('count-inner').innerHTML, String(1))
})

test.serial('edge case where we rerender via parent and then via observation', async function (t) {
  const h = (global.h = React.createElement)
  const dom = new JSDOM('<!doctype html><div id="root"></div>')
  global.window = dom.window
  global.document = dom.window.document
  const container = document.getElementById('root')
  const root = createRoot(container)

  const atom = createAtom({ state: { count: 0, extra: 0 } })

  const App = () => {
    const mapState = (state) => state.count + state.extra
    const count = useSelector(mapState, { observe: true })
    return h('div', {}, [h('div', { key: 'a', id: 'count-outer' }, count), h(Child, { key: 'b' })])
  }

  const Child = () => {
    const count = useSelector((state) => state.count, { observe: true })
    return h('div', { id: 'count-inner' }, count)
  }

  root.render(h(Provider, { atom }, h(App)))

  // note, update atom immediately after render
  // this "reveals" an edge case where changes to atom
  // before useEffect() is called, that is before React's
  // commit phase, could get missed
  atom.set({ count: 1, extra: 0 })
  await frame()
  t.is(atom.get().count, 1)
  t.is(document.getElementById('count-outer').innerHTML, String(1))
  t.is(document.getElementById('count-inner').innerHTML, String(1))

  atom.set({ count: 2, extra: 0 })
  await frame()
  t.is(atom.get().count, 2)
  t.is(document.getElementById('count-outer').innerHTML, String(2))
  t.is(document.getElementById('count-inner').innerHTML, String(2))

  // OK, time to reveal the edge case
  // we set the state in such a way where we rendered components in
  // the following way:
  // 1. App -> Child
  // 2. App -> Child
  // 3. Child only
  // We expect Child to correctly rerender, but there was a bug here
  // where Child's local state was count 1 since the first render
  // and updated state is also 1, setState(1) when it's already 1
  // was not rerendering the Child.
  atom.set({ count: 1, extra: 1 })
  await frame()
  t.is(atom.get().count, 1)
  t.is(document.getElementById('count-outer').innerHTML, String(2))
  t.is(document.getElementById('count-inner').innerHTML, String(1))

  root.render(null)
})

function click(dom) {
  return new dom.window.MouseEvent('click', {
    view: dom.window,
    bubbles: true,
    cancelable: true,
  })
}

function frame() {
  flushEffects()
  return new Promise((resolve) => setTimeout(resolve, 2 * (1000 / 60)))
}

function flushEffects() {
  const container = document.createElement('template')
  const root = createRoot(container)
  root.render(null)
}
