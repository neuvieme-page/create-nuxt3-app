#!/usr/bin/env node
const sao = require('sao')

const s = sao({ 
  generator: "./lib/sao-nuxt3-app",
  outDir: './output',
  logLevel: 4
})

s.run()
.catch((err) => {
  console.trace(err)
  process.exit(1)
})