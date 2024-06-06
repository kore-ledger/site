---
title: Qué es
date: 2024-06-06
weight: 1
description: ¿Qué es Kore Node?.
---
Kore Node es in intermediario entre Kore Base y los diferentes Kore Clients como podría ser Kore HTTP. Sus principales funciones son 4:
1. Crear una API que consumiran los diferentes Kore Clients para poder comunicarse con Kore Base, el objetivo de esta API es la **simplificación de los tipos**, es decir, se encarga de recibir tipos básicos como `String` y convertirlos en tipos complejos que espera recibir Kore Base como un `DigestIdentifier`. Otro objetivo de esta API es convinar diferentes métodos de la API de Kore Base para realizar una funcionalidad concreta como podría ser la de crear un sujeto de trazabilidad, de esta forma añadimos una capa de abstracción sobre la API de Kore Base.
2. Implementar los diferentes métodos que necesitan las bases de datos para que Kore Base pueda utilizarlas, de esta forma Kore Base **no está acoplado** con ninguna base de datos y definiendo unos métodos es capaz de funcionar con un [LevelDB](https://github.com/google/leveldb), un [SQlite](https://sqlite.org/) o un [Cassandra](https://cassandra.apache.org/_/index.html).
3. Recibir los parámetros de configuración a través de archivos `.toml`, `.yaml` y `.json`; además de `variables de entorno`. Para profundizar sobre los parámetros de configuración visite la siguiente sección.
4. Exponer un [Prometheus](https://prometheus.io/) de forma opcional para poder obtener métricas. Para obtener más información sobre la configuración del prometheus visite la siguiente sección.

Acutalmente Kore Node consta de 3 features:
* sqlite: Para hacer uso de la base de datos de `SQlite`.
* leveldb: Para hacer uso de la base de datos de `LevelDB`.
* prometheus: para exponer una API con un `endpoint` llamado `/metrics` donde se podrán obtener métricas.

{{< alert type="info" title="INFO">}}
Para acceder a más información sobre el funcionamiento de Kore Node, acceda al [repositorio](https://github.com/kore-ledger/kore-node).
{{< /alert >}}