---
title: Bajo el capó
date: 2024-04-25
weight: 16
description: Tecnologías empleadas por Kore Ledger
---

## Rust
Rust es un lenguaje de programación desarrollado inicialmente por Graydon Hoare en 2006 mientras trabajaba en Mozilla, empresa que luego apoyaría oficialmente el proyecto en 2009, logrando así su primera versión estable en 2014. Desde entonces, la popularidad y adopción del lenguaje ha ido en aumento. por sus características, recibiendo el apoyo de importantes empresas de la industria como Microsoft, Meta, Amazon y Linux Foundation entre otras.

Rust es el lenguaje principal de la tecnología Kore. Su principal característica es la construcción de código seguro, implementa una serie de funcionalidades cuyo propósito es garantizar [la seguridad de la memoria](https://en.wikipedia.org/wiki/Memory_safety), además de agregar abstracciones de costo cero que facilitan el uso del lenguaje sin requerir sintaxis complejas. Rust es capaz de proporcionar estas ventajas sin afectar negativamente al rendimiento del sistema, tanto desde el punto de vista de la velocidad de un proceso en ejecución, como de su consumo energético. En ambas características mantiene [rendimiento](https://haslab.github.io/SAFER/scp21.pdf) igual o similar a C y C++.

Se eligió Rust como tecnología precisamente por estas características. Desde Kore ledger damos gran importancia a la seguridad del software desarrollado y a su consumo energético y Rust fue precisamente el lenguaje que cubrió nuestras necesidades. Además, al ser un lenguaje moderno, incluye ciertas utilidades y/o características que nos permitirían avanzar más rápidamente en el desarrollo de la tecnología.

## LibP2P
[Libp2p](https://libp2p.io/) es una "pila de tecnologías" centrada en la creación de aplicaciones peer-to-peer. Así, LibP2P permite que su aplicación construya nodos capaces de interpretar una serie de protocolos seleccionables, que pueden ser tanto de transmisión de mensajes como de cifrado, entre otros. Libp2p va un paso más allá ofreciendo las herramientas necesarias para construir cualquier protocolo desde 0 o incluso crear wrappers de otros existentes o simplemente implementar una nueva capa de alto nivel para un protocolo manteniendo su funcionamiento de bajo nivel. LibP2P también gestiona la capa de transporte del propio nodo y ofrece soluciones a problemas conocidos como "[NAT Traversal](https://en.wikipedia.org/wiki/NAT_traversal)".

LibP2P también pone especial énfasis en la modularidad, de tal forma que todos y cada uno de los elementos anteriormente mencionados están aislados entre sí, pueden modificarse sin afectarse entre sí y pueden combinarse como se desee, manteniendo el principio de responsabilidad única y permitiendo reutilización de código. Una vez que se desarrolla un protocolo para LibP2P, se puede utilizar en cualquier aplicación independientemente de cuán diferentes sean entre sí. Este nivel de modularidad permite utilizar incluso diferentes protocolos dependiendo del medio a utilizar.

Kore eligió LibP2P debido a su enfoque innovador para la creación de aplicaciones P2P a través de sus herramientas y utilidades que facilitan enormemente el desarrollo. También influyó el hecho de que es una tecnología con trayectoria en el sector Web3, ya que originalmente formaba parte de IPFS y ha sido utilizada en [Polkadot y Substrate](https://www.parity.io/blog) así como [Ethereum 2.0](https://ethereum.org/es/developers/docs/networking-layer/).

## Tokio
## Tokio
[Tokio](https://tokio.rs/#tk-lib-tokio) es una biblioteca para Rust destinada a facilitar la creación de [asincrónico](https://rust-lang.github.io/async-book/ 01_getting_started/01_chapter.html) y [aplicaciones] concurrentes(https://doc.rust-lang.org/book/ch16-00-concurrency.html#:~:text=Concurrent%20programming%2C%20where%20 Different%20parts %20of%20a%20program%20ejecutar%20independientemente). Proporciona los elementos necesarios para la creación de un entorno de ejecución para la gestión de tareas, interpretados internamente como "hilos verdes" (que Rust no soporta de forma nativa). Así como canales de comunicación entre ellos. También es bastante fácil de usar gracias a su sintaxis centrada en "async/await" y tiene una alta escalabilidad gracias al reducido coste de creación y eliminación de tareas.

## Tokio
[Tokio](https://tokio.rs/#tk-lib-tokio) es una biblioteca para Rust destinada a facilitar la creación de [asincrónico](https://rust-lang.github.io/async-book/ 01_getting_started/01_chapter.html) y [aplicaciones] concurrentes(https://doc.rust-lang.org/book/ch16-00-concurrency.html#:~:text=Concurrent%20programming%2C%20where%20 Different%20parts %20of%20a%20program%20ejecutar%20independientemente). Proporciona los elementos necesarios para la creación de un entorno de ejecución para la gestión de tareas, interpretados internamente como "hilos verdes" (que Rust no soporta de forma nativa). Así como canales de comunicación entre ellos. También es bastante fácil de usar gracias a su sintaxis centrada en "async/await" y tiene una alta escalabilidad gracias al reducido coste de creación y eliminación de tareas.

Por las características mencionadas anteriormente y centrándose en la concurrencia y la escalabilidad, Tokio es una biblioteca adecuada a las necesidades que quieras cubrir con la tecnología Kore.