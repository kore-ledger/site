---
title: Run first node
description: Steps to set up the first Kore node
weight: 1
date: 2024-06-06
---
To launch a kore node, you must run the [kore-http](https://github.com/kore-ledger/kore-http) binary, located in the client folder of the repository. To use your Docker image, you must go to the [dockerhub](https://hub.docker.com/repositories/koreadmin) page.

If we do not have the image or do not have the latest version, download it with:

```bash
docker pull koreadmin/kore-http:arm64-sqlite
```

We can execute it by launching:

```bash
docker run koreadmin/kore-http:arm64-sqlite
```

However, this will give us an error, since we must specify certain aspects of the configuration.
We can also create the image ourselves depending on the architecture.

```bash
git clone git@github.com:kore-ledger/kore-http.git
# Depending on the architecture of your machine you should use one or the other.
docker build --platform linux/amd64 -t kore-http-sqlite:amd64 --target amd64 .
docker build --platform linux/arm64 -t kore-http-sqlite:arm64 --target arm64 .

```
We can generate the cryptographic key ourselves or let the node generate it. In this tutorial the node will take care of that task.
- The first thing we must add to the configuration is the private key. We can generate a valid one using kore-tools, which is located in the same repository as the client in the [kore-tools](https://github.com/kore-ledger/kore-tools) directory. Specifically, its keygen binary, which will create the necessary cryptographic material for the node.

{{< alert type="warning"  title="CAUTION" >}}
It is important to note that the same cryptographic scheme must be used when generating the key and adding it to the client, keygen and client use `ed25519` by default.
{{< /alert >}}

- Once we have the image we must generate a configuration file indicating the following:
. `listen_addresses` Address where the node will listen to communicate with other nodes.
. `boot_nodes` a vector of known nodes, as it is the first node we will leave it empty.

```json
// config.json
{
    "kore": {
      "network": {
          "listen_addresses": ["/ip4/0.0.0.0/tcp/50000"],
          "routing": {
            "boot_nodes": [""]
          }
      }
    }
  }
```

To raise the node we must indicate from which port of our machine we can access the API, as well as the port where the node will listen. Finally, it is important to indicate the configuration file.

```bash
docker run -p 3000:3000 -p 50000:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config.json:/config.json koreadmin/kore-http:arm64-sqlite
```

{{< alert type="info"  title="INFO" >}}
To learn more about environment variables go to the [configuration section](../../../docs/learn/kore%20node/kore%20client%20http/configuration/)
{{< /alert >}}