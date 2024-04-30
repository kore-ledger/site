---
title: Arquitectura
date: 2024-04-26
weight: 1
description: Arquitectura de Kore Base.
---

[Kore Base](https://github.com/kore-ledger/kore-base) es una biblioteca que implementa la mayor parte de la funcionalidad de los protocolos Kore. La forma más directa de desarrollar una aplicación compatible con Kore es utilizar esta biblioteca como hace, por ejemplo, [Kore Client](../../kore%20node/kore%20client%20http/_index.md).

Internamente, está estructurada en una serie de capas con diferentes responsabilidades. A continuación se muestra una vista simplificada a nivel de capas y bloques de la estructura de Kore Base. 

{{< imgproc architecture Fit "1800x500" >}}
{{< /imgproc >}}

## Red
Capa encargada de gestionar las comunicaciones en red, es decir, el envío y recepción de información entre los diferentes nodos de la red. Internamente, la implementación se basa en el uso de [LibP2P](https://docs.libp2p.io/) para resolver las comunicaciones punto a punto. Para ello, se utilizan los siguientes protocolos:
- [Kademlia](https://docs.libp2p.io/concepts/fundamentals/protocols/#kad-dht), tabla hash distribuida utilizada como base de la funcionalidad de enrutamiento entre pares.
- [Identify](https://docs.libp2p.io/concepts/fundamentals/protocols/#identify), protocolo que permite a los pares intercambiar información sobre los demás, especialmente sus claves públicas y direcciones de red conocidas.
- [Noise](https://docs.libp2p.io/concepts/secure-comm/noise/), esquema de cifrado que permite una comunicación segura combinando primitivas criptográficas en patrones con propiedades de seguridad verificables.
- Tell, protocolo asíncrono de envío de mensajes. Tell surgió dentro del desarrollo de Kore como alternativa al protocolo [LibP2P Request Response](https://docs.rs/libp2p-request-response/latest/libp2p_request_response/) que requería esperar respuestas.

## Mensajes
Capa encargada de gestionar las tareas de envío de mensajes. El protocolo de comunicaciones Kore gestiona diferentes tipos de mensajes. Algunos de ellos requieren una respuesta. Dado que las comunicaciones son asíncronas, no se espera una respuesta inmediata. Por ello, algunos tipos de mensajes deben reenviarse periódicamente hasta que se cumplan las condiciones necesarias. Esta capa se encarga de encapsular los mensajes de protocolo y gestionar las tareas de reenvío.

## Protocolo
Capa encargada de gestionar los diferentes tipos de mensajes del protocolo Kore y redirigirlos a las partes de la aplicación encargadas de gestionar cada tipo de mensaje.

## Ledger
Capa encargada de gestionar las cadenas de eventos, los microledgers. Esta capa se encarga de la gestión de sujetos, eventos, actualizaciones de estado, actualización de cadenas obsoletas, etc. 

## Gobernanza
Módulo que gestiona las gobernanzas. Diferentes partes de la aplicación necesitan resolver condiciones sobre el estado actual o pasado de alguna de las gobernaciones en las que participa. Este módulo se encarga de gestionar estas operaciones.

## API
Capa encargada de exponer la funcionalidad del nodo Kore. Consultas de asuntos y eventos, emisión de solicitudes o gestión de aprobaciones son algunas de las funcionalidades expuestas. También se expone un canal de notificaciones en el que se publican los diferentes eventos que ocurren dentro del nodo, como por ejemplo la creación de materias o eventos.