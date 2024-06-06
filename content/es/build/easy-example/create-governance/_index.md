---
title: Creando la gobernanza
description: Pasos para crear una gobernanza
weight: 2
---

Ahora que hemos podido lanzar nuestro primer nodo, lo primero que debemos hacer para que sea útil es crear una [gobernanza](../../../docs/getting-started/concepts/governance/). Las gobernanzas son sujetos especiales que definen las reglas del caso de uso en cuestión. Sin gobernanza no puede haber sujetos. Tanto su [esquema como su contrato](../../../docs/learn/governance/schema/) están fijos y definidos en el código de kore. Lo mismo ocurre con su [estructura](../../../docs/learn/governance/structure/).

Un aspecto interesante de la API kore-http son las diferentes posibilidades para utilizar el punto final de envío de solicitudes de eventos. La forma más ortodoxa sería incluir la solicitud y la firma de la misma. Para ello, se puede utilizar kore-sign (incluido en [kore-tools](../../../docs/learn/tools/)) para firmar la solicitud. Pero también se puede omitir la firma en el cuerpo de la solicitud y que el cliente la firme con nuestra propia clave privada. Obviamente, esto no se puede hacer para **invocaciones externas** donde el firmante no es el propietario del nodo. Otro cambio destinado a aumentar la simplicidad de los eventos de Génesis/Creación es que la clave pública se puede omitir del cuerpo y el cliente creará una para nosotros. En general, antes de crear un sujeto, debes llamar a la API de creación de material criptográfico para generar un par de claves **/keys** y el método **POST**. Esta API devuelve el valor de la clave pública del KeyPair para incluirlo en los eventos [Create](../../../docs/getting-started/concepts/events/) y [Transfer](../../../docs/getting-started/concepts/events/).

Para hacer esto, debemos lanzar una solicitud de evento usando la API kore-http. El punto final que debemos usar es **/event-requests** y el método es **POST**. Este endpoint admite diferentes configuraciones para hacer la vida más fácil al usuario:

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
curl --silent --location 'http://localhost:3000/event-requests' \
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

La respuesta que obtenemos al iniciar la solicitud de evento es la identificación de la solicitud en sí. Si queremos saber cuál terminó siendo el **SubjectId** de la gobernanza, debemos consultar el endpoint **/event-requests/{id}** y el método **GET**. La respuesta a este punto final devuelve información sobre la solicitud que incluye el **SubjectId** de la gobernanza.

```bash
curl --silent 'http://127.0.0.1:3000/event-requests/{request_id}/state'
```

Response:

```json
{
    "id": "Jr4kWJOgdIhdtUMTqyLbu676-k8-eVCd8VQ9ZmLWpSdg",
    "subject_id": "{{GOVERNANCE-ID}}",
    "sn": 0,
    "state": "finished",
    "success": true
}
```

También podemos solicitar la lista de sujetos en **/subjects** usando el método **GET**. En este caso, obtendremos una lista de los sujetos que tenemos en el nodo, en este caso, solo tendremos la gobernanza que acabamos de crear.

Siendo nosotros dueños del sujeto, se puede decir que somos testigos del mismo. El único rol que se define por defecto en el estado inicial de la gobernanza es el que hace que todos los miembros de la gobernanza sean testigos de ella, pero en el caso de los miembros, viene vacío. En el siguiente paso, nos agregaremos como miembros de la gobernanza. Esto se debe a que el estado inicial no tiene miembros y, para participar activamente en el caso de uso, debemos agregarnos como miembros. Aunque este paso no es obligatorio, depende del caso de uso.

El punto final a utilizar es el mismo que para la creación, pero el tipo de evento será [FACT](../../../docs/getting-started/concepts/events/):

Debemos obtener nuestro controller_id que nos permitira añadirnos como mienbro de la gobernanza
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
                    "path": "/members/0",
                    "value": {
                    "id": "{{CONTROLER_ID}}",
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
                            "path": "/members/0",
                            "value": {
                                "id": "{{CONTROLER-ID}}",
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

Reemplace **{{GOVERNANCE-ID}}** con el **SubjectId** de la gobernanza que hemos creado. La identificación de nuestro usuario que obtenemos cuando usamos kore-keygen en el paso anterior. Es nuestro KeyIdentifier, que identifica nuestra clave pública. El método Patch es el único que actualmente contiene el contrato de gobernanza y simplemente aplica un JSON Patch a su estado. Este método requiere la fase de [Aprobación](../../../docs/getting-started/advanced/approval/).

Como mencionamos anteriormente, el creador será el firmante en todas las fases si no hay nadie más definido, por lo que para este evento 1 seremos el [Evaluador](../../../docs/getting-started/advanced/evaluation/), [Aprobador](../../../docs/getting-started/advanced/approval/) y [Validador](../../../docs/getting-started/advanced/validation/). La evaluación y validación funcionan automáticamente, pero la parte de aprobación requiere la intervención del usuario a través de la API (siempre que la variable de entorno que aprueba automáticamente no esté definida).

Para esto, primero debemos solicitar aprobaciones pendientes en **/approval-requests?status=pending** usando un **GET**.

```bash
curl --silent 'http://localhost:3000/approval-requests?status=pending'
```
{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
[
  {
    "id": "JML9VyFOj1RFXyKIFJ2thrjTW4dLqXGVqyc2Mp0kP09I",
    "request": {
      "event_request": {
        "request": {
          "Fact": {
            "subject_id": "JOr89GSpZjTSj2xZePOti6TfXqIXHKs0-ToAgKwZM1fY",
            "payload": {
              "Patch": {
                "data": [
                  {
                    "op": "add",
                    "path": "/members/0",
                    "value": {
                      "id": "E_Ow2wyliSI10ZJK_Le4a3IAcEq_noape3FoaCMVSpjY",
                      "name": "EasyTutorial"
                    }
                  }
                ]
              }
            }
          }
        },
        "signature": {
          "signer": "E_Ow2wyliSI10ZJK_Le4a3IAcEq_noape3FoaCMVSpjY",
          "timestamp": 1717499584964154960,
          "value": "SE_zchgZxQYJDzB2kKnTdNNJhiUh1w0i9FjKp2sTEyZL4FWCa-zTbL_P3xVswZomfGkHQ9ZRE2r0CV3cnQTZr-Ag",
          "content_hash": "J6r2y9PEHQelSMbi0H0ceqFVFWpojaxtzSJqdDG7NWqg"
        }
      },
      "sn": 1,
      "gov_version": 0,
      "patch": [
        {
          "op": "add",
          "path": "/members/0",
          "value": {
            "id": "E_Ow2wyliSI10ZJK_Le4a3IAcEq_noape3FoaCMVSpjY",
            "name": "EasyTutorial"
          }
        }
      ],
      "state_hash": "JUlKjMRsOTevGieg0KPUhnW5bCKFrkwqn-XYQOUuLpkc",
      "hash_prev_event": "JwMmVz523CpLyHfh3SnEKS4EAX-zpxPQbPih2nYXih2I",
      "signature": {
        "signer": "EuL_u9__HNKlUuJ8nNjXdsWkZI-DWF5R7U8US9QDu540",
        "timestamp": 1717499584977029335,
        "value": "SEIoIr5RCqCY-fQpn__c_TcwgcaUI6pMUJoSaHD1am29_Q0vEHAqSbRiWJce0lWPxSZhXlfQAgT-TASdJAuok_Cg",
        "content_hash": "JDJENFuKvR-XJCFCFwqPUg14RGdSgXFPxF2_RCwjx_6E"
      }
    },
    "reponse": null,
    "state": "Pending"
  }
]
```
{{< /alert-details >}}


El id de la respuesta json es lo que debemos utilizar para aprobarla. En **/approval-requests/{id}** usando un **PATCH**, agregaremos la identificación recibida para emitir el voto. Como en nuestro caso, queremos aprobarlo, el cuerpo debería ser:

```json
{"state": "RespondedAccepted"}
```
```bash
curl --silent --request PATCH 'http://localhost:3000/approval-requests/{{REQUEST-ID}}' \
--header 'Content-Type: application/json' \
--data '{"state": "RespondedAccepted"}'
```

{{< alert-details type="info" title="Respuesta" summary="Pincha para ver la respuesta" >}}
```json
{
  "id": "JML9VyFOj1RFXyKIFJ2thrjTW4dLqXGVqyc2Mp0kP09I",
  "request": {
    "event_request": {
      "request": {
        "Fact": {
          "subject_id": "JOr89GSpZjTSj2xZePOti6TfXqIXHKs0-ToAgKwZM1fY",
          "payload": {
            "Patch": {
              "data": [
                {
                  "op": "add",
                  "path": "/members/0",
                  "value": {
                    "id": "E_Ow2wyliSI10ZJK_Le4a3IAcEq_noape3FoaCMVSpjY",
                    "name": "EasyTutorial"
                  }
                }
              ]
            }
          }
        }
      },
      "signature": {
        "signer": "E_Ow2wyliSI10ZJK_Le4a3IAcEq_noape3FoaCMVSpjY",
        "timestamp": 1717499584964154960,
        "value": "SE_zchgZxQYJDzB2kKnTdNNJhiUh1w0i9FjKp2sTEyZL4FWCa-zTbL_P3xVswZomfGkHQ9ZRE2r0CV3cnQTZr-Ag",
        "content_hash": "J6r2y9PEHQelSMbi0H0ceqFVFWpojaxtzSJqdDG7NWqg"
      }
    },
    "sn": 1,
    "gov_version": 0,
    "patch": [
      {
        "op": "add",
        "path": "/members/0",
        "value": {
          "id": "E_Ow2wyliSI10ZJK_Le4a3IAcEq_noape3FoaCMVSpjY",
          "name": "EasyTutorial"
        }
      }
    ],
    "state_hash": "JUlKjMRsOTevGieg0KPUhnW5bCKFrkwqn-XYQOUuLpkc",
    "hash_prev_event": "JwMmVz523CpLyHfh3SnEKS4EAX-zpxPQbPih2nYXih2I",
    "signature": {
      "signer": "EuL_u9__HNKlUuJ8nNjXdsWkZI-DWF5R7U8US9QDu540",
      "timestamp": 1717499584977029335,
      "value": "SEIoIr5RCqCY-fQpn__c_TcwgcaUI6pMUJoSaHD1am29_Q0vEHAqSbRiWJce0lWPxSZhXlfQAgT-TASdJAuok_Cg",
      "content_hash": "JDJENFuKvR-XJCFCFwqPUg14RGdSgXFPxF2_RCwjx_6E"
    }
  },
  "reponse": {
    "appr_req_hash": "JML9VyFOj1RFXyKIFJ2thrjTW4dLqXGVqyc2Mp0kP09I",
    "approved": true,
    "signature": {
      "signer": "E_Ow2wyliSI10ZJK_Le4a3IAcEq_noape3FoaCMVSpjY",
      "timestamp": 1717499998706356846,
      "value": "SEIoUgD1DSoUBYTwOCZi72ceDxZ2Qk_KVtiFLlKrjNheLaMMczp9gQtI2R4YI_dpJWn31k0o3G1fh0Dke_sEqQCw",
      "content_hash": "JaWZeWV3SzjoGBK1KVFIiVzyoGCebjJxsaKD34CZABBQ"
    }
  },
  "state": "RespondedAccepted"
}
```
{{< /alert-details >}}

Podemos observar que el state de la respuesta ha pasado de `null` a `Responded`. Indicando asi que hemos respondido el evento de Fact en la gobernanza.Además si obtenemos el estado de la request-id veremos que el estado es `Finished`.