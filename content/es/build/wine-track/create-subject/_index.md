---
title: Creando un sujeto
pagination_next: build/assets-traceability/running-node
date: 2024-06-06
weight: 6
---
En este punto, somos capaces de rastrear el ciclo de vida de nuestras botellas de vino a través de [sujetos](../../../docs/getting-started/concepts/subjects/) de tipo *Vino* , que están definidos en nuestra red Kore. Adicionalmente contamos con la entidad **Premium Wines**, que será la encargada de llevar a cabo esta acción.

Comencemos lanzando un evento **génesis** para crear nuestro primer sujeto tipo *Vino*:

```bash
curl --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Create": {
        "governance_id": "{{GOVERNANCE-ID}}",
        "schema_id": "Wine",
        "namespace": "",
        "name": "Wine"
        }
    }
}'
```
Al realizar esta acción, recibiremos un `request-id`, que debemos copiar y usar en el siguiente comando:

```bash
curl --request GET 'http://localhost:3001/event-requests/{{REQUEST-ID}}/state'
```

El último comando proporcionará una respuesta como la siguiente:

```json
{
    "id": "{{REQUEST-ID}}",
    "subject_id": "{{SUBJECT-ID}}",
    "sn": 0,
    "state": "finished",
    "success": true
}
```


{{< alert type="info" title="INFO">}}
Mantenga el `subject_id` del **sujeto**, ya que lo necesitaremos en pasos posteriores del tutorial.
{{< /alert >}}

Podemos consultar el asunto creado usando el siguiente comando:

```bash
curl --request GET 'http://localhost:3001/subjects/{{SUBJECT-ID}}'
```

```json
{
    "subject_id": "{{SUBJECT-ID}}",
    "governance_id": "{{GOVERNANCE-ID}}",
    "sn": 0,
    "public_key": "E-_PigfpbWeFsQzMXENgEQPQR5ea4FfoSFAqdZtx7lS0",
    "namespace": "",
    "name": "Wine",
    "schema_id": "Wine",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "grape": null,
        "harvest": 0,
        "organic_certified": null,
        "origin": "",
        "temperature_control": {
            "last_check": 0,
            "temperature_ok": true
        }
    },
    "active": true
}
```

Ahora que hemos llegado a este punto, se ha creado el primer sujeto. Sin embargo, como podemos ver en el bloque de información anterior, tiene una inicialización predeterminada con el *cuerpo* que definimos en el evento **génesis**. Por lo tanto, nuestro siguiente paso será modificar las características básicas del tema para representar la producción de una botella de vino producida por **Premium Wines**. Lo lograremos a través del evento `Init` que declaramos en el *contrato* de los sujetos de *Vino*.

Las características que queremos que tenga nuestra botella son las siguientes:
* Número de cosecha: 1
* Tipo de uva: Cabernet Sauvignon
* Origen: España

Por tanto, el comando que debemos ejecutar es el siguiente:

```bash
curl --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Fact": {
            "subject_id": "{{SUBJECT-ID}}",
            "payload": {
                "Init": {
                    "harvest": 1,
                    "grape": "CabernetSauvignon",
                    "origin": "spain"
                }
            }
        }
    }
}'
```

Si todo ha ido correctamente, ejecutar el siguiente comando debería actualizar el sujeto con un valor `sn` de 1 y reflejar los cambios mencionados anteriormente:

```bash
curl --request GET 'http://localhost:3001/subjects/{{SUBJECT-ID}}'
```

```json
{
    "subject_id": "{{SUBJECT-ID}}",
    "governance_id": "{{GOVERNANCE-ID}}",
    "sn": 1,
    "public_key": "E-_PigfpbWeFsQzMXENgEQPQR5ea4FfoSFAqdZtx7lS0",
    "namespace": "",
    "name": "Wine",
    "schema_id": "Wine",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "grape": "CabernetSauvignon",
        "harvest": 1,
        "organic_certified": null,
        "origin": "spain",
        "temperature_control": {
            "last_check": 0,
            "temperature_ok": true
        }
    },
    "active": true
}
```