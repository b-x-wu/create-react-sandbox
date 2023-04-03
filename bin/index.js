#! /usr/bin/env node

// guided by https://blog.shahednasser.com/how-to-create-a-npx-tool/

const fs = require('fs').promises;
const path = require('node:path')
const util = require('util')
const loadingSpinner = require('loading-spinner')
const { spawn } = require('node:child_process')

const spinnerOptions = { clearChar: true, hideCursor: true }
const SPINNER_SPEED = 400

if (process.argv.length < 3) {
    console.error('Please speicify the project directory')
    process.exit(1)
}

const sandboxDirectory = process.argv[2]

/**
 * Changes the contents of a given file according to a modification function
 * @param {string} fileName 
 * @param {(fileContents: string) => string} modifyFunction 
 */
async function modifyFile(fileName, modifyFunction) {
    const fileContents = await fs.readFile(fileName, { encoding: 'utf-8' })
    const newFileContents = modifyFunction(fileContents)
    await fs.writeFile(fileName, newFileContents)
}

/**
 * Run npm install to install the dependencies
 * https://stackoverflow.com/a/43285131
 * @param {string} sandboxDirectory 
 * @param {(chunk: any) => void} onData listener for when data is sent 
 * @param {(chunk: any) => void} onErr listener for when error data is sent 
 * @param {(code: number | null, signal: NodeJS.Signals | null) => void} onExit listener for when the process completes 
 */
function installDependencies(sandboxDirectory, onData, onErr, onExit) {
    const npmCommand = /^win/.test(process.platform) ? 'npm.cmd' : 'npm'
    const npmInit = spawn(npmCommand, ['install'], {
        cwd: './' + sandboxDirectory
    })

    npmInit.stdout.on('data', onData)

    npmInit.stderr.on('data', onErr)

    npmInit.on('exit', onExit)
}

/**
 * Run the main thread of the program
 */
async function main() {
    process.stdout.write('Initializing the sandbox ')
    loadingSpinner.start(SPINNER_SPEED, spinnerOptions)

    await fs.mkdir(sandboxDirectory)
    await fs.cp(path.join(__dirname, './static'), sandboxDirectory, { recursive: true })

    await modifyFile(path.join(sandboxDirectory, 'package.json'), (jsonContents) => {
        const jsonObject = JSON.parse(jsonContents)
        jsonObject.name = sandboxDirectory
        return JSON.stringify(jsonObject, null, 4)
    })
    
    loadingSpinner.stop()
    process.stdout.write('\rInitialized the sandbox!\n')
    process.stdout.write('Installing dependencies ')
    loadingSpinner.start(SPINNER_SPEED, spinnerOptions)

    installDependencies(
        sandboxDirectory, 
        (data) => {
            loadingSpinner.stop()
            process.stdout.write('\rInstalled dependencies!\n')
            process.stdout.write(data.toString())
        },
        (data) => {
            loadingSpinner.stop()
            process.stdout.write('\rError installing dependencies!\n')
            throw new Error(data.toString())
        },
        () => {
            console.log(`React sandbox is set up. Run \`cd ${sandboxDirectory} && npm start\` to begin. Happy hacking!`)
        }
    )
}

main().catch((err) => { console.log(err) })
