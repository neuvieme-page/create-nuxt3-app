// const { merge, sortByKey } = require('./util')

console.log("Hello", _dirname, __dirname)

function isObject (value)  {
  return !!value &&
  typeof value === 'object' &&
  typeof value.getMonth !== 'function' &&
  !Array.isArray(value)
}

function merge (...sources) {
  const [target, ...rest] = sources

  for (const object of rest) {
    for (const key in object) {
      const targetValue = target[key]
      const sourceValue = object[key]
      const isMergable = isObject(targetValue) && isObject(sourceValue)
      target[key] = isMergable ? merge({}, targetValue, sourceValue) : sourceValue
    }
  }

  return target
}

function sortByKey (unsortedObject)  {
  const sortedObject = {}
  Object.keys(unsortedObject).sort().forEach((key) => {
    sortedObject[key] = unsortedObject[key]
  })
  return sortedObject
}


function requireFile (filename) {
  try {
    return require(filename)
  } catch (error) {
    return {}
  }
}
function requireJSON (filename) {
  return JSON.parse(JSON.stringify(this.requireFile(filename)))
}
function loadPackage (name, generator) {
  if (!name || name === 'none') {
    return {}
  }
  const prefix = name === 'nuxt' ? 'nuxt' : `./frameworks/${name}`
  const pkg = requireJSON(`${prefix}/package.json`)
  const pkgHandler = requireFile(`${prefix}/package.js`)
  return pkgHandler.apply ? pkgHandler.apply(pkg, generator) : pkg
}

function load (source, generator) {
  const packages = generator.answers.features.map(feature => {
    return loadPackage(feature, generator)
  })
  const pkg = merge(source, ...packages)
  pkg.dependencies = sortByKey(pkg.dependencies)
  pkg.devDependencies = sortByKey(pkg.devDependencies)
  return pkg
}

module.exports = {
  templateData () {
    const three = this.answers.features.includes('three')
    const gsap = this.answers.features.includes('gsap')
    const gui = this.answers.features.includes('gui')

    return {
      three,
      gui,
      gsap
    }
  },
  prompts() {
    return [
      {
        name: 'name',
        message: 'What is the name of the new project',
        default: this.outFolder,
        filter: val => val.toLowerCase()
      },
      {
        name: 'description',
        message: 'How would you descripe the new project',
        default: `my awesome project`
      },
      {
        name: 'username',
        message: 'What is your GitHub username',
        default: this.gitUser.username || this.gitUser.name,
        filter: val => val.toLowerCase(),
        store: true
      },
      {
        name: 'email',
        message: 'What is your email?',
        default: this.gitUser.email,
        store: true
      },
      {
        name: 'features',
        message: 'Nuxt.js modules:',
        type: 'checkbox',
        pageSize: 10,
        choices: [
          { name: 'Axios - Promise based HTTP client', value: 'axios' },
          { name: 'three.js', value: 'three' },
          { name: 'GSAP', value: 'gsap' },
          { name: 'GUI', value: 'gui' },
          // { name: 'Progressive Web App (PWA)', value: 'pwa' },
          // { name: 'Netlify CMS', value: 'cms' },
          // { name: 'Netlify functions', value: 'functions' },
        ],
        default: []
      },
      {
        name: 'website',
        message: 'The URL of your website',
        default({ username }) {
          return `github.com/${username}`
        },
        store: true
      }
    ]
  },
  actions() {
    const actions = [
      {
        type: 'add',
        files: '**'
      },
      {
        type: 'move',
        patterns: {
          gitignore: '.gitignore'
        }
      }
    ]

    const generator = this
    actions.push({
      type: 'modify',
      files: 'package.json',
      handler (data) {
        const out = load(data, generator)
        console.log(out)
        return out
      }
    })

    return actions;
  },
  async completed() {
    this.gitInit()
    await this.npmInstall()
    this.showProjectTips()
  }
}
