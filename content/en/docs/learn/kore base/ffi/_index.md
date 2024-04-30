---
title: FFI
date: 2024-04-26
weight: 3
description: FFI implementation.
---
Kore has been designed with the intention that it can be built and run on different architectures, devices, and even from languages other than Rust. 

Most of Kore's functionality has been implemented in a library, Kore Base. However, this library alone does not allow running a Kore node since, for example, it needs a database implementation. This database must be provided by the software that integrates the Kore Base library. For example, Kore Client integrates a LevelDB database.

However, in order to run Kore on other architectures or languages we need a number of additional elements:
- Expose an Foreign Function Interface (FFI) that allows interacting with the Kore library from other languages.
- Target language bindings. Facilitating interaction with the library.
- Ability to cross-compile to the target architecture.

{{< imgproc ffi Fit "1800x500" >}}
{{< /imgproc >}}

{{< alert type="info" title="INFO">}}
Explore the Kore [repositories](https://github.com/orgs/kore-ledger/repositories) related to FFI for more information.
{{< /alert >}}