---
title: Roles
description: Descripción de los roles.
weight: 212
---


## Propietario
Posee el sujeto de trazabilidad y es el nodo responsable de registrar los eventos.

{{< alert type="success" >}}💡 La propiedad del sujeto puede obtenerse creándola o recibiéndola del propietario anterior{{< /alert >}}
## Emisor
Aplicación autorizada a emitir peticiones de eventos, aunque no sea un nodo de la red. Todo lo que necesita para participar en la red es un par de claves criptográficas que permita firmar los eventos, además de tener los permisos necesarios en la gobernanza.
## Evaluador
Nodo que evalua las peticiones de eventos aplicando el contrato.
## Aprobador
Nodo que acepta o rechaza la inclusión para determinados eventos que necesitan consenso.
## Validador
Nodo que valida el orden de los eventos para garantizar la inmunidad a la manipulación. Esto lo consigue no firmando eventos con el mismo ID del sujeto y número de secuencia.
## Testigo
Nodos interesados en mantener una copia del registro, aportando también resiliencia.