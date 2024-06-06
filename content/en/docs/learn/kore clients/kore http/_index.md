---
title: Kore HTTP
date: 2024-06-06
weight: 1
description: Kore Base HTTP Client.
---
It is a kore base client that uses the HTTP protocol, it allows to interact through an api with the Kore Ledger nodes. Soon it will have documentation with [OpenAPI](https://es.wikipedia.org/wiki/Especificaci%C3%B3n_OpenAPI).

It has a single configuration variable that is only obtained by environment variable.
<table>
  <tr> 
    <td><b>Environment variable</b></td>
    <td><b>Description</b></td>
    <td><b>What you receive</b></td>
    <td><b>Default values</b></td>
  </tr>
  <tr>
    <td><code>KORE_HTTP_ADDRESS</code></td>
    <td>Address where we can access the api</td>
    <td>IP address and port</td>
    <td><code>0.0.0.0:3000</code></td>
  </tr>
</table>

{{< alert type="info" title="INFO">}}
To access more information about how Kore HTTP works, access the [repository](https://github.com/kore-ledger/kore-http)
{{< /alert >}}