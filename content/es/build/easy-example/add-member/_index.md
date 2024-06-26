---
title: Añadir miembros
description: Añadiendo mienmbros a la gobernanza
weight: 3
---
## Segundo nodo
Para agregar un segundo miembro, podemos repetir el paso anterior pero cambiando ligeramente el cuerpo de la solicitud. Para hacer esto, primero ejecutaremos kore-keygen nuevamente para crear un segundo material criptográfico que identifique al segundo miembro:

```bash
PRIVATE KEY ED25519 (HEX): 388e07385cfd8871f990fe05f82610af1989f7abf5d4e42884c8337498086ba0
CONTROLLER ID ED25519: {{CONTROLLER-ID}}
PeerID: 12D3KooWRS3QVwqBtNp7rUCG4SF3nBrinQqJYC1N5qc1Wdr4jrze
```

Deberemos levantar el segundo nodo para ello crearemos un archivo de configuración añadiendo el `peer-id` del nodo 1, para ello debemos ejecutar:
```bash
curl --silent 'http://127.0.0.1:3000/peer-id'
```
```json
//config2.json
{
    "kore": {
      "network": {
          "listen_addresses": ["/ip4/0.0.0.0/tcp/50000"],
          "routing": {
            "boot_nodes": ["/ip4/172.17.0.1/tcp/50000/p2p/{{PEER-ID}}"]
          }
      },
    }
  }
```
Levantamos el nodo 2 en el puerto 3001:
```bash
docker run -p 3001:3000 -p 50001:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config2.json:/config.json koreadmin/kore-http:0.5-sqlite
```
{{< alert type="warning" title="CAUTION">}}
Preste atención a la dirección IP especificada en `boot_nodes` ya que puede ser diferente en su caso. Debe especificar una IP que permita que el segundo contenedor se comunique con el primero.
{{< /alert >}}

Obtenemos el `controler_id` del Nodo 2:
```bash
curl --silent 'http://127.0.0.1:3000/controller-id'
```

```json
{
  "request": {
    "Fact": {
      "subject_id": "{{GOVERNANCE-ID}}",
      "payload": {
          "Patch": {
              "data": [
                {
                    "op": "add",
                    "path": "/members/1",
                    "value": {
                    "id": "{{CONTROLER-ID}}",
                    "name": "Node2"
                    }
                }
            ]
          }
      }
    }
  }
}
```

{{< alert-details type="info" title="Solicitud" summary="Pincha para ver la solicitud" >}}
```bash
curl --silent 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data '{
    "request": {
        "Fact": {
            "subject_id": "{{GOVERNANCE-ID}}",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/1",
                            "value": {
                                "id": "{{CONTROLER-ID}}",
                                "name": "Node2"
                            }
                        }
                    ]
                }
            }
        }
    }
}'
```
{{< /alert-details >}}

Debemos aprobar nuevamente la nueva solicitud como en el caso anterior.

### Comunicación entre nodos
Ahora que está activo y encuentra el nodo definido en **boot_nodes**. Los eventos de la gobernanza comenzarán a llegar al segundo nodo, aunque aún no quedarán guardados en su base de datos. Esto se debe a que las gobernanzas siempre deben estar previamente autorizadas para permitir la recepción de sus eventos. Para esto se utiliza el endpoint **/allowed-subjects/{{GOVERNANCE-ID}}** y el método **PUT**. Recordad que en este caso hay que lanzarlo en el segundo nodo, que por la configuración que hemos puesto estará escuchando en el puerto 3001 de localhost. El segundo nodo ahora se actualizará correctamente con el sujeto de gobernanza.

```bash
curl --silent --request PUT 'http://localhost:3001/allowed-subjects/{{GOVERNANCE-ID}}' \
--header 'Content-Type: application/json' \
--data '{
    "providers": []
}'
```

Respuesta:

```json
OK
```

### Modificar la gobernanza

Como hemos visto anteriormente, el contrato de gobernanza actualmente solo tiene un método para modificar su estado, el método Patch. Este método incluye un objeto con un atributo de datos que a su vez es una matriz que representa un JSON Patch. Este parche se aplicará al estado actual de la gobernanza para modificarlo. Además al realizar la modificación se comprueba que el estado obtenido sea válido para una gobernanza, no sólo realizando la validación con el propio esquema de gobernanza sino también realizando comprobaciones exhaustivas, como que no haya miembros repetidos, cada esquema definido por turno...

Para facilitar la obtención del resultado que queremos y generar el JSON Patch específico podemos utilizar la herramienta kore-patch, incluida entre las [kore-tools](../../../docs/learn/tools/). A este ejecutable se le pasa el estado actual y el estado deseado y genera el parche correspondiente tras cuya aplicación se pasa de uno a otro.

Por ejemplo, haremos que todos los miembros de la gobernanza sean aprobadores, para ello debemos agregar el rol:

```json
{
    "namespace": "",
    "role": "APPROVER",
    "schema": {
        "ID": "governance"
    },
    "who": "MEMBERS"
}
```

Entonces el JSON Patch que tendremos que aplicar será:

```json
[
  {
    "op": "add",
    "path": "/roles/1",
    "value": {
        "namespace": "",
        "role": "APPROVER",
        "schema": {
            "ID": "governance"
        },
        "who": "MEMBERS"
    }
  }
]
```

Entonces el cuerpo de la solicitud será:

```json
{
  "request": {
    "Fact": {
      "subject_id": "{{GOVERNANCE-ID}}",
      "payload": {
          "Patch": {
              "data": [
                {
                  "op": "add",
                  "path": "/roles/1",
                  "value": {
                      "namespace": "",
                      "role": "APPROVER",
                      "schema": {
                          "ID": "governance"
                      },
                      "who": "MEMBERS"
                  }
                }
              ]
          }
      }
    }
  }
}
```

{{< alert-details type="info" title="Solicitud" summary="Pincha para ver la solicitud" >}}
```bash
curl --silent 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data '{
    "request": {
        "Fact": {
            "subject_id": "{{SUBJECT-ID}}",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/roles/1",
                            "value": {
                                "namespace": "",
                                "role": "APPROVER",
                                "schema": {
                                    "ID": "governance"
                                },
                                "who": "MEMBERS"
                            }
                        }
                    ]
                }
            }
        }
    }
}'
```
{{< /alert-details >}}

Aunque el siguiente estado dice que ambos son aprobadores, para calcular los firmantes de las diferentes fases se utiliza el estado actual del sujeto, previo a aplicar el cambio de estado de este nuevo evento que estamos creando, por lo que el único derecho de aprobador ahora seguirá siendo el primer nodo por ser el dueño de la gobernanza, por lo que debemos repetir el paso de autorización anterior.

## Tercer nodo
### Levantar el tercer nodo
Para agregar un tercer miembro repetimos los pasos anteriores, lo primero es crear el material criptográfico con kore-keygen o dejar que el nodo lo genere:

Lanzamos el contenedor de docker modificando los puertos pero usando el mismo archivo de config que el nodo 2:

```bash
docker run -p 3002:3000 -p 50002:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config2.json:/config.json koreadmin/kore-http:0.5-sqlite
```

### Modificar la gobernanza

Ahora lanzaremos el evento que suma al tercer miembro a la gobernanza, pero para comprobar el funcionamiento de las aprobaciones votaremos `sí` con un nodo y `no` con el otro, lo que dejará el evento como rechazado en la [fase de aprobación](../../../docs/getting-started/advanced/approval/). Aún se agregará a la cadena del sujeto, pero no modificará su estado.

```json
{
  "request": {
    "Fact": {
      "subject_id": "{{GOVERNANCE-ID}}",
      "payload": {
          "Patch": {
              "data": [
                {
                    "op": "add",
                    "path": "/members/2",
                    "value": {
                    "id": "{{CONTOLLER-ID}}",
                    "name": "Node3"
                    }
                }
            ]
          }
      }
    }
  }
}
```

{{< alert-details type="info" title="Solicitud" summary="Pincha para ver la solicitud" >}}
```bash
curl --silent 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data '{
    "request": {
        "Fact": {
            "subject_id": "{{GOVERNANCE-ID}}",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/2",
                            "value": {
                                "id": "{{CONTROLLER-ID}}",
                                "name": "Node3"
                            }
                        }
                    ]
                }
            }
        }
    }
}'
```
{{< /alert-details >}}

Primero debemos solicitar aprobaciones pendientes en **/approval-requests?status=pending** usando un **GET**. El id del json de respuesta es el que debemos utilizar para aprobarlo. En **/approval-requests/{id}** usando un **PATCH** agregaremos la identificación recibida para emitir el voto.

```bash
curl --silent 'http://localhost:3000/approval-requests?status=pending'
```

{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
[
    {
        "id": "J8NvGJ6XzV3ThfWdDN4epwXDFTY9hB2NKcyGEPbVViO4",
        "request": {
            "event_request": {
                "Fact": {
                    "subject_id": "{{GOVERNANCE-ID}}",
                    "payload": {
                        "Patch": {
                            "data": [
                                {
                                    "op": "add",
                                    "path": "/members/2",
                                    "value": {
                                        "id": "{{CONTROLLER-ID}}",
                                        "name": "Node3"
                                    }
                                }
                            ]
                        }
                    }
                },
                "signature": {
                    "signer": "{{CONTROLLER-ID}}",
                    "timestamp": 1689759413015509263,
                    "value": "SE1YEBQE1PdzwbtCnydZ1GnEw03Z8XkTZtXguYoCs3JqzuG5RIP00KxL_QIMCItUQsSip22mnZfmNScVpxAtyYCA"
                }
            },
            "sn": 4,
            "gov_version": 3,
            "patch": [
                {
                    "op": "add",
                    "path": "/members/2",
                    "value": {
                        "id": "{{CONTROLLER-ID}}",
                        "name": "Node3"
                    }
                }
            ],
            "state_hash": "Jv3BSUFzl7zq2cFldSbl0YjpZ1JEqCVzGG0plg6OT4GA",
            "hash_prev_event": "JZt9JQi5x5-nmkwacYO3H6qjvCg8dgOOVyDCPNuQlpFY",
            "signature": {
                "signer": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
                "timestamp": 1689759413045110844,
                "value": "SEu793Au3GbvoNUw8CEfAJBZj5RlspzpJdk3eJzB16u0Q7jLB04JN5WykLusqQzOyjDNquPMrs0HE5qCVEACJTBA"
            }
        },
        "reponse": null,
        "state": "Pending"
    }
]
```
{{< /alert-details >}}

En el nodo 1(puerto 3000) lo aprobaremos pero en el nodo 2(puerto 3001) lo rechazaremos. Como el quórum es de mayoría, esto significa que ambos deben aprobarlo para que sea aprobado. Por lo que si uno de los dos lo rechaza, será rechazado porque no se puede alcanzar el quórum de aceptación.

Nodo 1:
```json
{"state": "RespondedAccepted"}
```

```bash
curl --silent --request PATCH 'http://localhost:3000/approval-requests/{{REQUEST-ID}}' \
--header 'Content-Type: application/json' \
--data '{"state": "RespondedAccepted"}'
```

Nodo 2:
```json
{"state": "RespondedRejected"}
```

```bash
curl --silent --request PATCH 'http://localhost:3001/approval-requests/{{REQUEST_ID}}' \
--header 'Content-Type: application/json' \
--data '{"state": "RespondedRejected"}'
```


Comprobamos que el estado no se ha modificado buscando a nuestros sujetos, sin embargo, el **sn** del sujeto habrá aumentado en 1:

{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
[
    {
        "subject_id": "{{GOVERNANCE-ID}}",
        "governance_id": "",
        "sn": 4,
        "public_key": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
        "namespace": "",
        "name": "tutorial",
        "schema_id": "governance",
        "owner": "{{CONTROLLER-ID}}",
        "creator": "{{CONTROLLER-ID}}",
        "properties": {
            "members": [
                {
                    "id": "{{CONTROLLER-ID}}",
                    "name": "Nodo1"
                },
                {
                    "id": "{{CONTROLLER-ID}}",
                    "name": "Nodo2"
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
                    "who": "MEMBERS"
                }
            ],
            "schemas": []
        },
        "active": true
    }
]
```
{{< /alert-details >}}
También podemos buscar un evento específico con la api de eventos: **/subjects/{id}/events/{sn}** cuyo id es el **SubjectId** del sujeto, el **sn** es el evento específico al que vamos a buscar (si no se agrega nada devolverá todos los eventos del asunto) y la solicitud es de tipo **GET**.

```bash
curl --silent 'http://localhost:3000/subjects/{{GOVERNANCE-ID}}/events/4' \
```

{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
{
    "subject_id": "{{GOVERNANCE-ID}}",
    "event_request": {
        "Fact": {
            "subject_id": "{{GOVERNANCE-ID}}",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/2",
                            "value": {
                                "id": "{{CONTROLLER-ID}}",
                                "name": "Node3"
                            }
                        }
                    ]
                }
            }
        },
        "signature": {
            "signer": "{{CONTROLLER-ID}}",
            "timestamp": 1689759413015509263,
            "value": "SE1YEBQE1PdzwbtCnydZ1GnEw03Z8XkTZtXguYoCs3JqzuG5RIP00KxL_QIMCItUQsSip22mnZfmNScVpxAtyYCA"
        }
    },
    "sn": 4,
    "gov_version": 3,
    "patch": [
        {
            "op": "add",
            "path": "/members/2",
            "value": {
                "id": "{{CONTROLLER-ID}}",
                "name": "Node3"
            }
        }
    ],
    "state_hash": "Jv3BSUFzl7zq2cFldSbl0YjpZ1JEqCVzGG0plg6OT4GA",
    "eval_success": true,
    "appr_required": true,
    "approved": false,
    "hash_prev_event": "JZt9JQi5x5-nmkwacYO3H6qjvCg8dgOOVyDCPNuQlpFY",
    "evaluators": [
        {
            "signer": "{{CONTROLLER-ID}}",
            "timestamp": 1689759413042189699,
            "value": "SE__Vz_7yc3L0qJRXTnWzGRq0FsT3EGhe67WWLHkHcF7kqWKg6nldkWnx9od7byTTV_dNG_dwW26ShFbrLu1fLAg"
        }
    ],
    "approvers": [
        {
            "signer": "{{CONTROLLER-ID}}",
            "timestamp": 1689759533754268083,
            "value": "SEeUWADKs25krS0mxYuqLBQe8umbs39Fs5Nbp85_7X_Sa959mBmZFDFZ5FGgJu3EPK1Pm3KgDp0vmLpq0aZ7S5DQ"
        }
    ],
    "signature": {
        "signer": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
        "timestamp": 1689759533772217255,
        "value": "SEpn7Y28DrVFNKpk8qJB4_U2MQrQeJFa4UscRTg_Y1HVBrdjO-sy7J0f6-pGkLguKu2XdlQvXpNHOTeas1wkAICQ"
    }
}
```
{{< /alert-details >}}

Ahora repetiremos la misma solicitud pero votaremos sí con ambos nodos, los cuales aprobarán la solicitud y modificarán el estado del asunto. Aprobamos la gobernanza en el tercer nodo y veremos cómo se actualiza en un corto periodo de tiempo.