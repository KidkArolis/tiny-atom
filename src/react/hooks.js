import { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { AtomContext } from './context'
import { differs } from './differs'
import { raf } from './raf'

const isServer = typeof navigator === 'undefined'
const identity = x => x
const immediate = fn => fn()
const delayed = fn => raf(fn)()

let i = 0
const nextOrder = () => ++i

export function useSelector(selectorFn = identity, options = {}) {
  const { sync = false, pure = true, observe = !isServer } = options

  const atom = useAtomInstance()
  assert(atom, 'No atom found in context, did you forget to wrap your app in <Provider atom={atom} />?')

  // cache the schedule and selector functions
  const schedule = useCallback(sync ? immediate : delayed, [sync])
  const selector = useCallback(selectorFn, options.deps || [])

  // we use a state to trigger a rerender when relevant atom
  // state changes, we don't atom the actual mapped atom state
  // here, because that is only 1 of 2 ways that the component
  // gets rerendered, the other way is being rerended by parent
  const [, rerender] = useState({})

  // keep track of rendering order, this is important for:
  // - correctness – parent must rerender first
  // - performance – parent rerendering children should cancel children's scheduled rerenders
  const order = useRef()

  // keep last used props here for diffing upon each change
  const mappedProps = useRef()

  // for cancelling scheduled updates in case of parent renders
  const cancelUpdate = useRef(null)

  if (!order.current) {
    order.current = nextOrder()
  }

  // atom current mapped state on each render
  // so we can diff when atom triggers callbacks
  mappedProps.current = selector(atom.get())

  // cancel any pending scheduled updates after each render
  // since we just go rerendered by the parent component
  invoke(cancelUpdate)

  useEffect(
    function observe() {
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

      function onChange() {
        if (didUnobserve) return

        // take into account atom updates happening in rapid sequence
        // cancel each previously scheduled one and reschedule
        invoke(cancelUpdate)

        // schedule an update
        cancelUpdate.current = schedule(function scheduledOnChange() {
          cancelUpdate.current = null
          const nextMappedProps = selector(atom.get())
          if (!pure || differs(mappedProps.current, nextMappedProps)) {
            rerender({})
          }
        })
      }

      return function destroy() {
        didUnobserve = true
        unobserve()
        invoke(cancelUpdate)
      }
    },
    [atom, observe, pure, selector, schedule, order, mappedProps, cancelUpdate, rerender]
  )

  // always return fresh mapped props, in case
  // this is a parent rerendering children
  return mappedProps.current
}

export function useActions() {
  const atom = useAtomInstance()
  return atom && atom.actions
}

export function useDispatch() {
  const atom = useAtomInstance()
  return atom && atom.dispatch
}

export function useAtomInstance() {
  const { atom } = useContext(AtomContext)
  return atom
}

function assert(cond, error) {
  if (!cond) {
    throw new Error(error)
  }
}

function invoke(ref) {
  if (ref.current) {
    ref.current()
    ref.current = null
  }
}
