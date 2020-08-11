# DAGService

[![Chat on IRC](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Chat on Matrix](https://img.shields.io/badge/matrix-%23ipfs%3Amatrix.org-blue.svg?style=popout-square)](https://riot.im/app/#/room/#ipfs-dev:matrix.org)
[![GitHub license](https://img.shields.io/github/license/ipfs/js-dag-service.svg?style=flat-square)](./LICENSE)
[![GitHub package.json version](https://img.shields.io/github/package-json/v/ipfs/js-dag-service.svg?style=popout-square)](./package.json)
[![npm (scoped)](https://img.shields.io/npm/v/dag-service.svg?style=popout-square)](https://www.npmjs.com/package/dag-service)
[![Release](https://img.shields.io/github/release/textileio/js-ipfs-lite.svg?style=flat-square)](https://github.com/ipfs/js-dag-service/releases/latest)
[![docs](https://img.shields.io/badge/docs-master-success.svg?style=popout-square)](https://ipfs.github.io/js-dag-service/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> DAGService is a library for storing and replicating hash-linked
> data over IPFS network.

DAGService is aiming to be a bare minimum needed for [IPLD][]-based applications
to interact with the IPFS network by getting and putting blocks to it.

**NOTE** For now, this is a highly experimental library. Use with caution.

> This project was originally developed under the [@textileio](https://github.com/textileio/) organization, and was contributed to the IPFS community for ongoing maintenance and development.

## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Background

The goal of DAGService to provied a minimal layer between data model of [IPLD][]
and full blown [IPFS][]. It provides bare minimum functionality for any
application to interact with the IPFS network (by getting and putting [IPLD][]
blocks) without having to deal with the complexities of operating a full
IPFS node. It is an attempt to remake core piece of IPFS node reusable on it's
own.

### Why?

Because 99% of the time, a browser or mobile (d)App only needs to be able to add and get small bits of data over the IPFS network. This library provides that, in a much smaller package (currently less than 1/2 the size of `js-ipfs` without much optimization -- we will continue to optimize further). It is also highly extensible, so developers need only include the features they _need_, keeping load times fast, and (d)Apps feeling snappy. Additionally, Textile needed a Typescript-based IPFS solution, and we think others will find the type safety useful as well. Feel free to use the [Typescript declarations](https://github.com/textileio/js-ipfs-lite/tree/master/src/@types) in your own projects.

## Install

```
npm install dag-service
```

## Usage

```typescript
import { Peer, BlockStore } from "dag-service"
// Use any interface-datastore compliant store
import { MemoryDatastore } from "interface-datastore"
import Libp2p from "libp2p"

const store = new BlockStore(new MemoryDatastore())

const main = async () => {
  // Bring your own libp2p host....
  const host = new Libp2p({ ...libp2Options })
  const lite = new Peer(store, host)

  await lite.start()

  const cid = "QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u"
  const data = await lite.getFile(cid)
  console.log(data.toString())
  // Hello World
  await lite.stop()
}
```

There are also several useful examples included in the tests of this repo, with tools for creating a default `libp2p` host exported by default. We've also thrown in some useful interfaces to use when building on IPFS Lite, as well as the Buffer API for use in the browser.

## API

See [https://ipfs.github.io/js-dag-service/](https://ipfs.github.io/js-dag-service/)

## Maintainers

- [Irakli Gozalishvili](https://github.com/gozala/)
- [Carson Farmer](https://github.com/carsonfarmer)

## Contribute

Feel free to dive in! [Open an issue](https://github.com/ipfs/js-dag-service/issues/new) or submit PRs.

To contribute to IPFS in general, see the [contributing guide](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md)

Project follows the [IPFS Community Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md)

## License

[MIT](LICENSE) (c) Protocol Labs

[ipld]: https://ipld.io/
[ipfs]: https://ipfs.io/
