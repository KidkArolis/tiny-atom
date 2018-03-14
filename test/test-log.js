const test = require('ava')
const log = require('../src/log')

test('logs out a formatted message', async t => {
  const buffer = []
  const push = (...msg) => {
    const start = msg.slice(0, -1)
    const end = msg.slice(-1)[0]
    buffer.push(
      `${start.join(' ')} ${(typeof end === 'string' ? end : JSON.stringify(end))}`
    )
  }
  const logger = {
    groupCollapsed: push,
    groupEnd: () => {},
    log: push
  }

  log({ type: 'action', action: { type: 'foo', seq: 1 }, sourceActions: [] }, logger)

  t.deepEqual(buffer, [
    '•• %c%cfoo (1) color: #888 color: #05823d payload ∅',
    'type %caction color: blue',
    'action {"type":"foo","seq":1}',
    'source []'
  ])

  const atom = { get: () => ({ state: 1 }) }
  log({ type: 'update', action: { payload: { slice: 1 }, seq: 2 }, sourceActions: [], atom }, logger)

  t.deepEqual(buffer.slice(4), [
    '•• %c——%c color: #888 color: #05823d update  {"slice":1}',
    'type %cupdate color: blue',
    'action {"payload":{"slice":1},"seq":2}',
    'source []',
    'patch {"slice":1}',
    'prevState undefined',
    'currState {"state":1}'
  ])
})
