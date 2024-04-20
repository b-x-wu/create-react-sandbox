#! /usr/bin/env node

const fs = require('fs').promises;
const path = require('node:path')
const loadingSpinner = require('loading-spinner')
const { spawn } = require('node:child_process')
const yargs = require('yargs/yargs')

const SPINNER_OPTIONS = { clearChar: true, hideCursor: true }
const SPINNER_SPEED = 400

/**
 * Processes the command line arguments
 * @returns {{ sandboxDirectory: string, typescript: boolean }} the command line options
 */
function getCommandLineArgs() {
    return yargs(process.argv.slice(2))
	.option('name', {
	    alias: 'n',
	    describe: 'name of the app',
	    default: 'app',
	    type: 'string',
	})
	.option('typescript', {
	    alias: 't',
	    type: 'boolean',
	    default: false,
	})
	.option('eslint', {
	    alias: 'l',
	    type: 'boolean',
	    default: false,
	})
	.help()
	.parse()
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
    const { name: sandboxDirectory, typescript: isTypescript, eslint: isEslint } = getCommandLineArgs()

    process.stdout.write('Initializing the sandbox...')
    loadingSpinner.start(SPINNER_SPEED, SPINNER_OPTIONS)

    try {
        const staticDirectory = isTypescript ? './static/ts' : './static/js'
        await fs.mkdir(sandboxDirectory)
        await fs.cp(path.join(__dirname, staticDirectory), sandboxDirectory, { recursive: true })
    } catch (e) {
        if (e.code === 'EEXIST') {
            throw new Error(`Directory with name \`${sandboxDirectory}\` already exists.`)
        }

        throw new Error('Unknown error copying config files.')
    }

    await modifyFile(path.join(sandboxDirectory, 'package.json'), (jsonContents) => {
        const jsonObject = JSON.parse(jsonContents)
        jsonObject.name = sandboxDirectory
        return JSON.stringify(jsonObject, null, 2)
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

main().catch((err) => {
    loadingSpinner.stop()
    console.log('\n' + err.message)
})
