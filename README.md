# Create React Sandbox

[![Tests](https://github.com/b-x-wu/create-react-sandbox/actions/workflows/test-workflow.yml/badge.svg)](https://github.com/b-x-wu/create-react-sandbox/actions/workflows/test-workflow.yml)

![NPM Version](https://img.shields.io/npm/v/create-react-sandbox)

Create a lightweight React sandbox on your local system that runs like [Create React App](https://github.com/facebook/create-react-app) but without all the dependencies.

## Getting Started

First, install Create React Sandbox with

```bash
npm install -g create-react-sandbox
```

To use, run

```bash
npx create-react-sandbox
cd app
npm start
```

The sandbox app will run on [http://localhost:3001](http://localhost:3001) (or if you have a `PORT` environment variable set, it will run on that instead).

To build your code, run `npm run build`. The build output will be in the `dist` directory.

## Configuration

To set the name of your sandbox, use the `--name` option.

```bash
npx create-react-sandbox --name project-name
cd project-name
npm start
```

If you would like to use TypeScript in your project, run with the `-t` flag.

```bash
npx create-react-sandbox -t
cd app
npm start
```

To add [Eslint](https://eslint.org) support, run with the `-l` flag.

```bash
npx create-react-sandbox -l # or `npx create-react-sandbox -t -l` for ts and eslint support
cd app
npx eslint
npm start
```

## Use Cases

For the most part, Create React Sandbox runs like the preinstalled Create React App. However, Create React App contains ["hundreds of transitive build tool dependencies"](https://github.com/facebook/create-react-app#popular-alternatives) that are not necessary for most demos, tests, and small projects. The longer initialization time, the package size, and the boilerplate all become prohibitive to the actual coding. While the Webpack and Babel configurations are no longer obscured, Create React Sandbox allows users who don't need the heft of Create React App to get their code off the ground faster.
