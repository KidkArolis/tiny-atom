---
title: Best practises
---

Some of this advice is fairly opinionated. Don't feel like you need to follow any of this strictly. It's just what we found to work really well when building apps with **Tiny Atom**.

## Data vs State

**Data** is typically application entities such as users, feeds, items, repos, tweets, hashtags, and so on.

**State** is typically UI's state - such as selected feed id, currently displayed item, expanded tweet id and so on.

It's common to keep *all* of the data and *some* of the state in your `atom`. For example, a component such as `datepicker` might be better off keeping it's open state or selected month state in it's own private state object as opposed to the global `atom`. But it really depends, you should use your best judgement and architectural goals.

## Immutable

Never mutate the state directly. Don't do

```js
get().state.list.push('todo')
```

This in general is typically a good practise in your JavaScript applications and can prevent many bugs. It makes reasoning about each piece of logic easier and avoids suprising effects where callee changes the variables of the caller. 

In addition, the React and Preact connectors `connect` and `<Consumer>` are optimised by default to use strict equality checks after mapping state to props to decide whether the components should rerender.

## Use zaphod or similar libraries

[Zaphod](https://zaphod.surge.sh/) is a really neat library for updating plain JavaScript objects in immutable ways. In particular functions like `get`, `getIn`, `set`, `setIn`, `unset`, `update`, `updateIn`, `push`, `pop`, `merge` all make it quite easy to update your state without mutating it. It's a great alternative to libraries such as Immutable.js. While Immutable is great - it has a fairly large API surface and conceals data within custom objects making it harder to debug. We all wish JavaScript supported immutable data structures natively, but good ol plain JavaScript data structures can be more than enough. And libraries like `Zaphod` make it a joy to work with them.

## Extend

Don't be afraid to read the code of **Tiny Atom** to really understand what's going on under the hood. Once you understand the concepts behind it - consider using custom `evolve` or `merge` hooks to fit your specific application needs.
