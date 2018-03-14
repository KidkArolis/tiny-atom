const gray = 'color: #888'
const green = 'color: #05823d'
const blue = 'color: blue'

module.exports = function log (info, logger) {
  const { log, groupCollapsed, groupEnd } = logger || console
  let prefix
  const isAction = info.type === 'action'
  const isUpdate = info.type === 'update'

  const label = info.sourceActions
    .map(actionName)
    .concat(isAction ? ['%c' + actionName(info.action)] : !info.sourceActions.length ? ['——'] : [])
    .join(' → ') + (!isAction ? '%c' : '')

  if (isAction) {
    prefix = !info.sourceActions.length ? '••' : ' •'
    groupCollapsed(prefix + ' %c' + label, gray, green, 'payload', ifUndefined(info.action.payload, '∅'))
    log('type %caction', blue)
    log('action', info.action)
    log('source', info.sourceActions)
    groupEnd()
  }

  if (isUpdate) {
    prefix = !info.sourceActions.length ? '••' : '  '
    groupCollapsed(prefix + ' %c' + label, gray, green, 'update ', ifUndefined(info.action.payload, '∅'))
    log('type %cupdate', blue)
    log('action', info.action)
    log('source', info.sourceActions)
    log('patch', info.action.payload)
    log('prevState', info.prevState)
    log('currState', info.atom.get())
    groupEnd()
  }
}

function actionName (action) {
  return action.type + ' (' + action.seq + ')'
}

function ifUndefined (val, fallback) {
  return typeof val === 'undefined' ? fallback : val
}
