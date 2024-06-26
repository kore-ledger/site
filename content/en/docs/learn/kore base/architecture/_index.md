---
title: Architecture
date: 2024-04-26
weight: 1
description: Kore Base architecture.
---

[Kore Base](https://github.com/kore-ledger/kore-base) is a library that implements most of the functionality of the Kore protocols. The most straightforward way to develop a Kore-compliant application is to use this library as, for example, [Kore Client](https://github.com/kore-ledger/kore-client) does.

Internally, it is structured in a series of layers with different responsibilities. The following is a simplified layer and block level view of the Kore Base structure. 

{{< imgproc architecture Fit "1800x500" >}}
{{< /imgproc >}}

## Network
Layer in charge of managing network communications, i.e., the sending and receiving of information between the different nodes of the network. Internally, the implementation is based on the use of [LibP2P](https://docs.libp2p.io/) to resolve point-to-point communications. For this purpose, the following protocols are used:
- [Kademlia](https://docs.libp2p.io/concepts/fundamentals/protocols/#kad-dht), distributed hash table used as the foundation of peer routing functionality.
- [Identify](https://docs.libp2p.io/concepts/fundamentals/protocols/#identify), protocol that allows peers to exchange information about each other, most notably their public keys and known network addresses.
- [Noise](https://docs.libp2p.io/concepts/secure-comm/noise/), encryption scheme that allows for secure communication by combining cryptographic primitives into patterns with verifiable security properties.
- Tell, asynchronous protocol for sending messages. Tell arose within the development of Kore as an alternative to the [LibP2P Request Response](https://docs.rs/libp2p-request-response/latest/libp2p_request_response/) protocol that required waiting for responses.

## Messages
Layer in charge of managing message sending tasks. The Kore communications protocol handles different types of messages. Some of them require a response. Since communications are asynchronous, we do not wait for an immediate response. This is why some types of messages have to be resent periodically until the necessary conditions are satisfied. This layer is responsible for encapsulating protocol messages and managing forwarding tasks.

## Protocol
Layer in charge of managing the different types of messages of the Kore protocol and redirecting them to the parts of the application in charge of managing each type of message.

## Ledger
Layer in charge of managing event chains, the micro-ledgers. This layer handles the management of subjects, events, status updates, updating of outdated chains, etc. 

## Governance
Module that manages the governances. Different parts of the application need to resolve conditions on the current or past state of some of the governance in which it participates. This module is in charge of managing these operations.

## API
Layer in charge of exposing the functionality of the Kore node. Subject and event queries, request issuance or approval management are some of the functionalities exposed. A notification channel is also exposed in which different events occurring within the node are published, for example the creation of subjects or events.