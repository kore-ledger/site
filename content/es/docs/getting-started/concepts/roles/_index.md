---
title: Roles
description: Descripción de los roles.
---

Cada participante de la red interactúa con ella en función de diferentes intereses. Estos intereses están representados en Kore como roles

## Propietario
Posee el sujeto de trazabilidad y es el nodo responsable de registrar los eventos. Tienen control total sobre el sujeto porque posee el material criptográfico con permisos para modificarlo.

{{< alert type="info" title="INFORMACIÓN">}}La propiedad del sujeto puede obtenerse creándola o recibiéndola del propietario anterior.{{< /alert >}}
## Emisor
Aplicación autorizada a emitir peticiones de eventos, aunque no sea un nodo de la red. Todo lo que necesita para participar en la red es un par de claves criptográficas que permita firmar los eventos, además de tener los permisos necesarios en la gobernanza.
## Evaluador
Los evaluadores asumen un papel crucial dentro del marco de gobernanza, siendo responsables de llevar a cabo el proceso de evaluación. Este proceso realiza la ejecución de un **contrato**, que generalmente resulta en un cambio en el estado del sujeto.
## Aprobador
Para que ciertas solicitudes de eventos obtengan aprobación y se agreguen al **microledger** de un sujeto, es necesaria una serie de firmas. La adquisición de estas firmas depende del resultado de la evaluación. Durante la evaluación de un contrato, se toma una decisión sobre la necesidad de aprobación, que puede verse influenciada por las funciones del emisor solicitante.
## Validador
Nodo que valida el orden de los eventos para garantizar la inmunidad a la manipulación. Esto lo consigue no firmando eventos con el mismo ID del sujeto y número de secuencia.
## Testigo
Nodos interesados en mantener una copia del registro, aportando también resiliencia.