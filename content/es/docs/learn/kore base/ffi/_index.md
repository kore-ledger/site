---
title: FFI
date: 2024-04-26
weight: 3
description: Implementación de FFI.
---
Kore ha sido diseñado con la intención de que pueda ser construido y ejecutado en diferentes arquitecturas, dispositivos, e incluso desde lenguajes distintos a Rust. 

La mayor parte de la funcionalidad de Kore se ha implementado en una librería, Kore Base. Sin embargo, esta librería por sí sola no permite ejecutar un nodo Kore ya que, por ejemplo, necesita la implementación de una base de datos. Esta base de datos debe ser proporcionada por el software que integra la librería Kore Base. Por ejemplo, Kore Client integra una base de datos LevelDB.

Sin embargo, para ejecutar Kore en otras arquitecturas o lenguajes necesitamos una serie de elementos adicionales:
- Exponer una Foreign Function Interface (FFI) que permita interactuar con la librería Kore desde otros lenguajes.
- Vinculaciones al lenguaje de destino. Facilitar la interacción con la librería.
- Capacidad de compilación cruzada a la arquitectura de destino.

{{< imgproc ffi Fit "1800x500" >}}
{{< /imgproc >}}

{{< alert type="info" title="INFO">}}
Explore the Kore [repositories](https://github.com/orgs/kore-ledger/repositories) related to FFI for more information.
{{< /alert >}}