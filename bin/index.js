#! /usr/bin/env node

// guided by https://blog.shahednasser.com/how-to-create-a-npx-tool/

const fs = require('fs').promises;
const path = require('node:path')
const util = require('util')
const loadingSpinner = require('loading-spinner')
const { spawn } = require('node:child_process')

const fsOptions = { encoding: 'utf-8' }
const spinnerOptions = { clearChar: true, hideCursor: true }
const SPINNER_SPEED = 400

if (process.argv.length < 3) {
    console.error('Please speicify the project directory')
    process.exit(1)
}

const sandboxDirectory = process.argv[2]

// create the sandbox directory
fs.mkdir(sandboxDirectory).then(() => Promise.all([
    // create the sandbox structure
    fs.mkdir(path.join(sandboxDirectory, 'src')),
    fs.mkdir(path.join(sandboxDirectory, 'public'))
])).then(() => {
    // get the contents of the files to be put into the sandbox
    process.stdout.write('Retrieving sandbox configuration ')
    loadingSpinner.start(SPINNER_SPEED, spinnerOptions)
    return Promise.all([
        fs.readFile(path.join(__dirname, './static/.babelrc'), fsOptions),
        fs.readFile(path.join(__dirname, './static/index.html'), fsOptions),
        fs.readFile(path.join(__dirname, './static/index.jsx'), fsOptions),
        fs.readFile(path.join(__dirname, './static/webpack.config.js'), fsOptions),
        fs.readFile(path.join(__dirname, './static/package.json'), fsOptions)
    ])
}).then((fileTexts) => {
    // create the files in the sandbox
    const [babelrcText, indexHtmlText, indexJsxText, webpackConfigText, packageJsonText] = fileTexts
    const packageOptions = JSON.parse(packageJsonText)
    packageOptions.name = sandboxDirectory

    loadingSpinner.stop()
    process.stdout.write('\rRetrieved sandbox configuration!\n')
    process.stdout.write('Initializing the sandbox ')
    loadingSpinner.start(SPINNER_SPEED, spinnerOptions)

    return Promise.all([
        fs.writeFile(path.join(sandboxDirectory, './.babelrc'), babelrcText),
        fs.writeFile(path.join(sandboxDirectory, './public/index.html'), indexHtmlText),
        fs.writeFile(path.join(sandboxDirectory, './src/index.jsx'), indexJsxText),
        fs.writeFile(path.join(sandboxDirectory, './webpack.config.js'), webpackConfigText),
        fs.writeFile(path.join(sandboxDirectory, './package.json'), JSON.stringify(packageOptions, null, 4))
    ])
}).then(() => {
    // install the package dependencies
    loadingSpinner.stop()
    process.stdout.write('\rInitialized the sandbox!\n')
    process.stdout.write('Installing dependencies ')
    loadingSpinner.start(SPINNER_SPEED, spinnerOptions)

    // https://stackoverflow.com/a/43285131
    const npmCommand = /^win/.test(process.platform) ? 'npm.cmd' : 'npm'
    const npmInit = spawn(npmCommand, ['install'], {
        cwd: './' + sandboxDirectory
    })

    npmInit.stdout.on('data', (data) => {
        loadingSpinner.stop()
        process.stdout.write('\rInstalled dependencies!\n')
        process.stdout.write(data.toString())
    })

    npmInit.stderr.on('data', (data) => {
        loadingSpinner.stop()
        process.stdout.write('\rError installing dependencies!\n')
        process.stdout.write(data.toString())
    })

    npmInit.on('exit', (code) => {
        console.log(`React sandbox is set up. Run \`cd ${sandboxDirectory} && npm start\` to begin. Happy hacking!`)
    })
}).catch((err) => {
    console.log(err)
})
