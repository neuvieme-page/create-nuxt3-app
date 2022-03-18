const pkg = require('./package-util.js')

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
        const out = pkg.load(data, generator)
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
