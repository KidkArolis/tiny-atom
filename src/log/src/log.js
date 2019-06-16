import computeDiff from 'deep-diff'

const dictionary = {
  N: { color: '#4CAF50', text: 'ADDED', atext: 'added' },
  E: { color: '#2196F3', text: 'UPDATED' },
  D: { color: '#F44336', text: 'DELETED', atext: 'deleted' },
  A: { color: '#2196F3', text: 'ARRAY' }
}

export const createLog = (options = {}) => {
  options.diff = typeof options.diff === 'undefined' ? true : options.diff
  options.actions = typeof options.actions === 'undefined' ? false : options.actions
  options.updates = typeof options.updates === 'undefined' ? true : options.updates
  options.include = options.include || []
  options.exclude = options.exclude || []
  options.level = options.level || 'loud'

  const logger = options.logger || console

  const tryCatch = (fn, elseFn) => {
    try {
      fn()
    } catch (e) {
      elseFn()
    }
  }
  const log = (...args) => logger.log(...args)
  const groupStart = (...args) => tryCatch(() => logger.groupCollapsed(...args), () => logger.log(...args))
  const groupEnd = () => tryCatch(() => logger.groupEnd(), () => {})

  return ({ type, atom, action, sourceActions, prevState, message, silent }) => {
    if (options.level === 'none') return

    const sourceAction = type === 'action' ? action : sourceActions[sourceActions.length - 1] || {}
    if (options.include.length && !options.include.includes(sourceAction.type)) return
    if (options.exclude.length && options.exclude.includes(sourceAction.type)) return

    if (silent && options.level !== 'verbose') return

    if (type === 'action' && options.actions) {
      const actions = sourceActions.concat(action)
      groupStart(`🚀 ${actions.map(a => a.type).join(' → ')}`)
      log('payload', action.payload)
      log('chain', actions)
      groupEnd()
    }

    if (type === 'update' && options.updates) {
      let diff
      let diffSummaryMap = {}
      let diffSummary = []
      if (options.diff) {
        diff = computeDiff(prevState, atom.get())
        if (diff) {
          diff.forEach(change => {
            diffSummaryMap[change.kind] = diffSummaryMap[change.kind] ? diffSummaryMap[change.kind] + 1 : 1
          })
          Object.keys(dictionary).forEach(kind => {
            if (diffSummaryMap[kind]) {
              diffSummary.push(`${diffSummaryMap[kind]} ${dictionary[kind].text.toLowerCase()}`)
            }
          })
        }
      }

      groupStart(`🙌 ${sourceActions.map(a => a.type).join(' → ') || '–'}`, message ? '»' : '', message || '')
      log('curr', atom.get())
      log('prev', prevState)
      log('update', action.payload)
      log('chain', ...sourceActions)
      if (diff) printDiff(diff)
      groupEnd()
    }
  }

  function style(kind) {
    return `color: ${dictionary[kind].color}; font-weight: bold;`
  }

  function render(diff) {
    let { kind, path, lhs, rhs, index, item } = diff

    path = path || []

    switch (kind) {
      case 'E':
        return [path.join('.'), lhs, '→', rhs]
      case 'N':
        return [path.join('.'), rhs]
      case 'D':
        return [path.join('.')]
      case 'A':
        return [`${path.join('.')}[${index}]`, dictionary[item.kind].atext].concat(render(item).slice(1))
      default:
        return []
    }
  }

  function printDiff(diff) {
    diff.forEach(elem => {
      const { kind } = elem
      logger.log(`%c${dictionary[kind].text}`, style(kind), ...render(elem))
    })
  }
}
