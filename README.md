# IPFS Lite _(js-ipfs-lite)_

[![Made by Textile](https://img.shields.io/badge/made%20by-Textile-informational.svg?style=flat-square)](https://textile.io)
[![Chat on Slack](https://img.shields.io/badge/slack-slack.textile.io-informational.svg?style=flat-square)](https://slack.textile.io)
[![GitHub license](https://img.shields.io/github/license/textileio/js-ipfs-lite.svg?style=flat-square)](./LICENSE)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/textileio/js-ipfs-lite.svg?style=popout-square)](./package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@textile/ipfs-lite.svg?style=popout-square)](https://www.npmjs.com/package/@textile/ipfs-lite)
[![Release](https://img.shields.io/github/release/textileio/js-ipfs-lite.svg?style=flat-square)](https://github.com/textileio/js-ipfs-lite/releases/latest)
[![docs](https://img.shields.io/badge/docs-master-success.svg?style=popout-square)](https://textileio.github.io/js-ipfs-lite/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A lightweight, extensible IPFS peer for Nodejs and the browser.

IPFS Lite runs the minimal setup required to get and put data on the IPFS network.

**NOTE** For now, this is a highly experimental library. Use with caution. Ask for help on https://slack.textile.io. We are hoping to dedicate additional development time soon, but cannot guarantee support at this time.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

The goal of IPFS Lite is to run the bare minimal functionality for any application to interact with the IPFS network (by getting and putting IPLD blocks). This saves having to deal with the complexities of using a full IPFS peer, while maintaining the ability to share the underlying libp2p host and DAG service with other components. It is also extremely lightweight, highly extensible, and easy to work with in both Nodejs and the browser. It supports async/await by default, and the library comes with additional tools to help bootstrap a default IPFS Lite instance with minimal configuration. It is a port of the [Go IPFS Lite](https://github.com/hsanjuan/ipfs-lite) library, and as such, has most of the same requirements. 

### IPFS-lite Libraries

> The following includes information about support for ipfs-lite.

| Name | Build | Target | Description |
|:---------|:---------|:---------|:---------|
| [`ipfs-lite`](https://github.com/hsanjuan/ipfs-lite) | [![Build Status](https://img.shields.io/travis/hsanjuan/ipfs-lite.svg?branch=master&style=flat-square)](https://travis-ci.org/hsanjuan/ipfs-lite) | [![golang](https://img.shields.io/badge/golang-blueviolet.svg?style=popout-square)](https://github.com/hsanjuan/ipfs-lite) | The reference implementation of ipfs-lite, written in Go. |
| [`js-ipfs-lite`](//github.com/textileio/js-ipfs-lite) | [![Build status](https://img.shields.io/github/workflow/status/textileio/js-ipfs-lite/Test/master.svg?style=popout-square)](https://github.com/textileio/js-ipfs-lite/actions?query=branch%3Amaster) | [![nodejs](https://img.shields.io/badge/nodejs-blueviolet.svg?style=popout-square)](https://github.com/textileio/js-ipfs-lite) [![web](https://img.shields.io/badge/web-blueviolet.svg?style=popout-square)](https://github.com/textileio/js-ipfs-lite) [![react-native](https://img.shields.io/badge/react--native-blueviolet.svg?style=popout-square)](https://github.com/textileio/js-ipfs-lite) | The Javascript version of ipfs-lite available for web and nodejs. |

### Why?

Because 99% of the time, a browser or mobile (d)App only needs to be able to add and get small bits of data over the IPFS network. This library provides that, in a much smaller package (currently less than 1/2 the size of `js-ipfs` without much optimization -- we will continue to optimize further). It is also highly extensible, so developers need only include the features they _need_, keeping load times fast, and (d)Apps feeling snappy. Additionally, Textile needed a Typescript-based IPFS solution, and we think others will find the type safety useful as well. Feel free to use the [Typescript declarations](https://github.com/textileio/js-ipfs-lite/tree/master/src/@types) in your own projects.

### What?

Our goal is to provide a highly extensible IPFS "implementation" that supports and small subset of the core IPFS APIs. If you have opinions about what should and should not be included, please [let us know](https://github.com/textileio/js-ipfs-lite/issues).

## Install

> Note: `js-ipfs-lite` includes TypeScript type definitions.

```
npm i @textile/ipfs-lite
```

### Browser

For now, you'll have to bundle your own browser builds, but default builds are coming soon!

## Usage

Only import what you need, keeping your bundles small and your load times faster. You can grab a full-featured IPFS Lite peer from the top-level library, or grab specific sub-modules as needed:

```typescript
// Grab a fully-loaded Peer
import { Peer, BlockStore } from '@textile/ipfs-lite'
import { setupLibP2PHost, MemoryDatastore } = from '@textile/ipfs-lite/dist/setup'
```

### Typescript

```typescript
import { Peer, BlockStore } from '@textile/ipfs-lite'
// Use any interface-datastore compliant store
import { MemoryDatastore } from 'interface-datastore'
import Libp2p from 'libp2p'

const store = new BlockStore(new MemoryDatastore())

;(async function() {
    // Bring your own libp2p host....
    const host = new Libp2p({ ...libp2Options })
    // ...or, use a full-featured default host
    // const host = await setupLibP2PHost()
    const lite = new Peer(store, host)

    await lite.start()

    const cid = 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'
    const data = await lite.getFile(cid)
    console.log(data.toString())
    // Hello World
    await lite.stop()
}
```

### Nodejs

```javascript
let { Peer, BlockStore } = require('@textile/ipfs-lite')
let { setupLibP2PHost } = require('@textile/ipfs-lite/dist/setup')
let { MemoryDatastore } = require('interface-datastore')

let store = new BlockStore(new MemoryDatastore())

;(async function() {
  let host = await setupLibP2PHost()
  let lite = new Peer(store, host)
  await lite.start()

  let cid = 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'
  let data = await lite.getFile(cid)
  console.log(data.toString())
  // Hello World
  await lite.stop()
})()
```

There are also several useful examples included in the tests of this repo, with tools for creating a default `libp2p` host exported by default. We've also thrown in some useful interfaces to use when building on IPFS Lite, as well as the Buffer API for use in the browser.

## API

See [https://textileio.github.io/js-ipfs-lite](https://textileio.github.io/js-ipfs-lite)

## Maintainers

[Carson Farmer](https://github.com/carsonfarmer)

## Contributing

See [our code of conduct](CODE-OF-CONDUCT.md)!

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE) (c) 2019-2020 Textile
