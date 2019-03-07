const { useContext, useEffect, useState, useRef } = require('react')
const { AtomContext, differ } = require('../react')
const raf = require('../raf')

const isServer = typeof navigator === 'undefined'

function useAtom (selector, options = {}) {
  selector = selector || (state => state)
  const { sync = false, pure = true, observe = !isServer } = options
  const schedule = sync ? fn => () => fn() : raf
  const { atom } = useContext(AtomContext)
  assert(atom, 'No atom found in context, did you forget to wrap your app in <Provider atom={atom} />?')
  const [, triggerRerender] = useState({})
  const ref = useRef({ mappedProps: null, atom: null })

  ref.current.atom = atom
  ref.current.mappedProps = selector(atom.get())

  // keep track of rendering order
  // this is important for correctness – parent must rerender first
  // and performance – parent rerendering children should cancel
  // children's scheduled rerenders
  if (!ref.current.order) {
    atom._i = atom._i ? atom._i + 1 : 1
    ref.current.order = atom._i
  }

  // cancel any pending scheduled updates after each render
  // since we just go rerendered by the parent component
  if (ref.current.cancelUpdate) {
    ref.current.cancelUpdate()
    ref.current.cancelUpdate = null
  }

  useEffect(() => {
    if (!observe) return
    ref.current.unobserve = atom.observe(onChange, ref.current.order)
    onChange()
    function onChange () {
      // store updates happening in rapid sequence
      // get cancelled and rescheduled
      if (ref.current.cancelUpdate) {
        ref.current.cancelUpdate()
        ref.current.cancelUpdate = null
      }
      // schedule an update
      ref.current.cancelUpdate = schedule(() => {
        ref.current.cancelUpdate = null
        const nextMappedProps = selector(atom.get())
        if (!pure || differ(ref.current.mappedProps, nextMappedProps)) {
          triggerRerender({})
        }
      })()
    }
    return () => {
      ref.current.unobserve && ref.current.unobserve()
      if (ref.current.cancelUpdate) {
        ref.current.cancelUpdate()
        ref.current.cancelUpdate = null
      }
    }
  }, [atom])

  // always return fresh mapped props, in case
  // this is a parent rerendering children
  return ref.current.mappedProps
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

module.exports = { useAtom, useActions, useDispatch }
