---
title: Running a node
pagination_next: build/assets-traceability/running-node
date: 2024-06-06
weight: 1
---

The *Wine Producers Organization* (hereinafter referred to as **WPO**) is the entity responsible for proposing the business model and, consequently, will be in charge of managing the network. To achieve this, the first step is to set up a kore node representing the **WPO**, which will allow interaction to configure the rest of the use case.

Below, we will describe the steps to create the WPO node:

* First, make sure to download the appropriate kore Client image from Dockerhub:

    ```bash
    docker pull koreadmin/kore-http:0.5-leveldb-prometheus
    ```

* Next, we will start the node using the following command:

    ```json
    {
        "kore": {
            "network": {
                "listen_addresses": [
                    "/ip4/0.0.0.0/tcp/50000"
                ],
                "routing": {
                    "boot_nodes": [
                        ""
                    ]
                }
            }
            
        }
    }
    ```
    ```bash
    docker run -p 3000:3000 -p 50000:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config.json:/config.json koreadmin/kore-http:0.5-leveldb-prometheus
    ```
{{< alert type="warning" title="PRECAUCIÓN">}}
As the cryptography will be generated by the node itself, when we want to add new nodes in the `boot_node` or we want to add it as a member of the governance, we must use the endpoints used before.
```bash
curl --silent 'http://127.0.0.1:{{PORT}}/controller-id'
curl --silent 'http://127.0.0.1:{{PORT}}/peer-id'
```
{{< /alert >}}