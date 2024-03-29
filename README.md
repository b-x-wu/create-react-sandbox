# Create React Sandbox

[![Test base module on Ubuntu](https://github.com/bruce-x-wu/create-react-sandbox/actions/workflows/workflow_js.yml/badge.svg)](https://github.com/bruce-x-wu/create-react-sandbox/actions/workflows/workflow_js.yml)
[![Test TypeScript support on Ubuntu](https://github.com/bruce-x-wu/create-react-sandbox/actions/workflows/workflow_ts.yml/badge.svg)](https://github.com/bruce-x-wu/create-react-sandbox/actions/workflows/workflow_ts.yml)

Create a lightweight React sandbox on your local system that runs like [Create React App](https://github.com/facebook/create-react-app) but without all the dependencies.

So far, Create React Sandbox has been tested on Windows and on an Ubuntu Github workflow. If something does not work please [file an issue](https://github.com/bruce-x-wu/create-react-sandbox/issues).

## Getting Started

First, install Create React Sandbox with

```bash
npm install -g create-react-sandbox
```

To use, run

```bash
npx create-react-sandbox react-sandbox
cd react-sandbox
npm start
```

If you would like to use TypeScript in your project, run with the `-t` flag.

```bash
npx create-react-sandbox react-sandbox-with-typescript -t
cd react-sandbox-with-typescript
npm start
```

In either case, the sandbox app will run on [http://localhost:3001](http://localhost:3001) (or if you have a `PORT` environment variable set, it will run on that instead).

To build your code, run `npm run build`. The build output will be in the `dist` directory.

## Use Cases

For the most part, Create React Sandbox runs like the preinstalled Create React App. However, Create React App contains ["hundreds of transitive build tool dependencies"](https://github.com/facebook/create-react-app#popular-alternatives) that are not necessary for most demos, tests, and small projects. The longer initialization time, the package size, and the boilerplate all become prohibitive to the actual coding. While the Webpack and Babel configurations are no longer obscured, Create React Sandbox allows users who don't need the heft of Create React App to get their code off the ground faster.
