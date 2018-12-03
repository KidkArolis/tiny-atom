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
  const [mappedProps, setMappedProps] = useState(selector(atom.get()))
  const ref = useRef({ mappedProps, atom })

  // in case atom is swapped, unobserve
  if (ref.current.unobserve && atom !== ref.current.atom) {
    ref.current.unobserve()
    ref.current.unobserve = null
  }

  if (!ref.current.unobserve && observe) {
    ref.current.unobserve = atom.observe(() => {
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
          setMappedProps(nextMappedProps)
        }
      })()
    })
  }

  // cancel a scheduled update on render
  // we just rendered - don't need to render again
  if (ref.current.cancelUpdate) {
    ref.current.cancelUpdate()
    ref.current.cancelUpdate = null
  }

  // unsubscribe from the store
  useEffect(
    () => {
      // note, we already subscribed on first render
      // this effect is only for unsubscribing
      return () => {
        ref.current.unobserve && ref.current.unobserve()
        if (ref.current.cancelUpdate) {
          ref.current.cancelUpdate()
          ref.current.cancelUpdate = null
        }
      }
    },
    [atom]
  )

  // always return fresh mapped props, in case
  // this is a parent rerendering children
  ref.current.mappedProps = selector(atom.get())
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
