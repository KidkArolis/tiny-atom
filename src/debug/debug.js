const c = console
const tryCatch = (fn, elseFn) => {
  try {
    fn()
  } catch (e) {
    elseFn()
  }
}
const log = (...args) => c.log(...args)
const groupStart = (...args) => tryCatch(() => c.groupCollapsed(...args), () => c.log(...args))
const groupEnd = () => tryCatch(() => c.groupEnd(), () => {})
const warn = (...args) => tryCatch(() => c.warn(...args), () => {})

const dictionary = {
  E: { color: '#2196F3', text: 'CHANGED:' },
  S: { color: '#F44336', text: 'CHANGED:' },
  N: { color: '#4CAF50', text: 'ADDED:' }
}

function style(kind) {
  return `color: ${dictionary[kind].color}; font-weight: bold;`
}

function stringify(v) {
  return typeof v === 'function' ? v.toString() : JSON.stringify(v)
}

function printDiff(prev, next) {
  for (let i in prev) {
    if (prev[i] !== next[i]) {
      const same = stringify(prev[i]) === stringify(next[i])
      const kind = same ? 'S' : 'E'
      groupStart(`%c   ${dictionary[kind].text}`, style(kind), i, same ? '- values look the same!' : '')
      log('prev', prev[i])
      log('next', next[i])
      groupEnd()
    }
  }
  for (let i in next) {
    if (!(i in prev)) {
      const kind = 'N'
      groupStart(`%c   ${dictionary[kind].text}`, style(kind), i)
      log('next', next[i])
      groupEnd()
    }
  }
  return false
}

// This is to uglify out this entire module in production
if (process.env.NODE_ENV !== 'production') {
  module.exports.children = function(component, prevChildren, nextChildren) {
    warn(component, 'will rerender – children changed')
    console.log(`%c   ${dictionary['E'].text}`, style('E'), prevChildren, '→', nextChildren)
  }

  module.exports.props = function(component, prevProps, nextProps) {
    warn(component, 'will rerender – props changed')
    printDiff(prevProps, nextProps)
  }
}
