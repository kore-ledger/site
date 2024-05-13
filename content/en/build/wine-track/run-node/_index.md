---
title: Running a node
pagination_next: build/assets-traceability/running-node
date: 2024-05-02
weight: 1
---

The *Wine Producers Organization* (hereinafter referred to as **WPO**) is the entity responsible for proposing the business model and, consequently, will be in charge of managing the network. To achieve this, the first step is to set up a kore node representing the **WPO**, which will allow interaction to configure the rest of the use case.

Below, we will describe the steps to create the WPO node:

* First, make sure to download the appropriate kore Client image from Dockerhub:

    ```bash
    docker pull kore-ledger/kore-client:0.3
    ```

* Next, we will start the node using the following command:

    ```bash
    docker run \
        -p 3000:3000 \
        -p 50000:50000 \
        -e KORE_HTTP=true \
        -e KORE_ID_PRIVATE_KEY=74c417de2174f3a76b0b98343cea3aa35bfd3860cac8bf470092c3e751745c1a \
        -e KORE_NETWORK_LISTEN_ADDR=/ip4/0.0.0.0/tcp/50000 \
        kore-ledger/kore-client:0.3
    ```