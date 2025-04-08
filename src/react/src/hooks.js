import { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { AtomContext } from './context'
import { differs } from './differs'

const isServer = typeof navigator === 'undefined'
const identity = (x) => x

let i = 0
const nextOrder = () => ++i

export function createHooks(AtomContext) {
  function useSelector(selectorFn = identity, options = {}) {
    const { observe = !isServer } = options

    const atom = useAtom()
    assert(atom, 'No atom found in context, did you forget to wrap your app in <Provider atom={atom} />?')

    // cache the selector function
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (!order.current) {
      order.current = nextOrder()
    }

    // atom current mapped state on each render
    // so we can diff when atom triggers callbacks
    mappedProps.current = selector(atom.get())

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

          const nextMappedProps = selector(atom.get())
          if (differs(mappedProps.current, nextMappedProps)) {
            rerender({})
          }
        }

        return function destroy() {
          didUnobserve = true
          unobserve()
        }
      },
      [atom, observe, selector, order, mappedProps, rerender],
    )

    // always return fresh mapped props, in case
    // this is a parent rerendering children
    return mappedProps.current
  }

  function useActions() {
    const atom = useAtom()
    return atom && atom.actions
  }

  function useDispatch() {
    const atom = useAtom()
    return atom && atom.dispatch
  }

  function useAtom() {
    const { atom } = useContext(AtomContext)
    return atom
  }

  return { useSelector, useActions, useDispatch, useAtom }
}

function assert(cond, error) {
  if (!cond) {
    throw new Error(error)
  }
}

const hooks = createHooks(AtomContext)

export const useAtom = hooks.useAtom
export const useSelector = hooks.useSelector
export const useActions = hooks.useActions
export const useDispatch = hooks.useDispatch
