---
title: Añadir miembros
pagination_next: build/assets-traceability/running-node
date: 2024-06-06
weight: 5
---
Excelente, ahora tenemos el esquema necesario para crear el sujeto tipo *Wine*. Sin embargo, reflexionando, nos damos cuenta de que no hay nadie autorizado para crear y emitir eventos relacionados con este nuevo esquema. Por lo tanto, necesitamos agregar un nuevo participante a nuestra red responsable de esta tarea.

Comencemos configurando el nodo correspondiente:
```json
{
    "kore": {
      "network": {
          "listen_addresses": ["/ip4/0.0.0.0/tcp/50000"],
          "routing": {
            "boot_nodes": ["/ip4/172.17.0.1/tcp/50000/p2p/{{PEER-ID}}"]
          }
      }
    }
  }
```
Mapeamos el puerto 3001 para realizar peticiones desde nuestra máquina e indicamos el `peer-id` del nodo 1.
```bash   
docker run -p 3001:3000 -p 50001:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config2.json:/config.json koreadmin/kore-http:0.5-leveldb-prometheus
```

A continuación, procederemos a actualizar la gobernanza para incluir a este nuevo miembro y permitirle crear asuntos tipo *Wine*.

{{< alert type="info" title="INFO">}}
No es necesario asignarles el rol de testigo, ya que el propietario del sujeto es el testigo predeterminado.
{{< /alert >}}

Verifiquemos los cambios que queremos realizar en las propiedades de gobierno. En este punto, nuestra gobernanza debería verse así:

```json
{
    "members": [
        {
            "id": "{{CONTROLLER-ID}}",
            "name": "WPO"
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
    ]
}
```

Ahora, necesitamos incorporar los cambios mencionados:

```json
{
    "members": [
        
        ...

        {
            "id": "{{CONTROLLER-ID}}",
            "name": "PremiumWines"
        }
    ],
    "roles": [

        ...

        {
            "namespace": "",
            "role": "CREATOR",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "PremiumWines"
            }
        }
    ]
}
```

Usaremos nuestra herramienta [**Kore-Patch**](../../../docs/learn/tools/) para generar estos cambios, siguiendo el procedimiento a continuación:

```bash   
kore-patch '{"members":[{"id":"{{CONTROLLER-ID}}","name":"WPO"}],"roles":[{"namespace":"","role":"WITNESS","schema":{"ID":"governance"},"who":"MEMBERS"},{"namespace":"","role":"APPROVER","schema":{"ID":"governance"},"who":{"NAME":"WPO"}}]}' '{"members":[{"id":"{{CONTROLLER-ID}}","name":"WPO"},{"id":"{{CONTROLLER-ID}}","name":"PremiumWines"}],"roles":[{"namespace":"","role":"WITNESS","schema":{"ID":"governance"},"who":"MEMBERS"},{"namespace":"","role":"APPROVER","schema":{"ID":"governance"},"who":{"NAME":"WPO"}},{"namespace":"","role":"CREATOR","schema":{"ID":"Wine"},"who":{"NAME":"PremiumWines"}}]}'
```

El resultado obtenido será el siguiente:

```json
[
  {
    "op": "add",
    "path": "/members/1",
    "value": {
      "id": "{{CONTROLLER-ID}}",
      "name": "PremiumWines"
    }
  },
  {
    "op": "add",
    "path": "/roles/2",
    "value": {
      "namespace": "",
      "role": "CREATOR",
      "schema": {
        "ID": "Wine"
      },
      "who": {
        "NAME": "PremiumWines"
      }
    }
  }
]
```

Ahora es el momento de llamar al método del contrato de la gobernanza responsable de actualizar sus propiedades. Para hacer esto, ejecutaremos lo siguiente:

{{< alert-details type="info" title="Evento" summary="Pincha para ver el evento" >}}
```bash   
curl --request POST 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
    "Fact": {
        "subject_id": "{{GOVERNANCE-ID}}",
            "payload": {
                "Patch": {
                    "data": [{
                        "op": "add",
                        "path": "/members/1",
                        "value": {
                        "id": "{{CONTROLLER-ID}}",
                        "name": "PremiumWines"
                        }
                    },
                    {
                        "op": "add",
                        "path": "/roles/2",
                        "value": {
                            "namespace": "",
                            "role": "CREATOR",
                            "schema": {
                                "ID": "Wine"
                            },
                            "who": {
                                "NAME": "PremiumWines"
                            }
                        }
                    }]
                }
            }
        }
    }
}'
```
{{< /alert-details >}}

Una vez emitido el evento, necesitamos obtener la nueva solicitud de actualización. Para ello ejecutamos lo siguiente:

```bash   
curl --request GET 'http://localhost:3000/approval-requests?status=Pending'
```

Copiamos el valor del campo `id` y aceptamos la solicitud de actualización de gobernanza:

```bash   
curl --request PATCH 'http://localhost:3000/approval-requests/{{PREVIUS-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{"state": "RespondedAccepted"}'
```

Consultamos la gobernanza desde el nuevo nodo(puerto 3001):

```bash   
curl --request GET 'http://localhost:3001/subjects/{{GOVERNANCE-ID}}'
```

Obtendremos lo siguiente:

```bash
[]
```

¿Un error? ¿Pero no acabamos de incluir el nuevo nodo en la gobernanza y es testigo de ello?

Si bien lo último es cierto, debemos considerar lo siguiente: por razones de seguridad, el nodo kore rechaza todos los sujetos que no hayan sido enviados explícitamente, a menos que se cumpla una de las dos condiciones siguientes: la gobernanza está configurada para considerarlo un testigo, o autorizamos explícitamente al sujeto. En el caso de la gobernanza, es especial ya que no existe una gobernanza previa que la autorice, por lo que la única forma de acceder es autorizándola explícitamente.

Por lo tanto, debemos ejecutar lo siguiente para recibir información de gobernanza:

```bash   
curl --request PUT 'http://localhost:3001/allowed-subjects/{{GOVERNANCE-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "providers": []
}'
```

Ahora, al intentar consultar la gobernanza desde el nuevo nodo, obtendremos la información esperada:

```bash   
curl --request GET 'http://localhost:3001/subjects/{{GOVERNANCE-ID}}'
```

{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
{
    "subject_id": "{{GOVERNANCE-ID}}",
    "governance_id": "",
    "sn": 3,
    "public_key": "EUtKgajygy2tS46YWZj2piM_dxQ2gguznnOXBAZSPRzA",
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
            },
            {
                "id": "{{CONTROLLER-ID}}",
                "name": "PremiumWines"
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
            },
            {
                "approve": {
                    "quorum": "MAJORITY"
                },
                "evaluate": {
                    "quorum": "MAJORITY"
                },
                "id": "Wine",
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
            },
            {
                "namespace": "",
                "role": "CREATOR",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "PremiumWines"
                }
            }
        ],
        "schemas": [
            {
                "contract": {
                    "raw": "dXNlIHRhcGxlX3NjX3J1c3QgYXMgc2RrOw0KdXNlIHNlcmRlOjp7RGVzZXJpYWxpemUsIFNlcmlhbGl6ZX07DQoNCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lLCBQYXJ0aWFsRXEpXSANCmVudW0gR3JhcGUgew0KICAgIENhYmVybmV0U2F1dmlnbm9uLA0KICAgIENoYXJkb25uYXksDQogICAgUGlub3ROb2lyLA0KfQ0KDQojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplLCBDbG9uZSldDQpzdHJ1Y3QgVGVtcGVyYXR1cmVDb250cm9sIHsNCiAgICBwdWIgbGFzdF9jaGVjazogdTMyLA0KICAgIHB1YiB0ZW1wZXJhdHVyZV9vazogYm9vbCwNCn0NCg0KI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSwgQ2xvbmUpXQ0Kc3RydWN0IFN0YXRlIHsNCiAgICBwdWIgaGFydmVzdDogdTMyLA0KICAgIHB1YiBncmFwZTogT3B0aW9uPEdyYXBlPiwNCiAgICBwdWIgb3JpZ2luOiBTdHJpbmcsDQogICAgcHViIG9yZ2FuaWNfY2VydGlmaWVkOiBPcHRpb248Ym9vbD4sDQogICAgcHViIHRlbXBlcmF0dXJlX2NvbnRyb2w6IFRlbXBlcmF0dXJlQ29udHJvbCwNCn0NCg0KI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSldDQplbnVtIFN0YXRlRXZlbnQgew0KICAgIEluaXQgew0KICAgICAgICBoYXJ2ZXN0OiB1MzIsDQogICAgICAgIGdyYXBlOiBTdHJpbmcsDQogICAgICAgIG9yaWdpbjogU3RyaW5nLA0KICAgIH0sDQogICAgVGVtcGVyYXR1cmVDb250cm9sIHsNCiAgICAgICAgdGVtcGVyYXR1cmU6IGYzMiwNCiAgICAgICAgdGltZXN0YW1wOiB1MzIsDQogICAgfSwNCiAgICBPcmdhbmljQ2VydGlmaWNhdGlvbiB7DQogICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2w6IGJvb2wsDQogICAgICAgIHBlc3RpY2lkZXNfY29udHJvbDogYm9vbCwNCiAgICAgICAgYW5hbHl0aWNzOiBib29sLA0KICAgICAgICBhZGRpdGlvbmFsX2luZm86IFN0cmluZywNCiAgICB9LA0KfQ0KDQpjb25zdCBURU1QRVJBVFVSRV9SQU5HRTogKGYzMiwgZjMyKSA9ICgxMC4wLCAxNi4wKTsNCg0KI1tub19tYW5nbGVdDQpwdWIgdW5zYWZlIGZuIG1haW5fZnVuY3Rpb24oc3RhdGVfcHRyOiBpMzIsIGV2ZW50X3B0cjogaTMyLCBpc19vd25lcjogaTMyKSAtPiB1MzIgew0KICAgIHNkazo6ZXhlY3V0ZV9jb250cmFjdChzdGF0ZV9wdHIsIGV2ZW50X3B0ciwgaXNfb3duZXIsIGNvbnRyYWN0X2xvZ2ljKQ0KfQ0KDQpmbiBjb250cmFjdF9sb2dpYygNCiAgICBjb250ZXh0OiAmc2RrOjpDb250ZXh0PFN0YXRlLCBTdGF0ZUV2ZW50PiwNCiAgICBjb250cmFjdF9yZXN1bHQ6ICZtdXQgc2RrOjpDb250cmFjdFJlc3VsdDxTdGF0ZT4sDQopIHsNCiAgICBsZXQgc3RhdGUgPSAmbXV0IGNvbnRyYWN0X3Jlc3VsdC5maW5hbF9zdGF0ZTsNCiAgICBtYXRjaCAmY29udGV4dC5ldmVudCB7DQogICAgICAgIFN0YXRlRXZlbnQ6OkluaXQgew0KICAgICAgICAgICAgaGFydmVzdCwNCiAgICAgICAgICAgIGdyYXBlLA0KICAgICAgICAgICAgb3JpZ2luLA0KICAgICAgICB9ID0+IHsNCiAgICAgICAgICAgIGlmIGNvbnRleHQuaXNfb3duZXIgJiYgIWNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7IC8vIFNvbG8gbG8gcHVlZGRlIGhhY2VyIGVsIHByb3BpZXRhcmlvw6cNCiAgICAgICAgICAgICAgICBsZXQgZ3JhcGUgPSBtYXRjaCBncmFwZS5hc19zdHIoKSB7DQogICAgICAgICAgICAgICAgICAgICJDYWJlcm5ldFNhdXZpZ25vbiIgPT4gU29tZShHcmFwZTo6Q2FiZXJuZXRTYXV2aWdub24pLA0KICAgICAgICAgICAgICAgICAgICAiQ2hhcmRvbm5heSIgPT4gU29tZShHcmFwZTo6Q2hhcmRvbm5heSksDQogICAgICAgICAgICAgICAgICAgICJQaW5vdE5vaXIiID0+IFNvbWUoR3JhcGU6OlBpbm90Tm9pciksDQogICAgICAgICAgICAgICAgICAgIF8gPT4gTm9uZSwNCiAgICAgICAgICAgICAgICB9Ow0KICAgICAgICAgICAgICAgIGlmIGdyYXBlLmlzX3NvbWUoKSB7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLmhhcnZlc3QgPSAqaGFydmVzdDsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZ3JhcGUgPSBncmFwZTsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JpZ2luID0gb3JpZ2luLnRvX3N0cmluZygpOw0KICAgICAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgICAgIFN0YXRlRXZlbnQ6OlRlbXBlcmF0dXJlQ29udHJvbCB7DQogICAgICAgICAgICB0ZW1wZXJhdHVyZSwNCiAgICAgICAgICAgIHRpbWVzdGFtcCwNCiAgICAgICAgfSA9PiB7DQogICAgICAgICAgICBpZiBjb250ZXh0LmlzX293bmVyICYmIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7DQogICAgICAgICAgICAgICAgaWYgY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UoKnRlbXBlcmF0dXJlKQ0KICAgICAgICAgICAgICAgICAgICAmJiBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLnRlbXBlcmF0dXJlX29rDQogICAgICAgICAgICAgICAgew0KICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLmxhc3RfY2hlY2sgPSAqdGltZXN0YW1wOw0KICAgICAgICAgICAgICAgIH0gZWxzZSB7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlX2NvbnRyb2wudGVtcGVyYXR1cmVfb2sgPSBmYWxzZTsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmVfY29udHJvbC5sYXN0X2NoZWNrID0gKnRpbWVzdGFtcDsNCiAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgY29udHJhY3RfcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgICAgIFN0YXRlRXZlbnQ6Ok9yZ2FuaWNDZXJ0aWZpY2F0aW9uIHsNCiAgICAgICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2wsDQogICAgICAgICAgICBwZXN0aWNpZGVzX2NvbnRyb2wsDQogICAgICAgICAgICBhbmFseXRpY3MsDQogICAgICAgICAgICBhZGRpdGlvbmFsX2luZm8sDQogICAgICAgIH0gPT4gew0KICAgICAgICAgICAgaWYgY2hlY2tfc3ViamVjdF9oYXNfYmVlbl9pbml0aWF0ZWQoc3RhdGUpIHsNCiAgICAgICAgICAgICAgICBtYXRjaCBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCB7DQogICAgICAgICAgICAgICAgICAgIFNvbWUob3JnYW5pY19jZXJpZmllZCkgPT4gew0KICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3JnYW5pY19jZXJpZmllZA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICFjaGVja19pc19vcmdhbmljKA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqZmVydGlsaXplcnNfY29udHJvbCwNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKnBlc3RpY2lkZXNfY29udHJvbCwNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKmFuYWx5dGljcywNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICApDQogICAgICAgICAgICAgICAgICAgICAgICB7DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsNCiAgICAgICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgICAgICBOb25lID0+IHsNCiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoZWNrX2lzX29yZ2FuaWMoKmZlcnRpbGl6ZXJzX2NvbnRyb2wsICpwZXN0aWNpZGVzX2NvbnRyb2wsICphbmFseXRpY3MpIHsNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCA9IFNvbWUodHJ1ZSk7DQogICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Ugew0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yZ2FuaWNfY2VydGlmaWVkID0gU29tZShmYWxzZSk7DQogICAgICAgICAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgY29udHJhY3RfcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgfQ0KfQ0KDQpmbiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZTogJlN0YXRlKSAtPiBib29sIHsNCiAgICBsZXQgaW5pdGlhbF9ncmFwZSA9IG1hdGNoIHN0YXRlLmdyYXBlIHsNCiAgICAgICAgU29tZShfKSA9PiBmYWxzZSwNCiAgICAgICAgTm9uZSA9PiB0cnVlLA0KICAgIH07DQogICAgaWYgc3RhdGUuaGFydmVzdCA9PSAwICYmIGluaXRpYWxfZ3JhcGUgJiYgc3RhdGUub3JpZ2luID09IGZvcm1hdCEoIiIpIHsNCiAgICAgICAgcmV0dXJuIGZhbHNlOw0KICAgIH0NCiAgICByZXR1cm4gdHJ1ZTsNCn0NCg0KZm4gY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UodGVtcGVyYXR1cmU6IGYzMikgLT4gYm9vbCB7DQogICAgaWYgdGVtcGVyYXR1cmUgPj0gVEVNUEVSQVRVUkVfUkFOR0UuMCAmJiB0ZW1wZXJhdHVyZSA8PSBURU1QRVJBVFVSRV9SQU5HRS4xIHsNCiAgICAgICAgcmV0dXJuIHRydWU7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0NCg0KZm4gY2hlY2tfaXNfb3JnYW5pYyhmZXJ0aWxpemVyc19jb250cm9sOiBib29sLCBwZXN0aWNpZGVzX2NvbnRyb2w6IGJvb2wsIGFuYWx5dGljczogYm9vbCkgLT4gYm9vbCB7DQogICAgaWYgZmVydGlsaXplcnNfY29udHJvbCAmJiBwZXN0aWNpZGVzX2NvbnRyb2wgJiYgYW5hbHl0aWNzIHsNCiAgICAgICAgcmV0dXJuIHRydWU7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0="
                },
                "id": "Wine",
                "initial_value": {
                    "grape": null,
                    "harvest": 0,
                    "organic_certified": null,
                    "origin": "",
                    "temperature_control": {
                        "last_check": 0,
                        "temperature_ok": true
                    }
                },
                "schema": {
                    "additionalProperties": false,
                    "description": "Representation of a bottle of wine",
                    "properties": {
                        "grape": {
                            "description": "Type of grape",
                            "enum": [
                                "CabernetSauvignon",
                                "Chardonnay",
                                "PinotNoir",
                                null
                            ],
                            "type": [
                                "string",
                                "null"
                            ]
                        },
                        "harvest": {
                            "description": "Harvest number",
                            "type": "integer"
                        },
                        "organic_certified": {
                            "description": "Certificate authenticating whether it is organic or not",
                            "type": [
                                "boolean",
                                "null"
                            ]
                        },
                        "origin": {
                            "description": "Origin of the grape",
                            "type": "string"
                        },
                        "temperature_control": {
                            "additionalProperties": false,
                            "description": "Values to be changed in the temperature control event",
                            "properties": {
                                "last_check": {
                                    "description": "Timestamp of last check",
                                    "type": "integer"
                                },
                                "temperature_ok": {
                                    "description": "Value that corroborates whether the wine cold chain has been complied with",
                                    "type": "boolean"
                                }
                            },
                            "required": [
                                "last_check",
                                "temperature_ok"
                            ],
                            "type": "object"
                        }
                    },
                    "required": [
                        "harvest",
                        "grape",
                        "origin",
                        "organic_certified",
                        "temperature_control"
                    ],
                    "type": "object"
                }
            }
        ]
    },
    "active": true
}
```
{{< /alert-details >}}

## Organización Mundial de la Alimentación

Actualmente, **WPO** es el único propietario de la gobernanza y tiene el poder exclusivo de aprobar cambios en la misma. Sin embargo, esto plantea un problema ya que su poder es absoluto y, por ejemplo, carece de representación o influencia de todo el mundo en los cambios realizados en esta gobernanza. Por lo tanto, es necesario agregar un nuevo miembro a la gobernanza, la *Organización Mundial de la Alimentación* (**WFO**), que actuará como segundo validador y evitará el monopolio existente de **WPO**.

Para lograr esto, permitiremos que **WFO** asuma las funciones de aprobador, validador y evaluador de la gobernanza. Además, se le permitirá actuar como testigo en el sujeto de tipo *Vino* ya que le interesa recopilar estadísticas de consumo.

Comencemos configurando el nodo **WFO**:

```bash   
docker run -p 3002:3000 -p 50002:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config2.json:/config.json koreadmin/kore-http:0.5-leveldb-prometheus
```

A continuación procederemos a actualizar la gobernanza para otorgarle las propiedades mencionadas:

{{< alert-details type="info" title="Evento" summary="Pincha para ver el evento" >}}
```bash
curl --request POST 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
    "Fact": {
        "subject_id": "{{GOVERNANCE-ID}}",
            "payload": {
                "Patch": {
                    "data": [{
                        "op": "add",
                        "path": "/members/2",
                        "value": {
                        "id": "{{CONTROLLER-ID}}",
                        "name": "WFO"
                        }
                    },
                    {
                        "op": "add",
                        "path": "/roles/3",
                        "value": {
                            "namespace": "",
                            "role": "APPROVER",
                            "schema": {
                                "ID": "governance"
                            },
                            "who": {
                                "NAME": "WFO"
                            }
                        }
                    },
                    {
                        "op": "add",
                        "path": "/roles/4",
                        "value": {
                            "namespace": "",
                            "role": "VALIDATOR",
                            "schema": {
                                "ID": "governance"
                            },
                            "who": {
                                "NAME": "WFO"
                            }
                        }
                    },
                    {
                        "op": "add",
                        "path": "/roles/5",
                        "value": {
                            "namespace": "",
                            "role": "EVALUATOR",
                            "schema": {
                                "ID": "governance"
                            },
                            "who": {
                                "NAME": "WFO"
                            }
                        }
                    },
                    {
                        "op": "add",
                        "path": "/roles/6",
                        "value": {
                            "namespace": "",
                            "role": "WITNESS",
                            "schema": {
                                "ID": "Wine"
                            },
                            "who": {
                                "NAME": "WFO"
                            }
                        }
                    }]
                }
            }
        }
    }
}'
```
{{< /alert-details >}}

{{< alert type="warning" title="CAUTION">}}
En este punto, los pasos para generar el nuevo *Json Patch* para la gobernanza no se describen ya que están detallados en la sección anterior.
{{< /alert >}}

Una vez ejecutado este comando, deberíamos obtener nuevamente la solicitud de actualización. Para ello ejecutamos:

```bash   
curl --request GET 'http://localhost:3000/approval-requests?status=Pending'
```

Copiamos el valor del campo `id` y aceptamos la solicitud de actualización de gobernanza:

```bash   
curl --request PATCH 'http://localhost:3000/approval-requests/{{PREVIUS-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{"state": "RespondedAccepted"}'
```

Llegados a este punto, nos encontraremos en una situación similar a la descrita en el sección anterior. Aunque el nuevo nodo es parte de la gobernanza, no puede recibir su información, por lo que necesitamos realizar su preautorización. Para hacer esto, ejecutaremos el siguiente comando:

```bash   
curl --request PUT 'http://localhost:3002/allowed-subjects/{{GOVERNANCE-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "providers": []
}'
```

Si todo ha ido como se esperaba, ahora podemos consultar la gobernanza del nuevo nodo, y ahora debería tener un valor `sn` de 4, así como el cambio realizado en miembros y roles.

```bash   
curl --request GET 'http://localhost:3002/subjects/{{GOVERNANCE-ID}}'
```

{{< alert-details type="info" title="Governance" summary="Click to see the governance" >}}
```json
{
    "subject_id": "{{GOVERNANCE-ID}}",
    "governance_id": "",
    "sn": 4,
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
            },
            {
                "id": "{{CONTROLLER-ID}}",
                "name": "PremiumWines"
            },
            {
                "id": "{{CONTROLLER-ID}}",
                "name": "WFO"
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
            },
            {
                "approve": {
                    "quorum": "MAJORITY"
                },
                "evaluate": {
                    "quorum": "MAJORITY"
                },
                "id": "Wine",
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
            },
            {
                "namespace": "",
                "role": "CREATOR",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "PremiumWines"
                }
            },
            {
                "namespace": "",
                "role": "APPROVER",
                "schema": {
                    "ID": "governance"
                },
                "who": {
                    "NAME": "WFO"
                }
            },
            {
                "namespace": "",
                "role": "VALIDATOR",
                "schema": {
                    "ID": "governance"
                },
                "who": {
                    "NAME": "WFO"
                }
            },
            {
                "namespace": "",
                "role": "EVALUATOR",
                "schema": {
                    "ID": "governance"
                },
                "who": {
                    "NAME": "WFO"
                }
            },
            {
                "namespace": "",
                "role": "WITNESS",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "WFO"
                }
            }
        ],
        "schemas": [
            {
                "contract": {
                    "raw": "dXNlIHRhcGxlX3NjX3J1c3QgYXMgc2RrOw0KdXNlIHNlcmRlOjp7RGVzZXJpYWxpemUsIFNlcmlhbGl6ZX07DQoNCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lLCBQYXJ0aWFsRXEpXSANCmVudW0gR3JhcGUgew0KICAgIENhYmVybmV0U2F1dmlnbm9uLA0KICAgIENoYXJkb25uYXksDQogICAgUGlub3ROb2lyLA0KfQ0KDQojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplLCBDbG9uZSldDQpzdHJ1Y3QgVGVtcGVyYXR1cmVDb250cm9sIHsNCiAgICBwdWIgbGFzdF9jaGVjazogdTMyLA0KICAgIHB1YiB0ZW1wZXJhdHVyZV9vazogYm9vbCwNCn0NCg0KI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSwgQ2xvbmUpXQ0Kc3RydWN0IFN0YXRlIHsNCiAgICBwdWIgaGFydmVzdDogdTMyLA0KICAgIHB1YiBncmFwZTogT3B0aW9uPEdyYXBlPiwNCiAgICBwdWIgb3JpZ2luOiBTdHJpbmcsDQogICAgcHViIG9yZ2FuaWNfY2VydGlmaWVkOiBPcHRpb248Ym9vbD4sDQogICAgcHViIHRlbXBlcmF0dXJlX2NvbnRyb2w6IFRlbXBlcmF0dXJlQ29udHJvbCwNCn0NCg0KI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSldDQplbnVtIFN0YXRlRXZlbnQgew0KICAgIEluaXQgew0KICAgICAgICBoYXJ2ZXN0OiB1MzIsDQogICAgICAgIGdyYXBlOiBTdHJpbmcsDQogICAgICAgIG9yaWdpbjogU3RyaW5nLA0KICAgIH0sDQogICAgVGVtcGVyYXR1cmVDb250cm9sIHsNCiAgICAgICAgdGVtcGVyYXR1cmU6IGYzMiwNCiAgICAgICAgdGltZXN0YW1wOiB1MzIsDQogICAgfSwNCiAgICBPcmdhbmljQ2VydGlmaWNhdGlvbiB7DQogICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2w6IGJvb2wsDQogICAgICAgIHBlc3RpY2lkZXNfY29udHJvbDogYm9vbCwNCiAgICAgICAgYW5hbHl0aWNzOiBib29sLA0KICAgICAgICBhZGRpdGlvbmFsX2luZm86IFN0cmluZywNCiAgICB9LA0KfQ0KDQpjb25zdCBURU1QRVJBVFVSRV9SQU5HRTogKGYzMiwgZjMyKSA9ICgxMC4wLCAxNi4wKTsNCg0KI1tub19tYW5nbGVdDQpwdWIgdW5zYWZlIGZuIG1haW5fZnVuY3Rpb24oc3RhdGVfcHRyOiBpMzIsIGV2ZW50X3B0cjogaTMyLCBpc19vd25lcjogaTMyKSAtPiB1MzIgew0KICAgIHNkazo6ZXhlY3V0ZV9jb250cmFjdChzdGF0ZV9wdHIsIGV2ZW50X3B0ciwgaXNfb3duZXIsIGNvbnRyYWN0X2xvZ2ljKQ0KfQ0KDQpmbiBjb250cmFjdF9sb2dpYygNCiAgICBjb250ZXh0OiAmc2RrOjpDb250ZXh0PFN0YXRlLCBTdGF0ZUV2ZW50PiwNCiAgICBjb250cmFjdF9yZXN1bHQ6ICZtdXQgc2RrOjpDb250cmFjdFJlc3VsdDxTdGF0ZT4sDQopIHsNCiAgICBsZXQgc3RhdGUgPSAmbXV0IGNvbnRyYWN0X3Jlc3VsdC5maW5hbF9zdGF0ZTsNCiAgICBtYXRjaCAmY29udGV4dC5ldmVudCB7DQogICAgICAgIFN0YXRlRXZlbnQ6OkluaXQgew0KICAgICAgICAgICAgaGFydmVzdCwNCiAgICAgICAgICAgIGdyYXBlLA0KICAgICAgICAgICAgb3JpZ2luLA0KICAgICAgICB9ID0+IHsNCiAgICAgICAgICAgIGlmIGNvbnRleHQuaXNfb3duZXIgJiYgIWNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7IC8vIFNvbG8gbG8gcHVlZGRlIGhhY2VyIGVsIHByb3BpZXRhcmlvw6cNCiAgICAgICAgICAgICAgICBsZXQgZ3JhcGUgPSBtYXRjaCBncmFwZS5hc19zdHIoKSB7DQogICAgICAgICAgICAgICAgICAgICJDYWJlcm5ldFNhdXZpZ25vbiIgPT4gU29tZShHcmFwZTo6Q2FiZXJuZXRTYXV2aWdub24pLA0KICAgICAgICAgICAgICAgICAgICAiQ2hhcmRvbm5heSIgPT4gU29tZShHcmFwZTo6Q2hhcmRvbm5heSksDQogICAgICAgICAgICAgICAgICAgICJQaW5vdE5vaXIiID0+IFNvbWUoR3JhcGU6OlBpbm90Tm9pciksDQogICAgICAgICAgICAgICAgICAgIF8gPT4gTm9uZSwNCiAgICAgICAgICAgICAgICB9Ow0KICAgICAgICAgICAgICAgIGlmIGdyYXBlLmlzX3NvbWUoKSB7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLmhhcnZlc3QgPSAqaGFydmVzdDsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZ3JhcGUgPSBncmFwZTsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JpZ2luID0gb3JpZ2luLnRvX3N0cmluZygpOw0KICAgICAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgICAgIFN0YXRlRXZlbnQ6OlRlbXBlcmF0dXJlQ29udHJvbCB7DQogICAgICAgICAgICB0ZW1wZXJhdHVyZSwNCiAgICAgICAgICAgIHRpbWVzdGFtcCwNCiAgICAgICAgfSA9PiB7DQogICAgICAgICAgICBpZiBjb250ZXh0LmlzX293bmVyICYmIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7DQogICAgICAgICAgICAgICAgaWYgY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UoKnRlbXBlcmF0dXJlKQ0KICAgICAgICAgICAgICAgICAgICAmJiBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLnRlbXBlcmF0dXJlX29rDQogICAgICAgICAgICAgICAgew0KICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLmxhc3RfY2hlY2sgPSAqdGltZXN0YW1wOw0KICAgICAgICAgICAgICAgIH0gZWxzZSB7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlX2NvbnRyb2wudGVtcGVyYXR1cmVfb2sgPSBmYWxzZTsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmVfY29udHJvbC5sYXN0X2NoZWNrID0gKnRpbWVzdGFtcDsNCiAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgY29udHJhY3RfcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgICAgIFN0YXRlRXZlbnQ6Ok9yZ2FuaWNDZXJ0aWZpY2F0aW9uIHsNCiAgICAgICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2wsDQogICAgICAgICAgICBwZXN0aWNpZGVzX2NvbnRyb2wsDQogICAgICAgICAgICBhbmFseXRpY3MsDQogICAgICAgICAgICBhZGRpdGlvbmFsX2luZm8sDQogICAgICAgIH0gPT4gew0KICAgICAgICAgICAgaWYgY2hlY2tfc3ViamVjdF9oYXNfYmVlbl9pbml0aWF0ZWQoc3RhdGUpIHsNCiAgICAgICAgICAgICAgICBtYXRjaCBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCB7DQogICAgICAgICAgICAgICAgICAgIFNvbWUob3JnYW5pY19jZXJpZmllZCkgPT4gew0KICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3JnYW5pY19jZXJpZmllZA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICFjaGVja19pc19vcmdhbmljKA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqZmVydGlsaXplcnNfY29udHJvbCwNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKnBlc3RpY2lkZXNfY29udHJvbCwNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKmFuYWx5dGljcywNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICApDQogICAgICAgICAgICAgICAgICAgICAgICB7DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsNCiAgICAgICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgICAgICBOb25lID0+IHsNCiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoZWNrX2lzX29yZ2FuaWMoKmZlcnRpbGl6ZXJzX2NvbnRyb2wsICpwZXN0aWNpZGVzX2NvbnRyb2wsICphbmFseXRpY3MpIHsNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCA9IFNvbWUodHJ1ZSk7DQogICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Ugew0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yZ2FuaWNfY2VydGlmaWVkID0gU29tZShmYWxzZSk7DQogICAgICAgICAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgY29udHJhY3RfcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgfQ0KfQ0KDQpmbiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZTogJlN0YXRlKSAtPiBib29sIHsNCiAgICBsZXQgaW5pdGlhbF9ncmFwZSA9IG1hdGNoIHN0YXRlLmdyYXBlIHsNCiAgICAgICAgU29tZShfKSA9PiBmYWxzZSwNCiAgICAgICAgTm9uZSA9PiB0cnVlLA0KICAgIH07DQogICAgaWYgc3RhdGUuaGFydmVzdCA9PSAwICYmIGluaXRpYWxfZ3JhcGUgJiYgc3RhdGUub3JpZ2luID09IGZvcm1hdCEoIiIpIHsNCiAgICAgICAgcmV0dXJuIGZhbHNlOw0KICAgIH0NCiAgICByZXR1cm4gdHJ1ZTsNCn0NCg0KZm4gY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UodGVtcGVyYXR1cmU6IGYzMikgLT4gYm9vbCB7DQogICAgaWYgdGVtcGVyYXR1cmUgPj0gVEVNUEVSQVRVUkVfUkFOR0UuMCAmJiB0ZW1wZXJhdHVyZSA8PSBURU1QRVJBVFVSRV9SQU5HRS4xIHsNCiAgICAgICAgcmV0dXJuIHRydWU7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0NCg0KZm4gY2hlY2tfaXNfb3JnYW5pYyhmZXJ0aWxpemVyc19jb250cm9sOiBib29sLCBwZXN0aWNpZGVzX2NvbnRyb2w6IGJvb2wsIGFuYWx5dGljczogYm9vbCkgLT4gYm9vbCB7DQogICAgaWYgZmVydGlsaXplcnNfY29udHJvbCAmJiBwZXN0aWNpZGVzX2NvbnRyb2wgJiYgYW5hbHl0aWNzIHsNCiAgICAgICAgcmV0dXJuIHRydWU7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0="
                },
                "id": "Wine",
                "initial_value": {
                    "grape": null,
                    "harvest": 0,
                    "organic_certified": null,
                    "origin": "",
                    "temperature_control": {
                        "last_check": 0,
                        "temperature_ok": true
                    }
                },
                "schema": {
                    "additionalProperties": false,
                    "description": "Representation of a bottle of wine",
                    "properties": {
                        "grape": {
                            "description": "Type of grape",
                            "enum": [
                                "CabernetSauvignon",
                                "Chardonnay",
                                "PinotNoir",
                                null
                            ],
                            "type": [
                                "string",
                                "null"
                            ]
                        },
                        "harvest": {
                            "description": "Harvest number",
                            "type": "integer"
                        },
                        "organic_certified": {
                            "description": "Certificate authenticating whether it is organic or not",
                            "type": [
                                "boolean",
                                "null"
                            ]
                        },
                        "origin": {
                            "description": "Origin of the grape",
                            "type": "string"
                        },
                        "temperature_control": {
                            "additionalProperties": false,
                            "description": "Values to be changed in the temperature control event",
                            "properties": {
                                "last_check": {
                                    "description": "Timestamp of last check",
                                    "type": "integer"
                                },
                                "temperature_ok": {
                                    "description": "Value that corroborates whether the wine cold chain has been complied with",
                                    "type": "boolean"
                                }
                            },
                            "required": [
                                "last_check",
                                "temperature_ok"
                            ],
                            "type": "object"
                        }
                    },
                    "required": [
                        "harvest",
                        "grape",
                        "origin",
                        "organic_certified",
                        "temperature_control"
                    ],
                    "type": "object"
                }
            }
        ]
    },
    "active": true
}
```
{{< /alert-details >}}
