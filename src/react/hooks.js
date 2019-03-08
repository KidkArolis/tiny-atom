const { useContext, useEffect, useState, useRef, useCallback } = require('react')
const { AtomContext, differ } = require('../react')
const raf = require('../raf')

const isServer = typeof navigator === 'undefined'
const identity = x => x
const immediate = fn => fn()
const delayed = fn => raf(fn)()

let i = 0
const nextOrder = () => ++i

function useAtom (selectorFn = identity, options = {}) {
  const { sync = false, pure = true, observe = !isServer } = options

  const { atom } = useContext(AtomContext)
  assert(atom, 'No atom found in context, did you forget to wrap your app in <Provider atom={atom} />?')

  const schedule = useCallback(sync ? immediate : delayed, [sync])
  const selector = useCallback(selectorFn, options.deps)
  const [, rerender] = useState({})
  const mappedProps = useRef()
  const cancelUpdate = useRef(null)
  const order = useRef()

  // keep track of rendering order, this is important for:
  // - correctness – parent must rerender first
  // - performance – parent rerendering children should cancel children's scheduled rerenders
  if (!order.current) {
    order.current = nextOrder()
  }

  // store current mapped state on each render
  // so we can diff when atom triggers callbacks
  mappedProps.current = selector(atom.get())

  // cancel any pending scheduled updates after each render
  // since we just go rerendered by the parent component
  invoke(cancelUpdate)

  useEffect(function observe () {
    if (!observe) return

    // very important to check for this, since
    // our observe callback might have been removed
    // from the atom's listeners array while atom is
    // looping over the old list of listener references
    let didUnobserve = false

    const unobserve = atom.observe(onChange, order.current)

    // avoid race render/commit phase conditions
    // trigger this to check if atom's state change before
    // we managed to subscribe in this effect
    onChange()

    function onChange () {
      if (didUnobserve) return

      // take into account store updates happening in rapid sequence
      // cancel each previously scheduled one and reschedule
      invoke(cancelUpdate)

      // schedule an update
      cancelUpdate.current = schedule(function scheduledOnChange () {
        cancelUpdate.current = null
        const nextMappedProps = selector(atom.get())
        if (!pure || differ(mappedProps.current, nextMappedProps)) {
          rerender({})
        }
      })
    }

    return function destroy () {
      didUnobserve = true
      unobserve()
      invoke(cancelUpdate)
    }
  }, [atom, observe, pure, selector, schedule, order, mappedProps, cancelUpdate, rerender])

  // always return fresh mapped props, in case
  // this is a parent rerendering children
  return mappedProps.current
}

function useActions () {
  const { atom } = useContext(AtomContext)
  return atom.actions
}

function useDispatch () {
  const { atom } = useContext(AtomContext)
  return atom.dispatch
}

function assert (cond, error) {
  if (!cond) {
    throw new Error(error)
  }
}

function invoke (ref) {
  if (ref.current) {
    ref.current()
    ref.current = null
  }
}

module.exports = { useAtom, useActions, useDispatch }
