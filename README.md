# js-ipfs-lite

[![Made by Textile](https://img.shields.io/badge/made%20by-Textile-informational.svg?style=flat-square)](https://textile.io)
[![Chat on Slack](https://img.shields.io/badge/slack-slack.textile.io-informational.svg?style=flat-square)](https://slack.textile.io)
[![GitHub license](https://img.shields.io/github/license/textileio/js-ipfs-lite.svg?style=flat-square)](./LICENSE)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/textileio/js-ipfs-lite.svg?style=popout-square)](./package.json)
[![npm (scoped)](https://img.shields.io/npm/v/@textile/ipfs-lite.svg?style=popout-square)](https://www.npmjs.com/package/@textile/wallet)
[![node (scoped)](https://img.shields.io/node/v/@textile/ipfs-lite.svg?style=popout-square)](https://www.npmjs.com/package/@textile/ipfs-lite)
[![Release](https://img.shields.io/github/release/textileio/js-ipfs-lite.svg?style=flat-square)](https://github.com/textileio/js-ipfs-lite/releases/latest)
[![CircleCI branch](https://img.shields.io/circleci/project/github/textileio/js-ipfs-lite/master.svg?style=flat-square)](https://circleci.com/gh/textileio/js-ipfs-lite)
[![docs](https://img.shields.io/badge/docs-master-success.svg?style=popout-square)](https://textileio.github.io/js-ipfs-lite/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A lightweight, extensible IPFS peer for Nodejs and the browser.

IPFS Lite runs the minimal setup required to get and put IPLD DAGs on the IPFS network. It is a port of the [Go IPFS Lite](https://github.com/hsanjuan/ipfs-lite) library.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

IPFS Lite runs the minimal setup required to provide a DAG service. It is a port of the [Go IPFS Lite](https://github.com/hsanjuan/ipfs-lite) library, and as such, has the same requirements. The goal of IPFS Lite is to run the bare minimal functionality for any IPLD-based application to interact with the IPFS network (by getting and putting blocks). This saves having to deal with the complexities of using a full IPFS daemon, while maintaining the ability to share the underlying libp2p host and DHT with other components. It is also extremely lightweight, coming in at under 115KBs (when minified and gzipped). With that in mind, IPFS Lite is _not_ a batteries-included library; you need to provide your own data store and libp2p host. However, the library does come with additional tools to help bootstrap a default IPFS Lite instance with minimal configuration (comming soon :tm:).

## Install

*note*: @textile/ipfs-lite has not yet been 'officially' released, the following install directions will not work until the first official release. In the mean time, please feel free to git clone the repo until an official release is available.

### Node

```
npm i @textile/ipfs-lite
```

### Browser

```
git checkout https://github.com/textileio/js-ipfs-lite.git
cd js-ipfs-lite
npm i
npm run build:browser
```

The above creates a minified + gzipped asset in `dist/browser`, which you can load using a `<script>` tag. This will make an `ipfsLite` object available in the global (`window`) namespace. You'll also get an example `index.html` file to help get you started, which contains the following:

```
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>IPFS Lite App</title>
  </head>
  <body>
  <script type="text/javascript" src="index.min.js"></script></body>
</html>
```

## Usage

```typescript
import { Peer, Blockstore } from '@textile/ipfs-lite'
// Use any interface-datastore compliant store
import { MemoryDatastore } from 'interface-datastore'
import Libp2p from 'libp2p'

const settings = getLibp2pSettings(...)
const store = new Blockstore(new MemoryDatastore())
const host = new Libp2p({ ...settings })
const lite = new Peer(store, host)

await lite.start()

const cid = new CID('QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u')
const block = await lite.get(cid)
console.log(block.Data.toString())
// Hello World

await lite.stop()
```

There are also several useful examples included in the [`tests` folder](https://github.com/textileio/js-ipfs-lite/tree/master/tests) of this repo, with tools for creating a default `libp2p` host.

## API

See https://textileio.github.io/js-ipfs-lite

## Maintainers

[Carson Farmer](https://github.com/carsonfarmer)

## Contributing

See [the contributing file](CONTRIBUTING.md)!

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE) (c) 2019 Textile
