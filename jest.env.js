'use strict'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const NodeEnvironment = require('jest-environment-node')

class TextileEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup()
    this.global.Uint8Array = Uint8Array
    this.global.ArrayBuffer = ArrayBuffer
  }
  async teardown() {
    await super.teardown()
  }
  runScript(script) {
    return super.runScript(script)
  }
}

module.exports = TextileEnvironment
