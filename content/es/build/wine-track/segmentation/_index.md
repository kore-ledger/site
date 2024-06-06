---
title: Segmentación
pagination_next: build/assets-traceability/running-node
date: 2024-05-06
weight: 10
---
Actualmente contamos con testigos y aprobadores para los sujetos *Vino*. Sin embargo, surge un problema con uno de los nodos que agregamos, **SFO**, ya que es específico de España y no queremos que influya en las decisiones tomadas en otros países.

Para abordar esta necesidad surge el concepto de segmentación por [espacio de nombres](../../../docs/getting-started/concepts/subjects/). Esto nos permite definir permisos y roles específicos para ciertos espacios de nombres, asegurando que solo los nodos que consideramos válidos puedan acceder a información específica según nuestros intereses.

Con este nuevo conocimiento, es hora de seguir adaptando nuestro caso de uso. *PremiumWines* no sólo cuenta con viñedos en España sino también en Francia, lo que les permite elaborar botellas con distintos orígenes. Como sabemos, en España existe un organismo (**SFO**) capaz de aprobar el análisis de calidad del producto, pero este no es el caso en Francia, donde esta responsabilidad recae en **WFO**.

Para lograr lo que proponemos, necesitamos realizar algunos cambios en el esquema actual:

- *PremiumWines* debería poder crear temas en ambos países, por lo que debe ser creador en los espacios de nombres "España" y "Francia".
- *WFO* se convierte en testigo y aprobador de vinos tanto en España como en Francia.
- Se deberían permitir las invocaciones externas tanto en España como en Francia.
- *SFO* sólo será aprobador y testigo de los vinos españoles.

Primero, verifiquemos las funciones de la gobernanza antes de realizar estos cambios:

{{< alert-details type="info" title="Gobernanza" summary="Pincha para ver la gobernanza" >}}
```json
{
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
        },
        {
            "namespace": "",
            "role": "ISSUER",
            "schema": {
                "ID": "Wine"
            },
            "who": "NOT_MEMBERS"
        },
        {
            "namespace": "",
            "role": "WITNESS",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "SFO"
            }
        },
        {
            "namespace": "",
            "role": "APPROVER",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "SFO"
            }
        }
    ]
}
```
{{< /alert-details >}}


Haremos cambios en los roles declarados en la gobernanza. Así es como deberían verse las propiedades después de las modificaciones:
{{< alert-details type="info" title="Gobernanza" summary="Pincha para ver la gobernanza" >}}
```json
{
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
            "namespace": "Spain",
            "role": "CREATOR",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "PremiumWines"
            }
        },
        {
            "namespace": "France",
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
            "namespace": "Spain",
            "role": "WITNESS",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "WFO"
            }
        },
        {
            "namespace": "France",
            "role": "WITNESS",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "WFO"
            }
        },
        {
            "namespace": "Spain",
            "role": "APPROVER",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "WFO"
            }
        },
        {
            "namespace": "France",
            "role": "APPROVER",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "WFO"
            }
        },
        {
            "namespace": "Spain",
            "role": "ISSUER",
            "schema": {
                "ID": "Wine"
            },
            "who": "NOT_MEMBERS"
        },
        {
            "namespace": "France",
            "role": "ISSUER",
            "schema": {
                "ID": "Wine"
            },
            "who": "NOT_MEMBERS"
        },
        {
            "namespace": "Spain",
            "role": "WITNESS",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "SFO"
            }
        },
        {
            "namespace": "Spain",
            "role": "APPROVER",
            "schema": {
                "ID": "Wine"
            },
            "who": {
                "NAME": "SFO"
            }
        }
    ]
}
```
{{< /alert-details >}}


Para generar estos cambios usaremos nuestra herramienta [**kore-Patch**](../../../docs/learn/tools/) siguiendo este procedimiento:

```bash
kore-patch '{"roles":[{"namespace":"","role":"WITNESS","schema":{"ID":"governance"},"who":"MEMBERS"},{"namespace":"","role":"APPROVER","schema":{"ID":"governance"},"who":{"NAME":"WPO"}},{"namespace":"","role":"CREATOR","schema":{"ID":"Wine"},"who":{"NAME":"PremiumWines"}},{"namespace":"","role":"APPROVER","schema":{"ID":"governance"},"who":{"NAME":"WFO"}},{"namespace":"","role":"VALIDATOR","schema":{"ID":"governance"},"who":{"NAME":"WFO"}},{"namespace":"","role":"EVALUATOR","schema":{"ID":"governance"},"who":{"NAME":"WFO"}},{"namespace":"","role":"WITNESS","schema":{"ID":"Wine"},"who":{"NAME":"WFO"}},{"namespace":"","role":"ISSUER","schema":{"ID":"Wine"},"who":"NOT_MEMBERS"},{"namespace":"","role":"WITNESS","schema":{"ID":"Wine"},"who":{"NAME":"SFO"}},{"namespace":"","role":"APPROVER","schema":{"ID":"Wine"},"who":{"NAME":"SFO"}}]}' '{"roles":[{"namespace":"","role":"WITNESS","schema":{"ID":"governance"},"who":"MEMBERS"},{"namespace":"","role":"APPROVER","schema":{"ID":"governance"},"who":{"NAME":"WPO"}},{"namespace":"Spain","role":"CREATOR","schema":{"ID":"Wine"},"who":{"NAME":"PremiumWines"}},{"namespace":"France","role":"CREATOR","schema":{"ID":"Wine"},"who":{"NAME":"PremiumWines"}},{"namespace":"","role":"APPROVER","schema":{"ID":"governance"},"who":{"NAME":"WFO"}},{"namespace":"","role":"VALIDATOR","schema":{"ID":"governance"},"who":{"NAME":"WFO"}},{"namespace":"","role":"EVALUATOR","schema":{"ID":"governance"},"who":{"NAME":"WFO"}},{"namespace":"Spain","role":"WITNESS","schema":{"ID":"Wine"},"who":{"NAME":"WFO"}},{"namespace":"France","role":"WITNESS","schema":{"ID":"Wine"},"who":{"NAME":"WFO"}},{"namespace":"Spain","role":"APPROVER","schema":{"ID":"Wine"},"who":{"NAME":"WFO"}},{"namespace":"France","role":"APPROVER","schema":{"ID":"Wine"},"who":{"NAME":"WFO"}},{"namespace":"Spain","role":"ISSUER","schema":{"ID":"Wine"},"who":"NOT_MEMBERS"},{"namespace":"France","role":"ISSUER","schema":{"ID":"Wine"},"who":"NOT_MEMBERS"},{"namespace":"Spain","role":"WITNESS","schema":{"ID":"Wine"},"who":{"NAME":"SFO"}},{"namespace":"Spain","role":"APPROVER","schema":{"ID":"Wine"},"who":{"NAME":"SFO"}}]}'
```

El resultado obtenido será:
{{< alert-details type="info" title="JSON Patch" summary="Pincha para ver el la salida" >}}
```json
[
    {
        "op": "replace",
        "path": "/roles/2/namespace",
        "value": "Spain"
    },
    {
        "op": "replace",
        "path": "/roles/3/namespace",
        "value": "France"
    },
    {
        "op": "replace",
        "path": "/roles/3/role",
        "value": "CREATOR"
    },
    {
        "op": "replace",
        "path": "/roles/3/schema/ID",
        "value": "Wine"
    },
    {
        "op": "replace",
        "path": "/roles/3/who/NAME",
        "value": "PremiumWines"
    },
    {
        "op": "replace",
        "path": "/roles/4/role",
        "value": "APPROVER"
    },
    {
        "op": "replace",
        "path": "/roles/5/role",
        "value": "VALIDATOR"
    },
    {
        "op": "replace",
        "path": "/roles/6/role",
        "value": "EVALUATOR"
    },
    {
        "op": "replace",
        "path": "/roles/6/schema/ID",
        "value": "governance"
    },
    {
        "op": "replace",
        "path": "/roles/7/namespace",
        "value": "Spain"
    },
    {
        "op": "replace",
        "path": "/roles/7/role",
        "value": "WITNESS"
    },
    {
        "op": "replace",
        "path": "/roles/7/who",
        "value": {
        "NAME": "WFO"
        }
    },
    {
        "op": "replace",
        "path": "/roles/8/namespace",
        "value": "France"
    },
    {
        "op": "replace",
        "path": "/roles/8/who/NAME",
        "value": "WFO"
    },
    {
        "op": "replace",
        "path": "/roles/9/namespace",
        "value": "Spain"
    },
    {
        "op": "replace",
        "path": "/roles/9/who/NAME",
        "value": "WFO"
    },
    {
        "op": "add",
        "path": "/roles/10",
        "value": {
        "namespace": "France",
        "role": "APPROVER",
        "schema": {
            "ID": "Wine"
        },
        "who": {
            "NAME": "WFO"
        }
        }
    },
    {
        "op": "add",
        "path": "/roles/11",
        "value": {
        "namespace": "Spain",
        "role": "ISSUER",
        "schema": {
            "ID": "Wine"
        },
        "who": "NOT_MEMBERS"
        }
    },
    {
        "op": "add",
        "path": "/roles/12",
        "value": {
        "namespace": "France",
        "role": "ISSUER",
        "schema": {
            "ID": "Wine"
        },
        "who": "NOT_MEMBERS"
        }
    },
    {
        "op": "add",
        "path": "/roles/13",
        "value": {
        "namespace": "Spain",
        "role": "WITNESS",
        "schema": {
            "ID": "Wine"
        },
        "who": {
            "NAME": "SFO"
        }
        }
    },
    {
        "op": "add",
        "path": "/roles/14",
        "value": {
        "namespace": "Spain",
        "role": "APPROVER",
        "schema": {
            "ID": "Wine"
        },
        "who": {
            "NAME": "SFO"
        }
        }
    }
]
```
{{< /alert-details >}}


A continuación, invocaremos el método del contrato responsable de actualizar sus propiedades:

{{< alert-details type="info" title="Petición" summary="Pincha para ver la petición" >}}
```bash
curl --request POST 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Fact": {
            "subject_id": {{GOVERNANCE-ID}},
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "replace",
                            "path": "/roles/2/namespace",
                            "value": "Spain"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/3/namespace",
                            "value": "France"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/3/role",
                            "value": "CREATOR"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/3/schema/ID",
                            "value": "Wine"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/3/who/NAME",
                            "value": "PremiumWines"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/4/role",
                            "value": "APPROVER"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/5/role",
                            "value": "VALIDATOR"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/6/role",
                            "value": "EVALUATOR"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/6/schema/ID",
                            "value": "governance"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/7/namespace",
                            "value": "Spain"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/7/role",
                            "value": "WITNESS"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/7/who",
                            "value": {
                                "NAME": "WFO"
                            }
                        },
                        {
                            "op": "replace",
                            "path": "/roles/8/namespace",
                            "value": "France"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/8/who/NAME",
                            "value": "WFO"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/9/namespace",
                            "value": "Spain"
                        },
                        {
                            "op": "replace",
                            "path": "/roles/9/who/NAME",
                            "value": "WFO"
                        },
                        {
                            "op": "add",
                            "path": "/roles/10",
                            "value": {
                                "namespace": "France",
                                "role": "APPROVER",
                                "schema": {
                                    "ID": "Wine"
                                },
                                "who": {
                                    "NAME": "WFO"
                                }
                            }
                        },
                        {
                            "op": "add",
                            "path": "/roles/11",
                            "value": {
                                "namespace": "Spain",
                                "role": "ISSUER",
                                "schema": {
                                    "ID": "Wine"
                                },
                                "who": "NOT_MEMBERS"
                            }
                        },
                        {
                            "op": "add",
                            "path": "/roles/12",
                            "value": {
                                "namespace": "France",
                                "role": "ISSUER",
                                "schema": {
                                    "ID": "Wine"
                                },
                                "who": "NOT_MEMBERS"
                            }
                        },
                        {
                            "op": "add",
                            "path": "/roles/13",
                            "value": {
                                "namespace": "Spain",
                                "role": "WITNESS",
                                "schema": {
                                    "ID": "Wine"
                                },
                                "who": {
                                    "NAME": "SFO"
                                }
                            }
                        },
                        {
                            "op": "add",
                            "path": "/roles/14",
                            "value": {
                                "namespace": "Spain",
                                "role": "APPROVER",
                                "schema": {
                                    "ID": "Wine"
                                },
                                "who": {
                                    "NAME": "SFO"
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
{{< /alert-details >}}


Después de enviar la solicitud de actualización de gobernanza, recibiremos una notificación de aprobación. Para hacer esto, ejecute el siguiente comando:

```bash
curl --request GET 'http://localhost:3000/approval-requests?status=Pending'
```

Copie el valor del campo `id` de la notificación y solicite la aprobación de **WPO** y **WFO**:

```bash
curl --request PATCH 'http://localhost:3000/approval-requests/{{PREVIUS-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{"state": "RespondedAccepted"}'
```

```bash
curl --request PATCH 'http://localhost:3002/approval-requests/{{PREVIUS-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{"state": "RespondedAccepted"}'
```

Si todo salió bien, cuando ejecute el siguiente comando, el `sn` debería ser 7 y deberían mostrarse los cambios realizados anteriormente:

```bash 
curl --request GET 'http://localhost:3000/subjects?subject_type=governances'
```
{{< alert-details type="info" title="Gobernanza" summary="Pincha para ver la gobernanza" >}}
```json
{
    "subject_id": "{{GOVERNANCE-ID}}",
    "governance_id": "",
    "sn": 7,
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
            },
            {
                "id": "EaHFQQ0ADaLuRgQsIZxYNU8BAj_cBub7MZdpoZsRf-GY",
                "name": "SFO"
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
                "namespace": "Spain",
                "role": "CREATOR",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "PremiumWines"
                }
            },
            {
                "namespace": "France",
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
                "namespace": "Spain",
                "role": "WITNESS",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "WFO"
                }
            },
            {
                "namespace": "France",
                "role": "WITNESS",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "WFO"
                }
            },
            {
                "namespace": "Spain",
                "role": "APPROVER",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "WFO"
                }
            },
            {
                "namespace": "France",
                "role": "APPROVER",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "WFO"
                }
            },
            {
                "namespace": "Spain",
                "role": "ISSUER",
                "schema": {
                    "ID": "Wine"
                },
                "who": "NOT_MEMBERS"
            },
            {
                "namespace": "France",
                "role": "ISSUER",
                "schema": {
                    "ID": "Wine"
                },
                "who": "NOT_MEMBERS"
            },
            {
                "namespace": "Spain",
                "role": "WITNESS",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "SFO"
                }
            },
            {
                "namespace": "Spain",
                "role": "APPROVER",
                "schema": {
                    "ID": "Wine"
                },
                "who": {
                    "NAME": "SFO"
                }
            }
        ],
        "schemas": [
            {
                "contract": {
                    "raw": "dXNlIHRhcGxlX3NjX3J1c3QgYXMgc2RrOw0KdXNlIHNlcmRlOjp7RGVzZXJpYWxpemUsIFNlcmlhbGl6ZX07DQoNCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lLCBQYXJ0aWFsRXEpXSANCmVudW0gR3JhcGUgew0KICAgIENhYmVybmV0U2F1dmlnbm9uLA0KICAgIENoYXJkb25uYXksDQogICAgUGlub3ROb2lyLA0KfQ0KDQojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplLCBDbG9uZSldDQpzdHJ1Y3QgVGVtcGVyYXR1cmVDb250cm9sIHsNCiAgICBwdWIgbGFzdF9jaGVjazogdTMyLA0KICAgIHB1YiB0ZW1wZXJhdHVyZV9vazogYm9vbCwNCn0NCg0KI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSwgQ2xvbmUpXQ0Kc3RydWN0IFN0YXRlIHsNCiAgICBwdWIgaGFydmVzdDogdTMyLA0KICAgIHB1YiBncmFwZTogT3B0aW9uPEdyYXBlPiwNCiAgICBwdWIgb3JpZ2luOiBTdHJpbmcsDQogICAgcHViIG9yZ2FuaWNfY2VydGlmaWVkOiBPcHRpb248Ym9vbD4sDQogICAgcHViIHRlbXBlcmF0dXJlX2NvbnRyb2w6IFRlbXBlcmF0dXJlQ29udHJvbCwNCn0NCg0KI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSldDQplbnVtIFN0YXRlRXZlbnQgew0KICAgIEluaXQgew0KICAgICAgICBoYXJ2ZXN0OiB1MzIsDQogICAgICAgIGdyYXBlOiBTdHJpbmcsDQogICAgICAgIG9yaWdpbjogU3RyaW5nLA0KICAgIH0sDQogICAgVGVtcGVyYXR1cmVDb250cm9sIHsNCiAgICAgICAgdGVtcGVyYXR1cmU6IGYzMiwNCiAgICAgICAgdGltZXN0YW1wOiB1MzIsDQogICAgfSwNCiAgICBPcmdhbmljQ2VydGlmaWNhdGlvbiB7DQogICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2w6IGJvb2wsDQogICAgICAgIHBlc3RpY2lkZXNfY29udHJvbDogYm9vbCwNCiAgICAgICAgYW5hbHl0aWNzOiBib29sLA0KICAgICAgICBhZGRpdGlvbmFsX2luZm86IFN0cmluZywNCiAgICB9LA0KfQ0KDQpjb25zdCBURU1QRVJBVFVSRV9SQU5HRTogKGYzMiwgZjMyKSA9ICgxMC4wLCAxNi4wKTsNCg0KI1tub19tYW5nbGVdDQpwdWIgdW5zYWZlIGZuIG1haW5fZnVuY3Rpb24oc3RhdGVfcHRyOiBpMzIsIGV2ZW50X3B0cjogaTMyLCBpc19vd25lcjogaTMyKSAtPiB1MzIgew0KICAgIHNkazo6ZXhlY3V0ZV9jb250cmFjdChzdGF0ZV9wdHIsIGV2ZW50X3B0ciwgaXNfb3duZXIsIGNvbnRyYWN0X2xvZ2ljKQ0KfQ0KDQpmbiBjb250cmFjdF9sb2dpYygNCiAgICBjb250ZXh0OiAmc2RrOjpDb250ZXh0PFN0YXRlLCBTdGF0ZUV2ZW50PiwNCiAgICBjb250cmFjdF9yZXN1bHQ6ICZtdXQgc2RrOjpDb250cmFjdFJlc3VsdDxTdGF0ZT4sDQopIHsNCiAgICBsZXQgc3RhdGUgPSAmbXV0IGNvbnRyYWN0X3Jlc3VsdC5maW5hbF9zdGF0ZTsNCiAgICBtYXRjaCAmY29udGV4dC5ldmVudCB7DQogICAgICAgIFN0YXRlRXZlbnQ6OkluaXQgew0KICAgICAgICAgICAgaGFydmVzdCwNCiAgICAgICAgICAgIGdyYXBlLA0KICAgICAgICAgICAgb3JpZ2luLA0KICAgICAgICB9ID0+IHsNCiAgICAgICAgICAgIGlmIGNvbnRleHQuaXNfb3duZXIgJiYgIWNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7DQogICAgICAgICAgICAgICAgbGV0IGdyYXBlID0gbWF0Y2ggZ3JhcGUuYXNfc3RyKCkgew0KICAgICAgICAgICAgICAgICAgICAiQ2FiZXJuZXRTYXV2aWdub24iID0+IFNvbWUoR3JhcGU6OkNhYmVybmV0U2F1dmlnbm9uKSwNCiAgICAgICAgICAgICAgICAgICAgIkNoYXJkb25uYXkiID0+IFNvbWUoR3JhcGU6OkNoYXJkb25uYXkpLA0KICAgICAgICAgICAgICAgICAgICAiUGlub3ROb2lyIiA9PiBTb21lKEdyYXBlOjpQaW5vdE5vaXIpLA0KICAgICAgICAgICAgICAgICAgICBfID0+IE5vbmUsDQogICAgICAgICAgICAgICAgfTsNCiAgICAgICAgICAgICAgICBpZiBncmFwZS5pc19zb21lKCkgew0KICAgICAgICAgICAgICAgICAgICBzdGF0ZS5oYXJ2ZXN0ID0gKmhhcnZlc3Q7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLmdyYXBlID0gZ3JhcGU7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yaWdpbiA9IG9yaWdpbi50b19zdHJpbmcoKTsNCiAgICAgICAgICAgICAgICAgICAgY29udHJhY3RfcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlOw0KICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgIH0NCiAgICAgICAgfQ0KICAgICAgICBTdGF0ZUV2ZW50OjpUZW1wZXJhdHVyZUNvbnRyb2wgew0KICAgICAgICAgICAgdGVtcGVyYXR1cmUsDQogICAgICAgICAgICB0aW1lc3RhbXAsDQogICAgICAgIH0gPT4gew0KICAgICAgICAgICAgaWYgY29udGV4dC5pc19vd25lciAmJiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkgew0KICAgICAgICAgICAgICAgIGlmIGNoZWNrX3RlbXBlcmF0dXJlX2luX3JhbmdlKCp0ZW1wZXJhdHVyZSkNCiAgICAgICAgICAgICAgICAgICAgJiYgc3RhdGUudGVtcGVyYXR1cmVfY29udHJvbC50ZW1wZXJhdHVyZV9vaw0KICAgICAgICAgICAgICAgIHsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmVfY29udHJvbC5sYXN0X2NoZWNrID0gKnRpbWVzdGFtcDsNCiAgICAgICAgICAgICAgICB9IGVsc2Ugew0KICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLnRlbXBlcmF0dXJlX29rID0gZmFsc2U7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlX2NvbnRyb2wubGFzdF9jaGVjayA9ICp0aW1lc3RhbXA7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5zdWNjZXNzID0gdHJ1ZTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfQ0KICAgICAgICBTdGF0ZUV2ZW50OjpPcmdhbmljQ2VydGlmaWNhdGlvbiB7DQogICAgICAgICAgICBmZXJ0aWxpemVyc19jb250cm9sLA0KICAgICAgICAgICAgcGVzdGljaWRlc19jb250cm9sLA0KICAgICAgICAgICAgYW5hbHl0aWNzLA0KICAgICAgICAgICAgYWRkaXRpb25hbF9pbmZvLA0KICAgICAgICB9ID0+IHsNCiAgICAgICAgICAgIGlmIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7DQogICAgICAgICAgICAgICAgbWF0Y2ggc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgew0KICAgICAgICAgICAgICAgICAgICBTb21lKG9yZ2FuaWNfY2VyaWZpZWQpID0+IHsNCiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9yZ2FuaWNfY2VyaWZpZWQNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAhY2hlY2tfaXNfb3JnYW5pYygNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKmZlcnRpbGl6ZXJzX2NvbnRyb2wsDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpwZXN0aWNpZGVzX2NvbnRyb2wsDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICphbmFseXRpY3MsDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgKQ0KICAgICAgICAgICAgICAgICAgICAgICAgew0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yZ2FuaWNfY2VydGlmaWVkID0gU29tZShmYWxzZSk7DQogICAgICAgICAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICAgICAgTm9uZSA9PiB7DQogICAgICAgICAgICAgICAgICAgICAgICBpZiBjaGVja19pc19vcmdhbmljKCpmZXJ0aWxpemVyc19jb250cm9sLCAqcGVzdGljaWRlc19jb250cm9sLCAqYW5hbHl0aWNzKSB7DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKHRydWUpOw0KICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCA9IFNvbWUoZmFsc2UpOw0KICAgICAgICAgICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5hcHByb3ZhbF9yZXF1aXJlZCA9IHRydWU7DQogICAgICAgICAgICAgICAgY29udHJhY3RfcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgfQ0KfQ0KDQpmbiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZTogJlN0YXRlKSAtPiBib29sIHsNCiAgICBsZXQgaW5pdGlhbF9ncmFwZSA9IG1hdGNoIHN0YXRlLmdyYXBlIHsNCiAgICAgICAgU29tZShfKSA9PiBmYWxzZSwNCiAgICAgICAgTm9uZSA9PiB0cnVlLA0KICAgIH07DQogICAgaWYgc3RhdGUuaGFydmVzdCA9PSAwICYmIGluaXRpYWxfZ3JhcGUgJiYgc3RhdGUub3JpZ2luID09IGZvcm1hdCEoIiIpIHsNCiAgICAgICAgcmV0dXJuIGZhbHNlOw0KICAgIH0NCiAgICByZXR1cm4gdHJ1ZTsNCn0NCg0KZm4gY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UodGVtcGVyYXR1cmU6IGYzMikgLT4gYm9vbCB7DQogICAgaWYgdGVtcGVyYXR1cmUgPj0gVEVNUEVSQVRVUkVfUkFOR0UuMCAmJiB0ZW1wZXJhdHVyZSA8PSBURU1QRVJBVFVSRV9SQU5HRS4xIHsNCiAgICAgICAgcmV0dXJuIHRydWU7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0NCg0KZm4gY2hlY2tfaXNfb3JnYW5pYyhmZXJ0aWxpemVyc19jb250cm9sOiBib29sLCBwZXN0aWNpZGVzX2NvbnRyb2w6IGJvb2wsIGFuYWx5dGljczogYm9vbCkgLT4gYm9vbCB7DQogICAgaWYgZmVydGlsaXplcnNfY29udHJvbCAmJiBwZXN0aWNpZGVzX2NvbnRyb2wgJiYgYW5hbHl0aWNzIHsNCiAgICAgICAgcmV0dXJuIHRydWU7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0="
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


Una vez implementada la segmentación del *namespace*, realizaremos pruebas para verificar su correcto funcionamiento.

Creemos una botella de vino francés usando el siguiente comando:

```bash
curl --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Create": {
        "governance_id": {{GOVERNANCE-ID}},
        "schema_id": "Wine",
        "namespace": "France",
        "name": "Wine"
        }
    }
}'
```
Cuando realices esta acción, recibirás un `request-id`, que deberás copiar y usar en el siguiente comando:

```bash
curl --request GET 'http://localhost:3001/event-requests/{{REQUEST-ID}}/state'
```

Este último comando te dará una respuesta similar a la siguiente:

```json
{
    "id": "{{REQUEST-ID}}",
    "subject_id": "{{SUBJECT-ID}}",
    "sn": 0,
    "state": "finished",
    "success": true
}
```
{{< alert type="warning" title="CAUTION">}}
Guarde el `subject_id` del **sujeto**, ya que lo necesitará para los pasos posteriores del tutorial.
{{< /alert >}}

Para comprobar nuestra nueva botella de vino, ejecute el siguiente comando:

```bash
curl --request GET 'http://localhost:3001/subjects/{{SUBJECT-ID}}'
```

```json
{
    "subject_id": "{{SUBJECT-ID}}",
    "governance_id": "{{GOVERNANCE-ID}}",
    "sn": 0,
    "public_key": "E5DkRaljajwUZ1HrpgdkIxdTu0fbrg-nqoBJFHqm6GJY",
    "namespace": "France",
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

Pero si ejecutamos:

```bash
curl --request GET 'http://localhost:3000/subjects/{{SUBJECT-ID}}'
```

Obtenemos un error 404 debido a la segmentación que hemos aplicado cambiando el espacio de nombres, que determina quiénes son los testigos del sujeto.


Inicialice la botella antes de probar la emisión del evento de certificación:

```bash
curl --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Fact": {
            "subject_id": {{SUBJECT-ID}},
            "payload": {
                "Init": {
                    "harvest": 2,
                    "grape": "Chardonnay",
                    "origin": "france"
                }
            }
        }
    }
}'
```

Ahora, cuando ejecute la consulta de sujeto nuevamente, debería tener un valor `sn` de 1 y mostrar la información mencionada anteriormente:

```bash
curl --request GET 'http://localhost:3001/subjects/{{SUBJECT-ID}}'
```

```json
{
    "subject_id": "{{SUBJECT-ID}}",
    "governance_id": "{{GOVERNANCE-ID}}",
    "sn": 1,
    "public_key": "E5DkRaljajwUZ1HrpgdkIxdTu0fbrg-nqoBJFHqm6GJY",
    "namespace": "France",
    "name": "Wine",
    "schema_id": "Wine",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "grape": "Chardonnay",
        "harvest": 2,
        "organic_certified": null,
        "origin": "france",
        "temperature_control": {
            "last_check": 0,
            "temperature_ok": true
        }
    },
    "active": true
}
```

Probaremos la emisión del evento de certificación. Para ello generaremos la firma del evento que queremos emitir usando [kore-Sign](../../../docs/learn/tools/), con el siguiente formato, reemplazando `subject_id` por el identificador de nuestro sujeto vino:

```bash
kore-sign 'f855c6736463a65f515afe7b85d1418c096ed73852b42bbe4c332eb43d532326' '{"Fact":{"subject_id":"{{SUBJECT-ID}}","payload":{"OrganicCertification":{"fertilizers_control":false,"pesticides_control":false,"analytics":false,"additional_info":"test"}}}}'
```

El resultado de esta ejecución se incluirá en la siguiente solicitud:

```bash
curl --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw {{SIGN-RESULT}}
```

Esto nos dará un resultado similar al siguiente:

```bash
curl --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Fact": {
        "subject_id": {{SUBJECT-ID}},
        "payload": {
            "OrganicCertification": {
            "additional_info": "test",
            "analytics": false,
            "fertilizers_control": false,
            "pesticides_control": false
            }
        }
        }
    },
    "signature": {
        "signer": "EzzmRjc8CtjzHu3MKmuTgnmOTgrJlYZj1D2DCZ9nN7Vk",
        "timestamp": 1689858060412988735,
        "value": "SEiF6C6zhFxzxs56nY6vk4ySTl7zvpV2gExTiiGlbxKI-HVvizL6eYmjV9IjE8GJMzOIQkok8rUehRVK9cNgSfCg"
    }
}'
```

Si la segmentación se ha aplicado correctamente, el mensaje de aprobación para este sujeto solo debería haberlo recibido **WFO**. Para comprobarlo, ejecute el siguiente comando:

```bash
curl --request GET 'http://localhost:3002/approval-requests?status=pending'
```

Copie su `id` y utilícelo para aceptarlo con la siguiente solicitud:

```bash
curl --request PATCH 'http://localhost:3002/approval-requests/{{PREVIUS-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{"state": "RespondedAccepted"}'
```

Ahora, cuando vuelvas a consultar el asunto, debería mostrar un valor `sn` de 2, y el campo `organic_certified` debería ser `false`:

```bash
curl --request GET 'http://localhost:3001/subjects?subject_type=all&governanceid={{GOVERNANCE-ID}}'
```

```json
{
    "subject_id": "{{SUBJECT_ID}}",
    "governance_id": "{{GOVERNANCE-ID}}",
    "sn": 2,
    "public_key": "E5DkRaljajwUZ1HrpgdkIxdTu0fbrg-nqoBJFHqm6GJY",
    "namespace": "France",
    "name": "Wine",
    "schema_id": "Wine",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "grape": "Chardonnay",
        "harvest": 2,
        "organic_certified": false,
        "origin": "france",
        "temperature_control": {
            "last_check": 0,
            "temperature_ok": true
        }
    },
    "active": true
}
```