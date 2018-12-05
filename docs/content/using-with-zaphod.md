---
title: Using with Zaphod
---

[Zaphod](https://zaphod.surge.sh/) is a neat library for updating plain JavaScript objects in an immutable way. In particular functions like `get`, `getIn`, `set`, `setIn`, `unset`, `update`, `updateIn`, `push`, `pop`, `merge` all make it quite easy to update your state without mutating it. It's a great alternative to libraries such as Immutable.js. While Immutable.js is great - it has a fairly large API surface and conceals data within custom objects making it harder to debug. We all wish JavaScript supported immutable data structures natively, but good ol plain JavaScript data structures can be more than enough. And libraries like `Zaphod` make it a joy to work with them.

**actions.js**
```js
import { getIn, setIn, updateIn, merge } from 'zaphod/compat'

export default {
  fetchMoreItems: async ({ get, set }) => {
    // check if we're already loading
    if (getIn(get(), ['feed', 'loading'])) return

    // set loading true
    set(setIn(get(), ['feed', 'loading'], true))

    // get next page cursor and fetch the data
    const nextPage = getIn(get(), ['feed', 'nextPage'])
    const { data } = axios.get('/feed?page=' + nextPage)

    // merge the newly loaded items into the feed
    set(updateIn(get(), ['feed'], feed => merge(feed, {
      loading: false,
      nextPage: data.nextPage,
      items: feed.items.concat(data.items)
    })))
}
```
