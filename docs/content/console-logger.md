---
title: Console logger
---

Sometimes it's useful to see a log of all the actions and state updates. **Tiny Atom** ships with a built in console logger.

Enable it like this:

```js
const createAtom = require('tiny-atom')
const log = require('tiny-atom/log')

const atom = createAtom(initialState, actions, { debug: log() })
```

Open browser's console to see what actions are firing and what state updates are being applied.

### `log(options)`

Create the logger.

#### actions
*type*: `boolean`
*default*: `false`

Print actions.

#### updates
*type*: `boolean`
*default*: `true`

Print updates.

#### diff
*type*: `boolean`
*default*: `true`

Print state diff to see what changed, what was added or removed.

### diffLimit
*type*: `number`
*default*: `10`

How many changes to log uncollapsed. Set to `-1` to print all changes.

#### include
*type*: `array`
*default*: `[]`

If non empty, only the these actions will be logged.

#### exclude
*type*: `array`
*default*: `[]`

If non empty, these actions will not be logged.

#### logger
*type*: `object`
*default*: `console`

Plug in an alternative logger, needs to have `group`, `groupCollapsed`, `groupEnd`, `log`.
