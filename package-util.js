const { merge, sortByKey } = require('./util')

module.exports = {
  requireFile (filename) {
    try {
      return require(filename)
    } catch (error) {
      return {}
    }
  },
  requireJSON (filename) {
    return JSON.parse(JSON.stringify(this.requireFile(filename)))
  },
  loadPackage (name, generator) {
    if (!name || name === 'none') {
      return {}
    }
    const prefix = name === 'nuxt' ? 'nuxt' : `./frameworks/${name}`
    const pkg = this.requireJSON(`${prefix}/package.json`)
    const pkgHandler = this.requireFile(`${prefix}/package.js`)
    return pkgHandler.apply ? pkgHandler.apply(pkg, generator) : pkg
  },
  load (source, generator) {
    const packages = generator.answers.features.map(feature => {
      return this.loadPackage(feature, generator)
    })
    const pkg = merge(source, ...packages)
    pkg.dependencies = sortByKey(pkg.dependencies)
    pkg.devDependencies = sortByKey(pkg.devDependencies)
    return pkg
  }
}
