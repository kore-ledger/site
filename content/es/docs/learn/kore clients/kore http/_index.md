---
title: Kore HTTP
date: 2024-06-06
weight: 1
description: Cliente HTTP de Kore Base.
---

Es un cliente de kore base que utiliza el protocolo HTTP, permite interactuar mediante una api con los nodos Kore Ledger. Próximamente tendrá documentación con [OpenAPI](https://es.wikipedia.org/wiki/Especificaci%C3%B3n_OpenAPI).

Dispone de una única variable de configuración que solo se obtiene por variable de entorno.
<table>
  <tr> 
    <td><b>Variable de entorno</b></td>
    <td><b>Descripción</b></td>
    <td><b>Qué recibe</b></td>
    <td><b>Valores por defecto</b></td>
  </tr>
  <tr>
    <td><code>KORE_HTTP_ADDRESS</code></td>
    <td>Dirección donde podremos acceder a la api</td>
    <td>Dirección ip y puerto</td>
    <td><code>0.0.0.0:3000</code></td>
  </tr>
</table>

{{< alert type="info" title="INFO">}}
Para acceder a más información sobre el funcionamiento de Kore HTTP acceda al [repositorio](https://github.com/kore-ledger/kore-http)
{{< /alert >}}