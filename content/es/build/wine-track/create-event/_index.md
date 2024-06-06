---
title: Creando un evento
pagination_next: build/assets-traceability/running-node
date: 2024-06-06
weight: 3
---
Una vez que hemos inicializado nuestra gobernanza para comenzar a formalizar el caso de uso para el ciclo de vida del vino, es necesario completarlo y adaptarlo a nuestras necesidades. Para realizar estas modificaciones debemos generar un evento en la red. En *kore*, existen diferentes tipos de eventos, como el evento **génesis**, que se utiliza para crear la gobernanza. Sin embargo, en este caso, necesitamos generar un evento de tipo **[Fact](../../../docs/getting-started/concepts/events/)**, que permita modificar el estado de un sujeto en la red.

Estos eventos de Fact interactúan con las operaciones definidas en el *contrato* del sujeto y actúan sobre ellas. En el caso de la gobernanza, su contrato es especial, ya que tanto su esquema como su contrato son [internos de kore](../../../docs/learn/Governance/schema/).

El contrato de la gobernanza expone solo un método de modificación, que debe usarse a través de *JSON Patch*.

Comencemos verificando los cambios que queremos realizar en las propiedades de gobernanza. Al final del paso anterior, nuestra gobernanza debería verse similar a la siguiente:

```json
{
    "members": [],
    "roles": [
        {
            "namespace": "",
            "role": "WITNESS",
            "schema": {
                "ID": "governance"
            },
            "who": "MEMBERS"
        }
    ]
}
```

Ahora, necesitamos incluir al miembro que creó la gobernanza, lo que daría como resultado un *json* como este:

```json
{
    "members": [
        {
            "id": "{{CONTROLLER-ID}}",
            "name": "WPO"
        }
    ],
    "roles": [
        
        ...

        {
            "namespace": "",
            "role": "APPROVER",
            "schema": {
                "ID": "governance"
            },
            "who": {
                "NAME": "WPO"
            }
        }
    ]
}
```

Para generar los cambios mencionados, usaremos nuestra herramienta [**kore-Patch**](../../../docs/learn/tools/) de la siguiente manera:

```bash 
kore-patch '{"members":[],"roles":[{"namespace":"","role":"WITNESS","schema":{"ID":"governance"},"who":"MEMBERS"}]}' '{"members":[{"id":"{{CONTROLLER-ID}}","name":"WPO"}],"roles":[{"namespace":"","role":"WITNESS","schema":{"ID":"governance"},"who":"MEMBERS"},{"namespace":"","role":"APPROVER","schema":{"ID":"governance"},"who":{"NAME":"WPO"}}]}'
```

El resultado será el siguiente:

```json
[
    {
        "op": "add",
        "path": "/members/0",
        "value": {
        "id": "{{CONTROLLER-ID}}",
        "name": "WPO"
        }
    },
    {
        "op": "add",
        "path": "/roles/1",
        "value": {
        "namespace": "",
        "role": "APPROVER",
        "schema": {
            "ID": "governance"
        },
        "who": {
            "NAME": "WPO"
        }
        }
    }
]
```

Ahora es el momento de llamar al método del contrato de gobierno responsable de actualizar sus propiedades. Para ello ejecutaremos lo siguiente:

```bash 
curl --request POST 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Fact": {
            "subject_id": "{{GOVERNANCE-ID}}",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/0",
                            "value": {
                            "id": "{{CONTROLLER-ID}}",
                            "name": "WPO"
                            }
                        },
                        {
                            "op": "add",
                            "path": "/roles/1",
                            "value": {
                                "namespace": "",
                                "role": "APPROVER",
                                "schema": {
                                    "ID": "governance"
                                },
                                "who": {
                                    "NAME": "WPO"
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
}'
```


{{< alert type="info" title="INFORMACIÓN">}}
Tenga en cuenta que los cambios que se encuentran dentro de la lista de `data` son los cambios que se realizarán en la gobernanza a través de *JSON-Patch*.
{{< /alert >}}


En este punto, necesitamos discutir un nuevo concepto: [la emisión de ciertos eventos requiere aprobación](../../../docs/getting-started/advanced/approval/), que se define en el nivel de contrato para un sujeto. En el caso de la gobernanza, sus cambios deben ser aprobados por aquellos miembros cuyo rol dentro de la misma hayan sido especificado como aprobador. Si no se definen aprobadores, el propietario de la gobernanza asume este rol.

Por lo tanto, debemos revisar nuestra lista de solicitudes de aprobación pendientes en el sistema:

```bash
curl --request GET 'http://localhost:3000/approval-requests?status=pending'
```

El resultado de esta operación será una lista con un solo elemento, que representa el evento pendiente de aprobación. Para aprobar esta solicitud de actualización de la gobernanza, copie el valor que se muestra en su campo `id` y ejecute el siguiente comando:

```bash
curl --request PATCH 'http://localhost:3000/approval-requests/{{PREVIOUS-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{"state": "RespondedAccepted"}'
```

Luego, revisamos nuevamente la gobernanza para verificar los cambios. El resultado debería mostrar un campo `sn` igual a 1 y la inclusión del nuevo miembro:

```bash
curl --request GET 'http://localhost:3000/subjects/{{GOVERNANCE-ID}}'
```

{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
{
    "subject_id": "{{GOVERNACE-ID}}",
    "governance_id": "",
    "sn": 1,
    "public_key": "E8tVWEasubIp7P9fzk_HttNCsABymV9m9xEPAfr-QV7M",
    "namespace": "",
    "name": "wine_track",
    "schema_id": "governance",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "members": [
        {
            "id": "{{CONTROLLER-ID}}",
            "name": "WPO"
        }
        ],
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
        },
        {
            "namespace": "",
            "role": "APPROVER",
            "schema": {
            "ID": "governance"
            },
            "who": {
            "NAME": "WPO"
            }
        }
        ],
        "schemas": []
    },
    "active": true
}
```
{{< /alert-details >}}