const isObject = (value) => {
  return !!value &&
  typeof value === 'object' &&
  typeof value.getMonth !== 'function' &&
  !Array.isArray(value)
}

const merge = (...sources) => {
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

const sortByKey = (unsortedObject) => {
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
  return JSON.parse(JSON.stringify(requireFile(filename)))
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
  isObject,
  merge,
  sortByKey,
  requireFile,
  requireJSON,
  loadPackage,
  load
}
