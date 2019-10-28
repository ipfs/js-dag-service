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

> A lightweight minimal IPFS peer for typescript/javascript.

IPFS Lite runs the minimal setup required to provide an DAGService. It is a port of the Go IPFS Lite library, and as such, has the same requirements. The goal of IPFS Lite is to run the bare minimal functionality for any IPLD-based application to interact with the IPFS network by getting and putting blocks to it, rather than having to deal with the complexities of using a full IPFS daemon, and with the liberty of sharing the needed libp2p host and DHT for other things. This is _not_ a batteries-included library, however, we do provide additional tools to help bootstrap a default IPFS Lite instance with minimal configuration (comming soon :tm:).

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

Coming Soon

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

```
Coming Soon
```

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
