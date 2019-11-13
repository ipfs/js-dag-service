# IPFS Lite _(js-ipfs-lite)_

[![Made by Textile](https://img.shields.io/badge/made%20by-Textile-informational.svg?style=flat-square)](https://textile.io)
[![Chat on Slack](https://img.shields.io/badge/slack-slack.textile.io-informational.svg?style=flat-square)](https://slack.textile.io)
[![GitHub license](https://img.shields.io/github/license/textileio/js-ipfs-lite.svg?style=flat-square)](./LICENSE)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/textileio/js-ipfs-lite.svg?style=popout-square)](./package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@textile/ipfs-lite.svg?style=popout-square)](https://www.npmjs.com/package/@textile/wallet)
[![Release](https://img.shields.io/github/release/textileio/js-ipfs-lite.svg?style=flat-square)](https://github.com/textileio/js-ipfs-lite/releases/latest)
[![CircleCI branch](https://img.shields.io/circleci/project/github/textileio/js-ipfs-lite/master.svg?style=flat-square)](https://circleci.com/gh/textileio/js-ipfs-lite)
[![docs](https://img.shields.io/badge/docs-master-success.svg?style=popout-square)](https://textileio.github.io/js-ipfs-lite/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A lightweight, extensible IPFS peer for Nodejs and the browser.

IPFS Lite runs the minimal setup required to get and put data on the IPFS network.

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

### Why?

Because 99% of the time, a browser or mobile (d)App only needs to be able to add and get small bits of data over the IPFS network. This library provides that, in a much smaller package (currently less than 1/2 the size of `js-ipfs` without much optimization -- we will continue to optimize further). It is also highly extensible, so developers need only include the features they _need_, keeping load times fast, and (d)Apps feeling snappy. Additionally, Textile needed a Typescript-based IPFS solution that supports async/await patterns throughout, and we think others will find the type safety useful as well. Feel free to use the [Typescript declarations](https://github.com/textileio/js-ipfs-lite/tree/master/src/@types) in your own projects.

### What?

Our goal is to provide a highly extensible IPFS implementation that, when 'fully loaded' supports _most_ of the default [`js-ipfs`](https://github.com/ipfs/interface-js-ipfs-core) core APIs. Some APIs will likely never be added, and some APIs specific to Textile (like encryption) will likely be included as separate modules. If you have opinions about what should and should not be included, please [let us know](https://github.com/textileio/js-ipfs-lite/issues).

## Install

### Node

```
npm i @textile/ipfs-lite
```

### Browser

```
git checkout https://github.com/textileio/js-ipfs-lite.git
cd js-ipfs-lite
npm i
npm run browser:build
```

The above creates a minified + gzipped asset in `dist/browser`, which you can load using a `<script>` tag. This will make an `ipfsLite` object available in the global (`window`) namespace. You'll also get an example `index.html` file to help get you started.

## Usage

### Typescript

```typescript
import { Peer, BlockStore, setupLibP2PHost } from '@textile/ipfs-lite'
// Use any interface-datastore compliant store
import { MemoryDatastore } from 'interface-datastore'
import Libp2p from 'libp2p'

const store = new BlockStore(new MemoryDatastore())
const host = new Libp2p({ ...libp2Options })
// or, 
// const host = await setupLibP2PHost()
const lite = new Peer(store, host)

await lite.start()

const cid = 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'
const data = await lite.getFile(cid)
console.log(data.toString())
// Hello World
await lite.stop()
```

### Nodejs

```javascript
let { Peer, BlockStore, setupLibP2PHost } = require('@textile/ipfs-lite')
// Use any interface-datastore compliant store
let { MemoryDatastore } = require('interface-datastore')
let Libp2p = require('libp2p')

let store = new BlockStore(new MemoryDatastore())
let host = new Libp2p({ ...libp2Options })
// or, 
// const host = await setupLibP2PHost()
let lite = new Peer(store, host)

await lite.start()

let cid = 'QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u'
let data = await lite.getFile(cid)
console.log(data.toString())
// Hello World
await lite.stop()
```

### Browser

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>IPFS Lite App</title>
</head>
<body>
  <script>
    window.addEventListener('load', function () {
      async function main() {
        var { BlockStore, MemoryDatastore, setupLibP2PHost, Peer, Buffer } = window.ipfsLite
        var store = new BlockStore(new MemoryDatastore())
        var host = await setupLibP2PHost(undefined, undefined, [
          `/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star`
        ])
        var lite = new Peer(store, host)
        await lite.start()
        console.log('started!')
        setTimeout(async function () {
          var source = [{
            path: 'bar',
            content: Buffer.from('foo!'),
          }]
          var data = await lite.addFile(source)
          console.log('added file with CID:')
          console.log(data.cid.toString())
          await lite.stop()
          console.log('stopped')
        }, 1000)
      }
      main()
    })
  </script>
  <script type="text/javascript" src="ipfs-lite.min.js"></script>
</body>
</html>
```

There are also several useful examples included in the [`tests` folder](https://github.com/textileio/js-ipfs-lite/tree/master/tests) of this repo, with tools for creating a default `libp2p` host exported by default. We've also thrown in some useful interfaces to use when building on IPFS Lite, as well as the Buffer API for use in the browser.

## API

See [https://textileio.github.io/js-ipfs-lite](https://textileio.github.io/js-ipfs-lite)

## Maintainers

[Carson Farmer](https://github.com/carsonfarmer)

## Contributing

See [the contributing file](CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE) (c) 2019 Textile
