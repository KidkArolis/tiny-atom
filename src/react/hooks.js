const { useContext, useEffect, useState, useRef } = require('react')
const { AtomContext, differ } = require('../react')

const isServer = typeof navigator === 'undefined'

function useAtom (selector, options = {}) {
  selector = selector || (() => null)
  const { sync = true, pure = true, observe = !isServer } = options
  const { atom } = useContext(AtomContext)
  const [mappedProps, setMappedProps] = useState(selector(atom.get()))
  const mappedPropsRef = useRef()

  useEffect(function () {
    mappedPropsRef.value = mappedProps
  })

  useEffect(
    () => {
      if (!observe) return
      return atom.observe(atom => {
        const nextMapped = selector(atom.get())
        if (!pure || differ(mappedPropsRef.value, nextMapped)) {
          setMappedProps(nextMapped)
        }
      })
    },
    [atom]
  )

  return mappedProps
}

function useActions () {
  const { atom } = useContext(AtomContext)
  return atom.actions
}

module.exports = { useAtom, useActions }
