---
title: Fin del ciclo
pagination_next: build/assets-traceability/running-node
date: 2024-05-06
weight: 12
---
Para concluir el tutorial, planteemos un último escenario: cuando las botellas no cumplen con los estándares de calidad, deben retirarse del mercado para impedir su distribución.

Para abordar esta situación,  kore proporciona una solución: el uso de [**EOL**](../../../docs/getting-started/concepts/events/) evento. Este evento nos permite terminar el ciclo de vida de un sujeto en la red, evitando que se emitan eventos futuros sobre él.

Para probar esto, lo aplicaremos a la última botella que creamos (la española). Para hacer esto, ejecute el siguiente comando:

```bash title="Node: Premium Wines"
curl --location --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "EOL": {
        "subject_id": "{{SUBJECT-ID}}"
        }
    }
}'
```

Si todo salió bien, cuando solicites una lista de sujetos, deberías ver la botella con un valor `sn` de 3 y el campo `active` establecido en `false`:

```bash title="Node: Premium Wines"
curl --location --request GET 'http://localhost:3001/subjects/{{SUBJECT-ID}}'
```

```json
{
    "subject_id": "{{SUBJECT-ID}}",
    "governance_id": "{{GOVERNANCE-ID}}",
    "sn": 3,
    "public_key": "E5DkRaljajwUZ1HrpgdkIxdTu0fbrg-nqoBJFHqm6GJY",
    "namespace": "Spain",
    "name": "Wine",
    "schema_id": "Wine",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "grape": "PinotNoir",
        "harvest": 3,
        "organic_certified": false,
        "origin": "spain",
        "temperature_control": {
            "last_check": 0,
            "temperature_ok": true
        }
    },
    "active": false
}
```

Ahora bien, si intentas lanzar un nuevo evento sobre este sujeto, no se permitirá. Para demostrar esto, intentemos lanzar un evento **EOL** nuevamente:

```bash title="Node: Premium Wines"
curl --location --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "EOL": {
        "subject_id": "{{SUBJECT-ID}}"
        }
    }
}'
```

En este caso devolverá un mensaje indicando que no se puede lanzar un evento sobre un asunto que ha llegado al final de su ciclo de vida:

``` bash
API error: Failed to process request
```