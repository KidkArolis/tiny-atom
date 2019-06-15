import test from 'ava'
import { JSDOM } from 'jsdom'
import { raf } from '../src/core/raf'

test('calls functions at most once a frame', async function(t) {
  const dom = new JSDOM()
  global.window = dom.window

  let frame
  dom.window.requestAnimationFrame = fn => {
    frame = fn
  }

  let renders = 0
  const render = raf(() => renders++)

  // no renders yet
  t.is(renders, 0)

  // still no renders
  render()
  t.is(renders, 0)

  // all subsequent renders are deferred
  render()
  render()
  render()
  t.is(renders, 0)

  // once the frame kicks in, one of the deferred renders goes through
  frame()
  t.is(renders, 1)

  // frames fire, no extra renders happen
  frame()
  frame()
  t.is(renders, 1)

  // the next render is deferred again
  render()
  render()
  render()
  t.is(renders, 1)

  // frame kicks in
  frame()
  t.is(renders, 2)

  // frames fire, no extra renders happen
  frame()
  frame()
  frame()
  t.is(renders, 2)
})

test('gets pollyfilled with ts on the server or other envs', async function(t) {
  const dom = new JSDOM()
  const tick = () => new Promise(resolve => setTimeout(resolve, 20))
  global.window = dom.window

  let renders = 0
  const render = raf(() => renders++)

  // no renders yet
  t.is(renders, 0)

  // no renders yet
  render()
  t.is(renders, 0)

  // all subsequent renders are deferred
  render()
  render()
  render()
  t.is(renders, 0)

  // once the frame kicks in, one of the deferred renders goes through
  await tick()
  t.is(renders, 1)

  // frames fire, no extra renders happen
  await tick()
  await tick()
  t.is(renders, 1)

  render()
  render()
  render()
  await tick()
  t.is(renders, 2)

  await tick()
  t.is(renders, 2)

  // frames fire, no extra renders happen
  await tick()
  await tick()
  await tick()
  t.is(renders, 2)
})
