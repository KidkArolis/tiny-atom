const gray = 'color: #888'
const green = 'color: #05823d'
const blue = 'color: blue'

module.exports = function log (info, logger) {
  const { log, groupCollapsed, groupEnd } = logger || console
  const isAction = info.type === 'action'
  const isUpdate = info.type === 'update'

  const label = info.sourceActions
    .map(actionName)
    .concat(isAction ? ['%c' + actionName(info.action)] : !info.sourceActions.length ? ['——'] : [])
    .join(' → ') + (!isAction ? '%c' : '')

  if (isAction) {
    groupCollapsed('★ action %c' + label, gray, green, { payload: info.action.payload })
    log('type %caction', blue)
    log('action', info.action)
    log('source', info.sourceActions)
    groupEnd()
  }

  if (isUpdate) {
    groupCollapsed('  update %c' + label, gray, green, ifDef(info.action.payload, '∅'))
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

function ifDef (val, fallback) {
  return typeof val === 'undefined' ? fallback : val
}
