---
title: Uso básico
date: 2024-04-26
weight: 2
description: Uso básico de Kore Base.
---
Kore Base expone un objeto Kore que representa el nodo que se va a iniciar. Para construir este objeto es necesario definir una serie de configuraciones adicionales y proporcionar una implementación de base de datos que satisfaga las necesidades de Kore Base. Kore Base incluye una implementación de base de datos en memoria para pruebas pero sin capacidad de persistencia. Kore Client incluye una implementación basada en [LevelDB](./taple-client.md#database). 

Una vez que hemos construido nuestro objeto Kore, podemos interactuar con él a través de 2 mecanismos:
- una API asíncrona con la que enviar peticiones al nodo;
- y un canal de notificaciones para recibir información sobre lo que ocurre en el propio nodo, por ejemplo, cuando se confirma un evento. 

El siguiente ejemplo muestra un ejemplo mínimo de una aplicación que utiliza Kore Base. Esta aplicación se limita a iniciar un único nodo y crear localmente un tema de gobierno. 

```rust 

```

{{< alert type="info" title="INFO">}}El ejemplo completo se encuentra en el [repositorio Kore Base](https://github.com/opencanarias/taple-core){{< /alert >}}