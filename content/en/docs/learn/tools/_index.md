---
title: Tools
date: 2024-04-29
weight: 3
description: Utilities to work with Kore Node
---
Kore Tools are a group of utilities developed to facilitate the use of Kore Node, especially during testing and prototyping. In this section we will go deeper into them and how they can be obtained and used.

## Installation

There are different ways in which the user can acquire these tools. The first and most basic is the generation of their binaries through the compilation of their source code, which can be obtained through the public repositories. However, we recommend making use of the available docker images in conjunction with a series of scripts that abstract the use of these images, so that the user does not need to compile the code. 

### Compiling binaries

```bash
git clone -b release-0.3 https://github.com/kore-ledger/Kore-client.git
cd Kore-client
sudo apt install -y libprotobuf-dev protobuf-compiler cmake
cargo install --path tools/keygen
cargo install --path tools/patch
cargo install --path tools/sign
Kore-keygen -h
Kore-sign -h
Kore-patch -h
```

### Using docker images

```bash
git clone -b release-0.3 https://github.com/kore-ledger/Kore-client.git
cd Kore-client
chmod +x ./tools/scripts/Kore-keygen
chmod +x ./tools/scripts/Kore-sign
chmod +x ./tools/scripts/Kore-patch
./tools/scripts/Kore-keygen -h
./tools/scripts/Kore-sign -h
./tools/scripts/Kore-patch -h
```

{{< alert type="success"  title="TIP" >}}
These utilities may be used relatively frequently, so we recommend that you include the scripts in the PATH to simplify their use.
{{< /alert >}}

## Kore Keygen

Any Kore node needs cryptographic material to function. To do so, it is necessary to generate it externally and then indicate it to the node, either by means of environment variables or through input parameters. The Kore Keygen utility satisfies this need by allowing, in a simple way, the generation of this cryptographic material. Specifically, its execution allows to obtain a ***private key*** in hexadecimal format, as well as the ***identifier (controller ID)*** which is the identifier at Kore level in which its format includes the public key, plus information of the cryptographic scheme used (you can obtain more information in the following **[link](../../getting-started/concepts/identifiers/)**). 

```bash
# Basic usage example
Kore-keygen
```

```bash
# Output
controller_id: EOZZyrorTvTioKsOP8PcGCngSF0b49ZuRlie5xtkuyOU
peer_id: 12D3KooWDhATtx42CRiKBCPJt9EgcwaLzwemK4m9SbyRHfJtNE7W
private_key: b088fb74588dff74d5683b804d742418874db000e25ffec189fa313e825e1f7e
```

{{< alert type="info"  title="INFO" >}}
X and the other tools accept different execution arguments. For more information, try **--help**, for example:
```bash
Kore-keygen --help
```
{{< /alert >}}


## Kore Sign

This is an utility that is intended to facilitate the execution of external invocations. In order to provide context, [an external invocation](../../getting-started/concepts/events/) is the process by which a node proposes a change to a network subject that it does not control, i.e., of which it is not the owner. There are also a number of rules that regulate which network users have the ability to perform these operations. In either case, the invoking node must present, in addition to the changes it wishes to suggest, a valid signature to prove its identity.

Kore Sign allows precisely the latter, generating the necessary signature to accompany the request for changes. Additionally, as the utility is strictly intended for such a scenario, what is actually returned by its execution is the entire data structure (in JSON format) that must be delivered to other nodes in the network for them to consider the request.

For the correct operation of the utility, it is necessary to pass as arguments both the event request data and the private key in hexadecimal format to be used.

```bash
# Basic usage example
Kore-sign 2a71a0aff12c2de9e21d76e0538741aa9ac6da9ff7f467cf8b7211bd008a3198 '{"Transfer":{"subject_id":"JjyqcA-44TjpwBjMTu9kLV21kYfdIAu638juh6ye1gyU","public_key":"E9M2WgjXLFxJ-zrlZjUcwtmyXqgT1xXlwYsKZv47Duew"}}'
```

```json
// Output
{
  "request": {
    "Transfer": {
      "subject_id": "JjyqcA-44TjpwBjMTu9kLV21kYfdIAu638juh6ye1gyU",
      "public_key": "E9M2WgjXLFxJ-zrlZjUcwtmyXqgT1xXlwYsKZv47Duew"
    }
  },
  "signature": {
    "signer": "EtbFWPL6eVOkvMMiAYV8qio291zd3viCMepUL6sY7RjA",
    "timestamp": 1690284971374522723,
    "value": "SE5QkVNuFJh5cj4ZViiGC760gsocR6EqdoGNrzFNB0WusuzslcfElgdTt6Ag_Qe17Fg1lja8f5zd81M91OKo6XCQ"
  }
}
```

{{< alert type="warning"  title="CAUTION" >}}
It is important to note that currently only private keys of the ***ED25519*** algorithm are supported
{{< /alert >}}


{{< alert type="success"  title="TIP" >}}
If you need to pass the evento request to Kore-sign through a pipe instead of as an argument, you can use the [xargs](https://man7.org/linux/man-pages/man1/xargs.1.html) utility. For example,
```bash
echo '{"Transfer":{"subject_id":"JjyqcA-44TjpwBjMTu9kLV21kYfdIAu638juh6ye1gyU","public_key":"E9M2WgjXLFxJ-zrlZjUcwtmyXqgT1xXlwYsKZv47Duew"}}' | xargs -0 -I {} Kore-sign "2a71a0aff12c2de9e21d76e0538741aa9ac6da9ff7f467cf8b7211bd008a3198" {}
```
{{< /alert >}}

## Kore Patch
Currently the [contract that handles governance changes](../Governance/schema/) only allows one type of event that includes a **JSON Patch**.

JSON Patch is a data format that represents changes to JSON data structures. Thus, starting from an initial structure, after applying the JSON Patch, an updated structure is obtained. In the case of Kore, the JSON Patch defines the changes to be made to the data structure that represents governance when it needs to be modified. Kore Patch allows us to calculate the JSON Patch in a simple way if we have the original governance and the modified governance.

```bash
# Basic usage example
Kore-patch '{"members":[]}' '{"members":[{"id":"EtbFWPL6eVOkvMMiAYV8qio291zd3viCMepUL6sY7RjA","name":"ACME"}]}'
```

```json
// Output in json format
[
  {
    "op": "add",
    "path": "/members/0",
    "value": {
      "id": "EtbFWPL6eVOkvMMiAYV8qio291zd3viCMepUL6sY7RjA",
      "name": "ACME"
    }
  }
]
```

Once the JSON Patch is obtained it can be included in an event request to be sent to the governance owner.

{{< alert type="success"  title="TIP" >}}
Although Kore Patch has been developed to facilitate modifications to Kore governance, it is really just a utility that generates a JSON PATH from 2 JSON objects, so it can be used for other purposes.
{{< /alert >}}