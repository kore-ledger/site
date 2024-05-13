---
title: Ejecutando un nodo
pagination_next: build/assets-traceability/running-node
date: 2024-05-02
weight: 1
---
La *Organización de Productores de Vino* (en adelante **WPO**) es la entidad encargada de proponer el modelo de negocio y, en consecuencia, será la encargada de gestionar la red. Para lograr esto, el primer paso es configurar un nodo kore que represente **WPO**, lo que permitirá la interacción para configurar el resto del caso de uso.

A continuación, describiremos los pasos para crear el nodo WPO:

* Primero, asegúrese de descargar la imagen del Cliente kore adecuada desde Dockerhub:

    ```bash
    docker pull kore-ledger/kore-client:0.3
    ```
* A continuación, iniciaremos el nodo usando el siguiente comando:

    ```bash
    docker run \
        -p 3000:3000 \
        -p 50000:50000 \
        -e KORE_HTTP=true \
        -e KORE_ID_PRIVATE_KEY=74c417de2174f3a76b0b98343cea3aa35bfd3860cac8bf470092c3e751745c1a \
        -e KORE_NETWORK_LISTEN_ADDR=/ip4/0.0.0.0/tcp/50000 \
        kore-ledger/kore-client:0.3
    ```