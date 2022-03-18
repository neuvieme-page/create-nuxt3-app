#!/usr/bin/env node
const sao = require('sao')
const path = require('path')
const cac = require('cac')
const fs = require('fs')
const chalk = require('chalk')
var { execSync } = require('child_process')
const envinfo = require('envinfo')
const { version } = require('./package.json')

const generator = path.resolve(__dirname, './')


const list = execSync('ls')
console.log(list.toString())

//passsing directoryPath and callback function
fs.readdir(__dirname, function (err, files) {
  //handling error
  if (err) {
      return console.log('Unable to scan directory: ' + err);
  }
  //listing all files using forEach
  files.forEach(function (file) {
      // Do whatever you want to do with the file
      console.log(file);
  });
});



const showEnvInfo = async () => {
  console.log(chalk.bold('\nEnvironment Info:'))
  const result = await envinfo
    .run({
      System: ['OS', 'CPU'],
      Binaries: ['Node', 'Yarn', 'npm'],
      Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
      npmGlobalPackages: ['nuxt', 'create-nuxt-app']
    })
  console.log(result)
  process.exit(1)
}

const cli = cac('create-nuxt-app')

function run() {
  cli
    .command('[out-dir]', 'Generate in a custom directory or current directory')
    .option('-i, --info', 'Print out debugging information relating to the local environment')
    .option('--verbose', 'Show debug logs')
    .option('--overwrite-dir', 'Overwrite the target directory')
    .action((outDir = '.', cliOptions) => {
      console.log('bruh')
      if (cliOptions.info) {
        return showEnvInfo()
      }
      console.log()
      console.log(chalk`{cyan create-nuxt3-app v${version}}`)

      const { verbose, overwriteDir } = cliOptions
      if (fs.existsSync(outDir) && fs.readdirSync(outDir).length && !overwriteDir) {
        const baseDir = outDir === '.' ? path.basename(process.cwd()) : outDir
        return console.error(chalk.red(
          `Could not create project in ${chalk.bold(baseDir)} because the directory is not empty.`))
      }

      console.log(chalk`✨  Generating Nuxt.js project in {cyan ${outDir}}`)

      const logLevel = verbose ? 4 : 2
      // See https://sao.vercel.app/api.html#standalone-cli
      sao({ generator, outDir, logLevel, cliOptions })
        .run()
        .catch((err) => {
          console.trace(err)
          process.exit(1)
        })
    })

  cli.help()

  cli.version(version)

  cli.parse()
}

try {
  run()
} catch (err) {
  // https://github.com/cacjs/cac/blob/f51fc2254d7ea30b4faea76f69f52fe291811e4f/src/utils.ts#L152
  // https://github.com/cacjs/cac/blob/f51fc2254d7ea30b4faea76f69f52fe291811e4f/src/Command.ts#L258
  if (err.name === 'CACError' && err.message.startsWith('Unknown option')) {
    console.error()
    console.error(chalk.red(err.message))
    console.error()
    cli.outputHelp()
  } else {
    console.error()
    console.error(err)
  }
  process.exit(1)
}
