---
title: Ejecutando un nodo
pagination_next: build/assets-traceability/running-node
date: 2024-06-06
weight: 1
---
La *Organización de Productores de Vino* (en adelante **WPO**) es la entidad encargada de proponer el modelo de negocio y, en consecuencia, será la encargada de gestionar la red. Para lograr esto, el primer paso es configurar un nodo kore que represente **WPO**, lo que permitirá la interacción para configurar el resto del caso de uso.

A continuación, describiremos los pasos para crear el nodo WPO:

* En primer lugar, asegúrese de descargar la imagen kore Client apropiada desde Dockerhub, en este caso utilizaremos `leveldb` y `prometheus` para ver las estadísticas:

    ```bash
    docker pull koreadmin/kore-http:arm64-leveldb-prometheus
    ```
* A continuación, crearemos un archivo de configuración y levantamos el nodo:

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
    docker run -p 3000:3000 -p 50000:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config.json:/config.json koreadmin/kore-http:arm64-leveldb-prometheus
    ```

{{< alert type="warning" title="PRECAUCIÓN">}}
Como la criptografía la va a generar el propio nodo cuando queramos añadir nuevos nodos en el `boot_node` o queramos añadirlo como miembro de la gobernanza deberemos usar los endpoints utilizados anteriormente
```bash
curl --silent 'http://127.0.0.1:{{PORT}}/controller-id'
curl --silent 'http://127.0.0.1:{{PORT}}/peer-id'
```
{{< /alert >}}
