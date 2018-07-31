const differ = require('deep-diff')

const dictionary = {
  E: {
    color: '#2196F3',
    text: 'CHANGED:'
  },
  N: {
    color: '#4CAF50',
    text: 'ADDED:',
    atext: 'added'
  },
  D: {
    color: '#F44336',
    text: 'DELETED:',
    atext: 'deleted'
  },
  A: {
    color: '#2196F3',
    text: 'ARRAY:'
  }
}

module.exports = (options = {}) => {
  options.diff = typeof options.diff === 'undefined' ? true : options.diff
  options.actions = typeof options.actions === 'undefined' ? true : options.actions
  options.updates = typeof options.updates === 'undefined' ? true : options.updates
  options.include = options.include || []
  options.exclude = options.exclude || []
  const logger = options.logger || console

  return ({ type, atom, action, sourceActions, prevState }) => {
    const sourceAction = type === 'action' ? action : sourceActions[sourceActions.length - 1] || {}
    if (options.include.length && !options.include.includes(sourceAction.type)) return
    if (options.exclude.length && options.exclude.includes(sourceAction.type)) return

    if (type === 'action' && options.actions) {
      const actions = sourceActions.concat(action)
      groupStart(`🚀 ${actions.map(a => a.type).join(' → ')}`, true)
      logger.log('payload', action.payload)
      logger.log('chain', actions)
      groupEnd()
    }

    if (type === 'update' && options.updates) {
      groupStart(`🙌 ${sourceActions.map(a => a.type).join(' → ')}`, true)
      logger.log('payload', action.payload)
      logger.log('chain', sourceActions)
      logger.log('update', action.payload)
      logger.log('prev state', prevState)
      logger.log('curr state', atom.get())
      groupEnd()
      if (options.diff) {
        diff(prevState, atom.get())
      }
    }
  }

  function style (kind) {
    return `color: ${dictionary[kind].color}; font-weight: bold;`
  }

  function render (diff) {
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

  function diff (prev, next) {
    const diff = differ(prev, next)
    if (diff) {
      diff.forEach((elem) => {
        const { kind } = elem
        const output = render(elem)
        logger.log(`%c ${dictionary[kind].text}`, style(kind), ...output)
      })
    }
  }

  function groupStart (msg, isCollapsed) {
    try {
      if (isCollapsed) {
        logger.groupCollapsed(msg)
      } else {
        logger.group(msg)
      }
    } catch (e) {
      logger.log(msg)
    }
  }

  function groupEnd () {
    try {
      logger.groupEnd()
    } catch (e) {}
  }
}
