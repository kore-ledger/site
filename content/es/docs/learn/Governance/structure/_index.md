---
title: Estructura de la gobernanza
linkTitle: Estructura
date: 2024-04-26
weight: 1
description: Estructura que conforma una gobernanza.
---

En esta página describiremos la estructura y configuración de gobierno. Si desea saber más sobre qué es una gobernanza visite la página [Gobernanza](../../../getting-started/concepts/governance/).

{{< alert-details type="info" title="GOVERNANZA DE EJEMPLO" summary="Haga clic para ver un ejemplo de gobernanza completo. Cada sección se analizará por separado en las siguientes secciones." >}}
```rust
{
"members": [
  {
    "name": "Company1",
    "id": "ED8MpwKh3OjPEw_hQdqJixrXlKzpVzdvHf2DqrPvdz7Y"
  },
  {
    "name": "Company2",
    "id": "EXjEOmKsvlXvQdEz1Z6uuDO_zJJ8LNDuPi6qPGuAwePU"
  }
],
"schemas": [
  {
    "id": "Test",
    "schema": {
      "type": "object",
      "additionalProperties": false,
      "required": ["temperature", "location"],
      "properties": {
        "temperatura": {
          "type": "integer"
        },
        "localizacion": {
          "type": "string"
        }
      }
    },
    "initial_value": {
      "temperatura": 0,
      "localizacion": ""
    },
    "contract": {
      "raw": "dXNlIHNlcmRlOjp7U2VyaWFsaXplLCBEZXNlcmlhbGl6ZX07Cgptb2Qgc2RrOwoKI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSwgQ2xvbmUpXQpzdHJ1Y3QgU3RhdGUgewogIHB1YiBvbmU6IHUzMiwKICBwdWIgdHdvOiB1MzIsCiAgcHViIHRocmVlOiB1MzIKfQoKI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSldCmVudW0gU3RhdGVFdmVudCB7CiAgTW9kT25lIHsgZGF0YTogdTMyIH0sCiAgTW9kVHdvIHsgZGF0YTogdTMyIH0sCiAgTW9kVGhyZWUgeyBkYXRhOiB1MzIgfSwKICBNb2RBbGwgeyBvbmU6IHUzMiwgdHdvOiB1MzIsIHRocmVlOiB1MzIgfQp9CgojW25vX21hbmdsZV0KcHViIHVuc2FmZSBmbiBtYWluX2Z1bmN0aW9uKHN0YXRlX3B0cjogaTMyLCBldmVudF9wdHI6IGkzMiwgaXNfb3duZXI6IGkzMikgLT4gdTMyIHsKICAgIHNkazo6ZXhlY3V0ZV9jb250cmFjdChzdGF0ZV9wdHIsIGV2ZW50X3B0ciwgaXNfb3duZXIsIGNvbnRyYWN0X2xvZ2ljKQp9CgpmbiBjb250cmFjdF9sb2dpYygKICBjb250ZXh0OiAmc2RrOjpDb250ZXh0PFN0YXRlLCBTdGF0ZUV2ZW50PiwKICBjb250cmFjdF9yZXN1bHQ6ICZtdXQgc2RrOjpDb250cmFjdFJlc3VsdDxTdGF0ZT4sCikgewogIGxldCBzdGF0ZSA9ICZtdXQgY29udHJhY3RfcmVzdWx0LmZpbmFsX3N0YXRlOwogIG1hdGNoIGNvbnRleHQuZXZlbnQgewogICAgICBTdGF0ZUV2ZW50OjpNb2RPbmUgeyBkYXRhIH0gPT4gewogICAgICAgIHN0YXRlLm9uZSA9IGRhdGE7CiAgICAgIH0sCiAgICAgIFN0YXRlRXZlbnQ6Ok1vZFR3byB7IGRhdGEgfSA9PiB7CiAgICAgICAgc3RhdGUudHdvID0gZGF0YTsKICAgICAgfSwKICAgICAgU3RhdGVFdmVudDo6TW9kVGhyZWUgeyBkYXRhIH0gPT4gewogICAgICAgIHN0YXRlLnRocmVlID0gZGF0YTsKICAgICAgfSwKICAgICAgU3RhdGVFdmVudDo6TW9kQWxsIHsgb25lLCB0d28sIHRocmVlIH0gPT4gewogICAgICAgIHN0YXRlLm9uZSA9IG9uZTsKICAgICAgICBzdGF0ZS50d28gPSB0d287CiAgICAgICAgc3RhdGUudGhyZWUgPSB0aHJlZTsKICAgICAgfQogIH0KICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7Cn0="
    }
  }
],
  "policies": [
    {
      "id": "Test",
      "validate": {
        "quorum": {
          "PROCENTAJE": 0.5
        }
      },
      "evaluate": {
        "quorum": "MAJORITY"
      },
      "approve": {
        "quorum": {
          "FIXED": 1
        }
      }
    },
    {
      "id": "governance",
      "validate": {
        "quorum": {
          "PROCENTAJE": 0.5
        }
      },
      "evaluate": {
        "quorum": "MAJORITY"
      },
      "approve": {
        "quorum": {
          "FIXED": 1
        }
      }
    }
  ],
  "roles": [
    {
      "who": "MEMBERS",
      "namespace": "",
      "role": "CREATOR",
      "schema": {
        "ID": "Test"
      }
    },
    {
      "who": "MEMBERS",
      "namespace": "",
      "role": "WITNESS",
      "schema": {
        "ID": "Test"
      }
    },
    {
      "who": "MEMBERS",
      "namespace": "",
      "role": "EVALUATOR",
      "schema": "ALL"
    },
    {
      "who": {
        "NAME": "Company1"
      },
      "namespace": "",
      "role": "APPROVER",
      "schema": "ALL"
    }
  ]
}
```
{{< /alert-details >}}

## Miembros
Esta propiedad nos permite definir las condiciones que se deben cumplir en las diferentes fases de generación de un evento que requiere la participación de diferentes miembros, como aprobación, evaluación y validación.

  * **name**: Nombre corto y coloquial por el que se conoce al nodo en la red. No tiene otra función que la descriptiva. No actúa como un identificador único dentro de la gobernanza.
  * **id**: Corresponde al ID del controlador del nodo. Actúa como [identificador](../../../getting-started/concepts/identifiers/) único dentro de la red y corresponde a la clave pública criptográfica del nodo.

## Esquemas
Define la lista de [esquemas](../../../getting-started/concepts/schema/) que se permite utilizar en los sujetos asociados con la gobernanza. Cada esquema incluye las siguientes propiedades:

  * **id**: Identificador único del esquema.
  * **schema**: Descripción del esquema en formato [JSON-Schema](../../json-schema/).
  * **initial_value**: Objeto JSON que representa el estado inicial de un sujeto recién creado para este esquema.
  * **contract**: El [contrato](../../../getting-started/concepts/contracts/) compilado en Raw String base 64.

## Rols
En este apartado definimos quiénes son los encargados de dar su consentimiento para que el evento avance por las diferentes fases de su ciclo de vida (evaluación, aprobación y validación), y por otro lado también sirve para indicar quiénes pueden realizar determinadas acciones (creación de sujetos e invocación externa).

  * **who**: Indica a quién afecta el Rol, puede ser un id específico (clave pública), un miembro de la gobernanza identificado por su nombre, todos los miembros, tanto miembros como externos, o solo externos.
    * **ID**{ID}: Clave pública del miembro.
    * **NAME**{NAME}: Nombre del miembro.
    * **MEMBERS**: Todos los miembros.
    * **ALL**: Todos los socios y externos.
    * **NOT_MEMBERS**: Todos los externos.
  * **namespace**: Hace que el rol en cuestión solo sea válido si coincide con el espacio de nombres del sujeto para el cual se está obteniendo la lista de firmas o permisos. Si no está presente o está vacío, se supone que se aplica universalmente, como si fuese el comodín `*`. Por el momento, no admitimos comodines complejos, pero implícitamente, si configuramos un espacio de nombres, abarca todo lo que se encuentra debajo de él. Por ejemplo:
    * open equivale a `open*`, pero no a `open`.
    * open.dev es equivalente a `open.dev*`, pero no a `open.dev`
    * Si está vacío, equivale a todo, es decir, `*`.
  * **role**: Indica a qué fase afecta:
    * **VALIDATOR**: Para la [fase de validación](../../../getting-started/advanced/validation/).
    * **CREATOR**: Indica quién puede crear sujetos de este tipo.
    * **ISSUER**: Indica quién puede realizar la invocación externa de este tipo.
    * **WITNESS**: Indica quién es el [testigo](../../../getting-started/concepts/roles/) del sujeto.
    * **APPROVER**: Indica quiénes son los [aprobadores](../../../getting-started/concepts/roles/)  del sujeto. Requerido para la [fase de aprobación](../../../getting-started/advanced/approval/).
    * **EVALUATOR**: Indica quiénes son los [evaluadores](../../../getting-started/concepts/roles/) del sujeto. Requerido para la [fase de evaluación](../../../getting-started/advanced/evaluation/).
  * **esquema**: Indica qué [esquemas](../../../getting-started/concepts/schema/) se ven afectados por el rol. Se pueden especificar por su id, todos o aquellos que no son de gobernanza.
    * **ID**{ID}: identificador único del esquema.
    * **NOT_GOVERNANCE**: Todos los esquemas excepto el de gobernanza.
    * **ALL**: Todos los esquemas.

## Políticas
Esta propiedad establece los permisos de los usuarios previamente definidos en la sección de miembros, otorgándoles roles respecto a los esquemas que hayan definido. Las políticas se definen de forma independiente para cada [esquema](../../../getting-started/concepts/schema/) definido en la gobernanza.

  * **approve**: Define quiénes son los aprobadores de los sujetos que se crean con ese esquema. Asimismo, el quórum requerido para considerar aprobado un evento.
  * **evaluate**: Define quiénes son los evaluadores de los sujetos que se crean con ese esquema. Asimismo, el quórum requerido para considerar evaluado un evento.
  * **validate**: Define quiénes son los validadores para los sujetos que se crean con ese esquema. Asimismo, el quórum requerido para considerar un evento como validado.

Estos datos lo que definen es el tipo de **quórum** que se debe alcanzar para que el evento pase esta fase. Hay 3 tipos de quórum:
  * **MAJORITY**: Esta es la más sencilla, significa que la mayoría, es decir más del 50% de los votantes deben firmar la petición. Siempre se redondea hacia arriba, por ejemplo, en el caso de que haya 4 votantes, se alcanzaría el quórum de MAYORÍA cuando 3 den su firma.
  * **FIXED**{fixed}: Es bastante sencillo, significa que un número fijo de votantes debe firmar la petición. Por ejemplo, si se especifica un quórum FIJO de 3, este quórum se alcanzará cuando 3 votantes hayan firmado la petición.
  * **PERCENTAGE**{percentage}: Este es un quórum que se calcula en base a un porcentaje de los votantes. Por ejemplo, si se especifica un quórum de 0,5, este quórum se alcanzará cuando el 50% de los votantes hayan firmado la petición. Siempre se redondea.

  En caso de que una política no se resuelva para algún miembro, se devolverá al propietario del gobierno. Esto permite, por ejemplo, que luego de la creación de la gobernanza, cuando aún no haya miembros declarados, el propietario pueda evaluar, aprobar y validar los cambios.

{{< alert type="warning" title="ATENCIÓN">}}Es necesario especificar los permisos de todos los esquemas que se definen, no existe una asignación predeterminada. Debido a esto, también es necesario especificar los permisos del esquema de gobernanza.{{< /alert >}}
