#! /usr/bin/env node

// guided by https://blog.shahednasser.com/how-to-create-a-npx-tool/

const fs = require('fs').promises;
const path = require('node:path')
const loadingSpinner = require('loading-spinner')
const { spawn } = require('node:child_process')
const commandLineArgs = require('command-line-args')

const SPINNER_OPTIONS = { clearChar: true, hideCursor: true }
const SPINNER_SPEED = 400

/**
 * Processes the command line arguments
 * @returns {{ sandboxDirectory: string, typescript: boolean }} the command line options
 */
function getCommandLineArgs() {
    const optionDefinitions = [
        { name: 'sandboxDirectory', type: String, defaultOption: true },
        { name: 'typescript', type: Boolean, alias: 't' }
    ]
    try {
        return commandLineArgs(optionDefinitions, { stopAtFirstUnknown: true })
    } catch (e) {
        if (e.name === 'ALREADY_SET') {
            throw new Error('Typescript flag was set more than once. The flag is only permitted to be set 0 or 1 times.')
        }
        throw new Error('Unknown error while parsing command line.\nCalls should follow the format: `npx create-react-sandbox <sandbox-name> [-t]`')
    }
}

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
    const options = getCommandLineArgs()
    const sandboxDirectory = options.sandboxDirectory

    process.stdout.write('Initializing the sandbox ')
    loadingSpinner.start(SPINNER_SPEED, SPINNER_OPTIONS)

    // TODO: catch the directory already existing
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
    loadingSpinner.start(SPINNER_SPEED, SPINNER_OPTIONS)

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

main().catch((err) => { console.log(err.message) })
