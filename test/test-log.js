const test = require('ava')
const createLog = require('../src/log')

test('logs out formatted messages', async function(t) {
  const buffer = []
  const push = (...msg) => {
    const start = msg.slice(0, -1)
    const end = msg.slice(-1)[0]
    buffer.push(`${start.join(' ')} ${typeof end === 'string' ? end : JSON.stringify(end)}`)
  }
  const logger = {
    groupCollapsed: push,
    group: push,
    groupEnd: () => {},
    log: push
  }

  const log = createLog({ actions: true, logger })

  log({
    type: 'action',
    action: { type: 'foo', seq: 1 },
    sourceActions: []
  })

  t.deepEqual(buffer, [' 🚀 foo', 'payload undefined', 'chain [{"type":"foo","seq":1}]'])

  const atom = { get: () => ({ state: 1, list: [2, 3] }) }
  log(
    {
      type: 'update',
      action: { payload: { slice: 1 }, seq: 2 },
      sourceActions: [],
      atom,
      prevState: { state: 0, list: [1] }
    },
    logger
  )

  t.deepEqual(buffer.slice(4), [
    'curr {"state":1,"list":[2,3]}',
    'prev {"state":0,"list":[1]}',
    'update {"slice":1}',
    ' chain',
    '%cUPDATED color: #2196F3; font-weight: bold; state 0 → 1',
    '%cARRAY color: #2196F3; font-weight: bold; list[1] added 3',
    '%cUPDATED color: #2196F3; font-weight: bold; list.0 1 → 2'
  ])
})
