---
title: Best practises
---

Some of this advice is fairly opinionated. Don't feel like you need to follow any of this strictly. It's just what we found to work really well when building apps with **Tiny Atom**.

## Data vs State

**Data** is typically application entities such as users, feeds, items, repos, tweets, hashtags, and so on.

**State** is typically UI's state - such as selected feed id, currently displayed item, expanded tweet id and so on.

It's common to keep *all* of the data and *some* of the state in your `atom`. For example, a component such as `datepicker` might be better off keeping it's open state or selected month state in it's own private state object as opposed to the global `atom`. But it really depends, you should use your best judgement and architectural goals.

## Debounce renders

With **Tiny Atom** you register your render callback when creating the store.

```js
createAtom(initialState, evolve, render)
```

The `render` callback is called every time the state is updated. To make your app renders much more efficient, you should typically wrap your render function with a [`debounce`](https://lodash.com/docs/4.17.4#debounce). This ensures that you don't needlessly rerender the app more than once a frame.

```js
const _ = require('lodash')
const debouncedRender = _.debounce(render, 1000 / 60)
createAtom(initialState, evolve, debouncedRender)
```

Sometimes, this technique can get in the way when state updates and rerenders need to be controlled very precisely. For example, it's typical when doing CSS animations to quickly add and remove certain css classes in sequence to trigger animations. In these cases you can use a more sophisticated technique.

```js
createAtom(initialState, evolve, onChange)
function onChange (atom) {
    if (atom.get().sync) {
        render()
    } else {
        debouncedRender()
    }
}

// somewhere in the code
split({ sync: true })
split('fadeIn')
split({ sync: false })
```

## Immutable

Never mutate the state directly. Don't do

```js
atom.get().state.list.push('todo')
```

Instead, always use `split` to send actions to atom. This in general is typically a good practise in your JavaScript applications. It makes reasoning about each piece of logic easier.

## Deep assign

The default update merge strategy in **Tiny Atom** is `Object.assign({}, state, update)` . Once the app grows larger, it becomes common to need to update nested objects. Consider in those cases using a custom `merge` implementation. For example:

```js
function deepMerge (state, update) {
  const merged = assign({}, state, update)
  Object.keys(update).forEach(key => {
    if (state &&
        update &&
        update[key] !== state[key] &&
        isObject(update[key]) &&
        isObject(state[key])
     ) {
      merged[key] = deepMerge(state[key], update[key])
    }
  })
  return merged
}

function isObject (obj) {
  return typeof obj === 'object' && Object.prototype.toString.call(obj) === '[object Object]'
}

const atom = createAtom({ user: {}, feed: { items: { loading: false } } }, evolve, render, { merge: deepMerge })

// without deep merge, it's a lot of work to update a nested value
const nextState = Object.assign({}, atom.get())
nextState.feed = Object.assign({}, nextState.feed)
nextState.feed.items = Object.assign({}, nextState.feed.items)
nextState.feed.items.loading = true
atom.split(nextState)

// it's much easier with zaphod library
const { setIn } = require('zaphod/compat')
atom.split(setIn(atom.get(), ['feed', 'items', 'loading'], true))

// but because of deepMerge, we can also now do this
atom.split({ feed: { items: { loading: true } } })
```

## Use zaphod or similar libraries

[Zaphod](https://zaphod.surge.sh/) is a really neat library for updating plain JavaScript objects in immutable ways. In particular functions like `get`, `getIn`, `set`, `setIn`, `unset`, `update`, `updateIn`, `push`, `pop`, `merge` all make it quite easy to update your state without mutating it. It's a great alternative to libraries such as Immutable.js. While Immutable is great - it has a fairly large API surface and conceals data within custom objects making it harder to debug. We all wish JavaScript supported immutable data structures natively, but good ol plain JavaScript data structures can be more than enough. And libraries like `Zaphod` make it a joy to work with them.

## Avoid splitting raw changes

Atom allows both forms of split: `split({ count: 5 })` or `split('increment', 5)`. They both exist for symmetry of the API where `split` behaves the same inside and outside of `evolve`. It can also be useful for testing or developing tiny applications where you don't need much more than a shared state object that's easy to update without even introducing actions.

But for any larger applications it will always be better to split actions that get handled in the store. This keeps all the logic away from your views. And makes it easier to track changes when debugging.

## Extend

Don't be afraid to read the code of **Tiny Atom** to really understand what's going on under the hood. Once you understand the concept behind it - don't be afraid to implement custom `evolve` strategies to fit your specific application needs.
