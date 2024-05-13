---
title: Run first node
description: Steps to set up the first Kore node
weight: 1
date: 2024-05-02
---
To launch a kore node, you must execute the [kore-client](https://github.com/kore-ledger/kore-client) binary, located in the client folder of the repository. To use its Docker image, go to the page on [dockerhub](https://hub.docker.com/r/kore-ledger/kore-client).

If we do not have the image or we do not have the latest version, download it with:

```bash
docker pull kore-ledger/kore-client:0.3
```

We can execute it by launching:

```bash
docker run kore-ledger/kore-client:0.3
```

However, this will give us an error, as we must specify certain aspects of the configuration mandatorily.

The first thing we must mandatorily add to the configuration is the private key. We can generate a valid one using kore-tools, which is found in the same repository as the client in the kore-tools directory, and on [dockerhub](https://hub.docker.com/r/kore-ledger/kore-tools). Specifically, its keygen binary, which will create the necessary cryptographic material for the node. An output without extra configuration will give us a result such as:

```bash
PRIVATE KEY ED25519 (HEX): f78e9b42c3f265d0c5bf613f47bf4fb8fa3f18b3b38dd4e90ca7eed497e3394a
CONTROLLER ID ED25519: EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4
PeerID: 12D3KooWLXexpg81PjdjnrhmHUxN7U5EtfXJgr9cahei1SJ9Ub3B
```

What we must add to the kore_SECRET_KEY environment variable is the private key, in this case: `f78e9b42c3f265d0c5bf613f47bf4fb8fa3f18b3b38dd4e90ca7eed497e3394a`.

{{< alert type="warning"  title="CAUTION" >}}
It's important to highlight that the same cryptographic scheme should be used when generating the key and adding it to the client, keygen and client use `ed25519` by default.
{{< /alert >}}

Another environment variable we must add is **KORE_HTTP**, which will allow us to launch the http server to be able to use the REST API. For this, you must set **KORE_HTTP=true**.

Once we have these two variables, we can launch the node with the minimum configuration (port **3000** is the default for the http service). We will put the node in informative mode using **RUST_LOG** with the value **info**, if we want more information we can use the value **debug**. Finally, we will make it listen on all interfaces on port **5000** by defining the variable **KORE_NETWORK_LISTEN_ADDR**.


```bash
docker run -p 3000:3000 -p 50000:50000 \
-e kore_ID_PRIVATE_KEY=f78e9b42c3f265d0c5bf613f47bf4fb8fa3f18b3b38dd4e90ca7eed497e3394a \
-e KORE_HTTP=true \
-e KORE_NETWORK_LISTEN_ADDR=/ip4/0.0.0.0/tcp/50000 \
-e RUST_LOG=info \
kore-ledger/kore-client:0.3
```
{{< alert type="info"  title="INFO" >}}
To learn more about environment variables go to the [configuration](../../../docs/learn/kore%20node/kore%20client%20http/configuration/) section.
{{< /alert >}}