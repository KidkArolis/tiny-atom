var gray = 'color: #888'
var black = 'color: #05823d'

module.exports = function log (info) {
  var prefix
  var isAction = info.type === 'action'
  var isUpdate = info.type === 'update'

  var label = info.sourceActions
    .map(actionName)
    .concat(isAction ? ['%c' + actionName(info.action)] : !info.sourceActions.length ? ['——'] : [])
    .join(' → ') + (!isAction ? '%c' : '')

  if (isAction) {
    prefix = !info.sourceActions.length ? '••' : ' •'
    console.groupCollapsed(prefix + ' %c' + label, gray, black, info.action.payload || '')
    console.log('type %caction', 'color: blue')
    console.log('action', info.action)
    console.log('source', info.sourceActions)
    console.groupEnd()
  }

  if (isUpdate) {
    prefix = !info.sourceActions.length ? '••' : '  '
    console.groupCollapsed(prefix + ' %c' + label, gray, black, info.action.payload || '')
    console.log('type %cupdate', 'color: blue')
    console.log('action', info.action)
    console.log('source', info.sourceActions)
    console.log('patch', info.action.payload)
    console.log('prevState', info.prevState)
    console.log('currState', info.atom.get())
    console.groupEnd()
  }
}

function actionName (action) {
  return action.type + ' (' + action.seq + ')'
}
