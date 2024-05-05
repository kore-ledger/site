---
title: Creando una gobernanza
pagination_next: build/assets-traceability/running-node
date: 2024-05-02
weight: 2
---
Una vez que el **WPO** tiene un nodo en la red kore, es momento de definir el caso de uso, que incluye participantes, reglas de interacción, modelos de información, entre otros aspectos. En la red kore, esto se logra creando una [gobernanza](../../../docs/learn/Governance/_index.md), donde se especifica la funcionalidad específica del caso de uso.

Para crear una gobernanza básica, se requieren los siguientes pasos:

* Para comenzar, ejecute el siguiente comando para crear una versión básica de una gobernanza:

  ```bash
  curl --request POST 'http://localhost:3000/api/event-requests' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "request": {
      "Create": {
        "governance_id": "",
        "schema_id": "governance",
        "namespace": "",
        "name": "wine_track"
      }
    }
  }'
  ```

* Como resultado de la acción anterior, se devolverá un `request-id`. Cópialo y úsalo en el siguiente comando:

  ```bash
  curl --request GET 'http://localhost:3000/api/event-requests/{{REQUEST-ID}}/state'
  ```

  Este último comando proporcionará una respuesta como la siguiente:

  ```json
  {
    "id": "{{REQUEST-ID}}",
    "subject_id": "{{GOVERNANCE-ID}}",
    "sn": 0,
    "state": "finished",
    "success": true
  }
  ```

  {{< alert type="warning" title="PRECAUCIÓN">}}
  Guarde el `subject_id` de la **gobernanza**, ya que será necesario en los próximos pasos del tutorial.
  {{< /alert >}}


* Podemos verificar la gobernanza creada usando el siguiente comando:

  ```bash
  curl --request GET 'http://localhost:3000/api/subjects/{{GOVERNANCE-ID}}'
  ```

  El resultado obtenido debería ser similar al siguiente:

  ```json
  {
    "subject_id": "{{GOVERNANCE-ID}}",
    "governance_id": "",
    "sn": 0,
    "public_key": "E8tVWEasubIp7P9fzk_HttNCsABymV9m9xEPAfr-QV7M",
    "namespace": "",
    "name": "wine_track",
    "schema_id": "governance",
    "owner": "EbwR0yYrCYpTzlN5i5GX_MtAbKRw5y2euv3TqiTgwggs",
    "creator": "EbwR0yYrCYpTzlN5i5GX_MtAbKRw5y2euv3TqiTgwggs",
    "properties": {
      "members": [],
      "policies": [
        {
          "approve": {
            "quorum": "MAJORITY"
          },
          "evaluate": {
            "quorum": "MAJORITY"
          },
          "id": "governance",
          "validate": {
            "quorum": "MAJORITY"
          }
        }
      ],
      "roles": [
        {
          "namespace": "",
          "role": "WITNESS",
          "schema": {
            "ID": "governance"
          },
          "who": "MEMBERS"
        }
      ],
      "schemas": []
    },
    "active": true
  }
  ```