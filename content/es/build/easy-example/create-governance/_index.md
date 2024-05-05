---
title: Creando la gobernanza
description: Pasos para crear una gobernanza
weight: 2
---

Ahora que hemos podido lanzar nuestro primer nodo, lo primero que debemos hacer para que sea útil es crear una [gobernanza](../../../docs/getting-started/concepts/governance/_index.md). Las gobernanzas son sujetos especiales que definen las reglas del caso de uso en cuestión. Sin gobernanza no puede haber sujetos. Tanto su [esquema como su contrato](../../../docs/learn/Governance/schema/_index.md) están fijos y definidos en el código de kore. Lo mismo ocurre con su [estructura](../../../docs/learn/Governance/structure/_index.md).

Un aspecto interesante de la API kore-client son las diferentes posibilidades para utilizar el punto final de envío de solicitudes de eventos. La forma más ortodoxa sería incluir la solicitud y la firma de la misma. Para ello, se puede utilizar kore-sign (incluido en [kore-tools](../../../docs/learn/tools/_index.md)) para firmar la solicitud. Pero también se puede omitir la firma en el cuerpo de la solicitud y que el cliente la firme con nuestra propia clave privada. Obviamente, esto no se puede hacer para **invocaciones externas** donde el firmante no es el propietario del nodo. Otro cambio destinado a aumentar la simplicidad de los eventos de Génesis/Creación es que la clave pública se puede omitir del cuerpo y el cliente creará una para nosotros. En general, antes de crear un sujeto, debes llamar a la API de creación de material criptográfico para generar un par de claves **/api/keys** y el método **POST**. Esta API devuelve el valor de la clave pública del KeyPair para incluirlo en los eventos [Create](../../../docs/getting-started/concepts/events/_index.md#tipos-de-eventos) y [Transfer](../../../docs/getting-started/concepts/events/_index.md#tipos-de-eventos).

Para hacer esto, debemos lanzar una solicitud de evento usando la API kore-client. El punto final que debemos usar es **/api/event-requests** y el método es **POST**. Este endpoint admite diferentes configuraciones para hacer la vida más fácil al usuario:

Entonces, si optamos por la tercera vía, el cuerpo de la solicitud post que crea la gobernanza quedaría así:

```json
{
  "request": {
    "Create": {
      "governance_id": "",
      "schema_id": "governance",
      "namespace": "",
      "name": "EasyTutorial"
    }
  }
}
```
```bash
curl --silent --location 'http://localhost:3000/api/event-requests' \
--header 'Content-Type: application/json' \
--data '{
  "request": {
    "Create": {
      "governance_id": "",
      "schema_id": "governance",
      "namespace": "",
      "name": "tutorial"
    }
  }
}'
```

La respuesta que obtenemos al iniciar la solicitud de evento es la identificación de la solicitud en sí. Si queremos saber cuál terminó siendo el **SubjectId** de la gobernanza, debemos consultar el endpoint **/api/event-requests/{id}** y el método **GET**. La respuesta a este punto final devuelve información sobre la solicitud que incluye el **SubjectId** de la gobernanza.

```bash
curl --silent 'http://127.0.0.1:3000/api/event-requests/Jr4kWJOgdIhdtUMTqyLbu676-k8-eVCd8VQ9ZmLWpSdg/state'
```

Response:

```json
{
    "id": "Jr4kWJOgdIhdtUMTqyLbu676-k8-eVCd8VQ9ZmLWpSdg",
    "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
    "sn": 0,
    "state": "finished",
    "success": true
}
```

También podemos solicitar la lista de sujetos en **/api/subjects** usando el método **GET**. En este caso, obtendremos una lista de los sujetos que tenemos en el nodo, en este caso, solo tendremos la gobernanza que acabamos de crear.

Siendo nosotros dueños del sujeto, se puede decir que somos testigos del mismo. El único rol que se define por defecto en el estado inicial de la gobernanza es el que hace que todos los miembros de la gobernanza sean testigos de ella, pero en el caso de los miembros, viene vacío. En el siguiente paso, nos agregaremos como miembros de la gobernanza. Esto se debe a que el estado inicial no tiene miembros y, para participar activamente en el caso de uso, debemos agregarnos como miembros. Aunque este paso no es obligatorio, depende del caso de uso.

El punto final a utilizar es el mismo que para la creación, pero el tipo de evento será [FACT](../../../docs/getting-started/concepts/events/_index.md#tipos-de-eventos):

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
                    "path": "/members/0",
                    "value": {
                    "id": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                    "name": "EasyTutorial"
                    }
                }
            ]
          }
      }
    }
  }
}
```

```bash
curl --silent 'http://localhost:3000/api/event-requests' \
--header 'Content-Type: application/json' \
--data '{
    "request": {
        "Fact": {
            "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/0",
                            "value": {
                                "id": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                                "name": "EasyTutorial"
                            }
                        }
                    ]
                }
            }
        }
    }
}'
```

Reemplace **{{GOVERNANCE-ID}}** con el **SubjectId** de la gobernanza que hemos creado. La identificación de nuestro usuario que obtenemos cuando usamos kore-keygen en el paso anterior. Es nuestro KeyIdentifier, que identifica nuestra clave pública. El método Patch es el único que actualmente contiene el contrato de gobernanza y simplemente aplica un JSON Patch a su estado. Este método requiere la fase de [Aprobación](../../../docs/getting-started/advanced/approval/_index.md).

Como mencionamos anteriormente, el creador será el firmante en todas las fases si no hay nadie más definido, por lo que para este evento 1 seremos el [Evaluador](../../../docs/getting-started/advanced/evaluation/_index.md), [Aprobador](../../../docs/getting-started/advanced/approval/_index.md) y [Validador](../../../docs/getting-started/advanced/validation/_index.md). La evaluación y validación funcionan automáticamente, pero la parte de aprobación requiere la intervención del usuario a través de la API (siempre que la variable de entorno que aprueba automáticamente no esté definida).

Para esto, primero debemos solicitar aprobaciones pendientes en **/api/approval-requests?status=pending** usando un **GET**.

```bash
curl --silent 'http://localhost:3000/api/approval-requests?status=pending'
```
{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
[
    {
        "id": "JYHOLieD0u6Q-GjURtjZ_JAXDgP6h87fMB9h2FiYk1OQ",
        "request": {
            "event_request": {
                "Fact": {
                    "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
                    "payload": {
                        "Patch": {
                            "data": [
                                {
                                    "op": "add",
                                    "path": "/members/0",
                                    "value": {
                                        "id": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                                        "name": "Tutorial1"
                                    }
                                }
                            ]
                        }
                    }
                },
                "signature": {
                    "signer": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                    "timestamp": 1689758738346603498,
                    "value": "SEUhyEBzC8cXdmqORBLXtgyYuFh3zXFywBVjRnGvU70nLdjs5blDDUiUla4IaiOWqcBPt5U89vfoDFa-V-5QjDCw"
                }
            },
            "sn": 1,
            "gov_version": 0,
            "patch": [
                {
                    "op": "add",
                    "path": "/members/0",
                    "value": {
                        "id": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                        "name": "Tutorial1"
                    }
                }
            ],
            "state_hash": "J9ZorCKUeboco5eBZeW_NYssO3ZYLu2Ano_tThl8_Fss",
            "hash_prev_event": "Jg-2hzd0QEdqDdtRqe_ITljdbTWKPYSl1hO1XyrgwM8A",
            "signature": {
                "signer": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
                "timestamp": 1689758738381216200,
                "value": "SE1GJs9v-OFtsveJQWi0HYRfkT4LkPCdu_7H_BUaTLg2Dpt5bTTBR8zLt6TiSbohsI0kdyQeOrYMHFxIRbKovYDg"
            }
        },
        "reponse": null,
        "state": "Pending"
    }
]
```
{{< /alert-details >}}


El id de la respuesta json es lo que debemos utilizar para aprobarla. En **/api/approval-requests/{id}** usando un **PATCH**, agregaremos la identificación recibida para emitir el voto. Como en nuestro caso, queremos aprobarlo, el cuerpo debería ser:

```json
{"state": "RespondedAccepted"}
```
```bash
curl --silent --request PATCH 'http://localhost:3000/api/approval-requests/JYHOLieD0u6Q-GjURtjZ_JAXDgP6h87fMB9h2FiYk1OQ' \
--header 'Content-Type: application/json' \
--data '{"state": "RespondedAccepted"}'
```

{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
{
    "id": "JYHOLieD0u6Q-GjURtjZ_JAXDgP6h87fMB9h2FiYk1OQ",
    "request": {
        "event_request": {
            "Fact": {
                "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
                "payload": {
                    "Patch": {
                        "data": [
                            {
                                "op": "add",
                                "path": "/members/0",
                                "value": {
                                    "id": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                                    "name": "Tutorial1"
                                }
                            }
                        ]
                    }
                }
            },
            "signature": {
                "signer": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                "timestamp": 1689758738346603498,
                "value": "SEUhyEBzC8cXdmqORBLXtgyYuFh3zXFywBVjRnGvU70nLdjs5blDDUiUla4IaiOWqcBPt5U89vfoDFa-V-5QjDCw"
            }
        },
        "sn": 1,
        "gov_version": 0,
        "patch": [
            {
                "op": "add",
                "path": "/members/0",
                "value": {
                    "id": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                    "name": "Tutorial1"
                }
            }
        ],
        "state_hash": "J9ZorCKUeboco5eBZeW_NYssO3ZYLu2Ano_tThl8_Fss",
        "hash_prev_event": "Jg-2hzd0QEdqDdtRqe_ITljdbTWKPYSl1hO1XyrgwM8A",
        "signature": {
            "signer": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
            "timestamp": 1689758738381216200,
            "value": "SE1GJs9v-OFtsveJQWi0HYRfkT4LkPCdu_7H_BUaTLg2Dpt5bTTBR8zLt6TiSbohsI0kdyQeOrYMHFxIRbKovYDg"
        }
    },
    "reponse": {
        "appr_req_hash": "JYHOLieD0u6Q-GjURtjZ_JAXDgP6h87fMB9h2FiYk1OQ",
        "approved": true,
        "signature": {
            "signer": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
            "timestamp": 1689758795610296081,
            "value": "SE34M3kRw9Uj2V_FaDq5Kz4h_8HSbkAiaH40XxpcPleLPJ_CnNbVso6L4GkdNNF2othwlDzTzk3BqyzyKlpIVDCg"
        }
    },
    "state": "Responded"
}
```
{{< /alert-details >}}

Podemos observar que el state de la respuesta ha pasado de `null` a `Responded`. Indicando asi que hemos respondido el evento de Fact en la gobernanza.