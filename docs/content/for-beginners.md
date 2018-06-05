---
title: For beginners
---

If you're comfortable with the basics of JavaScript, HTML and CSS, but you've never built a full web app, this section is for you. This section explores one way of building UIs.

If you're already familiar with React and the flux pattern (e.g. Redux), you should check out the [Prior art](/prior-art) section.

## Part 1 - Functional approach to building UIs

[React.js](https://reactjs.org/) has revolutionised UI development. It might not be the final paradigm. It doesn't mean we shouldn't explore new ideas. But right now – React is awesome.

If you're not familiar with React, here is the core idea. *In React - your entire UI is a function that takes some `state` and returns the entire screen*.

```js
fn(state)
```

You don't even need React to apply this idea. Let's explore this a bit further without bringing React in. Let's implement such UI function and insert it's rendered content into the page.

```js
const Header = () => `
  <div>Logo</div>
`

const App = (state) => `
  <div id='App'>
    ${Header()}
    <h1>Count: ${state.count}</h1>
  </div>
`

document.body.innerHTML = App({ count: 5 })
```

That's it. If you want to render the app with different `state`, call `App()` again. That's kind of the core concept behind React. But React does a fair bit more to help us in real world situations:

* it helps us handle user events
* makes it easy to nest individual components
* has hooks for when components are added or removed from the page 
* it uses a virtual dom underneath which makes this all very efficient

So let's rewrite our small example app in React.

```js
const React = require('react')
const ReactDOM = require('react-dom')

const Header = () => (
  <div>Logo</div>
)

const App = (props) => (
  <div id='App'>
    <Header />
    <h1>Count: {state.count}</h1>
  </div>
)

ReactDOM.render(<App count={5} />, document.body)
```

You can imagine composing complex applications from many of these React components.

```js
const App = ({ user, repo, org }) (
  <Container>
    <Header user={user} />
    <RepoHeader org={org} repo={repo} />
    <Tabs>
      <Button>Code</Button>
      <Button>Issues</Button>
      <Button>PullRequests</Button>
    </Tabs>
    <Description />
    <RepoSummaryBar />
    <FileBrowser repo={repo} />
    <Readme />
  </Container>
)
ReactDOM.render(<App {...state} />, document.body)
```

But at the core, you can see how `App` is still a function that takes state and outputs the entire UI - `fn(state)`.

Why is that important? Because it's simple. You can think of each smaller part of the application as yet another function. And all of these functions are  pure and stateless. They take some arguments, return some UI. It's easy to reason about each such function as long as you keep the state outside.

## Part 2 - State management

What we saw in Part 1 is all great and good. But in real world applications, the `state` changes all the time. For example:

* the server state changes when someone posts a comment
* UI interaction ‐ you click "Merge PR"
* VR interaction ‐ you turn your head
* side effect ‐ a game engine ticks and updates the world state

How do you keep the UI up to date.

This is static:

```js
ReactDOM.render(<App state={state}/>, document.body)
```

But this you can call again and again:

```js
function render (state) {
  ReactDOM.render(<App state={state} />, document.body)
}
```

So what if we create an `update` function that can update the state and rerender the app. We can then pass this `update` function to the App and it can call it whenever it needs to change the state.

```js
let state = { count: 0 }

function update (nextState) {
  state = Object.assign({}, state, nextState)
  render()
}

const App ({ state, update }) => (
  <div onClick={() => update({ count: state.count + 1 })}>
    <div>Count: {state.count}</div>
  </div>
)

function render () {
  ReactDOM.render(<App state={state} update={update} />)
}

render()
```

Bam! Whenever some app component needs to update the state it can do so with the `update` function. For example, incrementing a counter after user clicked a button. Or storing a server response for other components to render. This would then in turn cause the entire application to rerender with the new `state`.

The single state store approach is what **Tiny Atom** helps utilise in your applications. With **Tiny Atom** this same example will look more like:

```js
let atom = createAtom({ count: 0 }, {
  increment: ({ get, set }) => {
    const count = get().count
    set({ count: count + 1 })
  }
})
```

const map = (state) => {
  return { count: state.count }
}

const actions = [
  'increment'
]

const App = connect(map, actions)(({ count, increment }) => (
  <div onClick={increment}>
    <div>Count: {count}</div>
  </div>
))

ReactDOM.render(<App />, document.getElementById('root'))
```

Additionally, **Tiny Atom** provides ability to use actions which are self contained pieces of logic that can transition the `state` from one state to the next. You can read more about the actual real world usage of **Tiny Atom** in the [Basics](/basics) section.

## Try it out

If you're new to JavaScript UI development, here are steps for getting a Hello World application running in your browser.

```js
$ npm install ‐g jetpack
$ mkdir hello-world && cd hello-world
$ npm init
$ npm install react react‐dom tiny‐atom
$ echo "ReactDOM.render(<p>Hi</p>, document.body)" > index.js
$ jetpack .
$ open http://localhost:3000
```

Build great apps!
