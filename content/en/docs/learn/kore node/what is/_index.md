---
title: What is
date: 2024-06-06
weight: 1
description: What is Kore Node?
---

Kore Node is an intermediary between Kore Base and the different Kore Clients such as Kore HTTP. Its main functions are 4:
1. Create an API that will be consumed by the different Kore Clients in order to communicate with Kore Base, the objective of this API is the **simplification of the types**, that is, it is responsible for receiving basic types such as `String` and converting them into complex types that Kore Base expects to receive as a `DigestIdentifier`. Another objective of this API is to combine different methods of the Kore Base API to perform a specific functionality such as creating a traceability subject, in this way we add an abstraction layer on top of the Kore Base API.
2. Implement the different methods that the databases need so that Kore Base can use them, in this way Kore Base is **not coupled** with any database and by defining some methods it is capable of working with a [LevelDB]( https://github.com/google/leveldb), a [SQlite](https://sqlite.org/) or a [Cassandra](https://cassandra.apache.org/_/index.html).
3. Receive configuration parameters through `.toml`, `.yaml` and `.json` files; in addition to `environment variables`. To delve deeper into the configuration parameters, visit the following section.
4. Optionally expose a [Prometheus](https://prometheus.io/) to obtain metrics. For more information on prometheus configuration visit the next section.

Currently Kore Node consists of 3 features:
* sqlite: To make use of the `SQlite` database.
* leveldb: To make use of the `LevelDB` database.
* prometheus: to expose an API with an `endpoint` called `/metrics` where metrics can be obtained.

{{< alert type="info" title="INFO">}}
To access more information about how Kore Node works, access the [repository](https://github.com/kore-ledger/kore-node)
{{< /alert >}}