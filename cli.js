#!/usr/bin/env node
const sao = require('sao')

const s = sao({ 
  generator: "./",
  outDir: './output',
  logLevel: 4
})

s.run()
.catch((err) => {
  console.trace(err)
  process.exit(1)
})