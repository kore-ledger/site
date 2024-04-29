---
title: Basic Usage
date: 2024-04-26
weight: 2
description: Kore Base basic usage.
---
Kore Base exposes a Kore object that represents the node to be started. To build this object you need to define a number of additional configurations and provide a database implementation that meets the needs of Kore Base. Kore Base includes an in-memory database implementation for testing but without persistence capability. Kore Client includes an implementation based on [LevelDB](./taple-client.md#database). 

Once we have built our Kore object, we can interact with it through 2 mechanisms:
- an asynchronous API with which to send requests to the node;
- and a notification channel to receive information about what happens in the node itself, for example, when an event is confirmed. 

The following example shows a minimal example of an application using Kore Base. This application is limited to starting a single node and creating a governance subject locally. 

```rust 

```

{{< alert type="info" title="INFO">}}The complete example can be found in the [Kore Base repository](https://github.com/kore-ledger/kore-base){{< /alert >}}