---
title: Configuración
date: 2024-04-26
weight: 2
description: Configuración del Nodo Cliente Http
---
La configuración de un nodo Kore-Client puede realizarse de diferentes maneras. A continuación se enumeran los mecanismos admitidos, de mayor a menor prioridad:

- Variables de entorno.
- Parámetros de entrada.
- Archivo **settings.toml**.
- Valor por defecto.

## Opciones generales

<table>
  <tr> 
    <td><b>Variable de entorno</b></td>
    <td><b>Descripción</b></td>
    <td><b>Parámetro de entrada</b></td>
    <td><b>settings.toml</b></td>
    <td><b>Valores admitidos</b></td>
  </tr>
  <tr>
    <td><code>Kore_DB_PATH</code></td>
    <td>Ruta donde se almacena la base de datos</td>
    <td><code>-d</code>, <code>--db-path</code></td>
    <td><code>db-path</code></td>
    <td>El valor predeterminado es <code>$HOME_PATH/.Kore/db</code>. Si no existe o no tiene permisos de escritura, usa <code>tmp/.Kore/db</code></td>
  </tr>
  <tr>
    <td><code>Kore_ID_PRIVATE_KEY</code></td>
    <td>Clave privada que identifica al propietario del nodo</td>
    <td><code>-k</code>, <code>--id-private-key</code></td>
    <td><code>id-private-key</code></td>
    <td>Claves privadas asociadas a una identidad en Kore. Formato HEX</td>
  </tr>
  <tr>
    <td><code>Kore_ID_KEY_DERIVATOR</code></td>
    <td>Clave derivada que utilizará el nodo Kore</td>
    <td><code>--id-key-derivator</code></td>
    <td><code>id-key-derivator</code></td>
    <td><code>ed25519</code> (default), <code>secp256k1</code></td>
  </tr>
  <tr>
    <td><code>Kore_DIGEST_DERIVATOR</code></td>
    <td>Digest derivator que se utilizará al firmar</td>
    <td><code>--digest-derivator</code></td>
    <td><code>digest-derivator</code></td>
    <td><code>Blake3_256</code> (default), <code>Blake3_512</code>, <code>SHA2_256</code>, <code>SHA2_512</code>, <code>SHA3_256</code>, <code>SHA3_512</code></td>
  </tr>
  <tr>
    <td><code>Kore_KEY_DERIVATOR</code></td>
    <td>Key derivator para crear nuevos pares de claves</td>
    <td><code>--key-derivator</code></td>
    <td><code>key-derivator</code></td>
    <td><code>ed25519</code> (default), <code>secp256k1</code></td>
  </tr>
</table>


## Network

<table>
  <tr>
    <td><b>Variable de entorno</b></td>
    <td><b>Descripción</b></td>
    <td><b>Parámetro de entrada</b></td>
    <td><b>settings.toml</b></td>
    <td><b>Valores admitidos</b></td>
  </tr>
  <tr>
    <td><code>Kore_NETWORK_LISTEN_ADDR</code></td>
    <td>Interfaz de red en la que se escuchan las conexiones entrantes</td>
    <td><code>-a</code>, <code>--network.listen-addr</code></td>
    <td><code>[network]<br/>listen-addr</code></td>
    <td>Un multiaddr válido que representa una interfaz de escucha. Se puede especificar más de 1 valor. Valor por defecto: <code>/ip4/0.0.0.0/tcp/40040</code></td>
  </tr>
  <tr>
    <td><code>Kore_NETWORK_KNOWN_NODE</code></td>
    <td>Dirección de un nodo conocido al inicio</td>
    <td><code>--network.known-node</code></td>
    <td><code>[network]<br/>known-node</code></td>
    <td>Una dirección multiaddr válida. Se puede especificar más de 1 valor.</td>
  </tr>
  <tr>
    <td><code>Kore_NETWORK_EXTERNAL_ADDR</code></td>
    <td>Dirección pública conocida al inicio</td>
    <td><code>--network.external-addr</code></td>
    <td><code>[network]<br/>external-addr</code></td>
    <td>Una dirección multiaddr válida. Se puede especificar más de 1 valor.</td>
  </tr>
</table>


## REST API
<table>
  <tr>
    <td><b>Variable de entorno</b></td>
    <td><b>Descripción</b></td>
    <td><b>Parámetro de entrada</b></td>
    <td><b>settings.toml</b></td>
    <td><b>Valores admitidos</b></td>
  </tr>
  <tr>
    <td><code>Kore_HTTP</code></td>
    <td>Habilitar/deshabilitar REST API</td>
    <td><code>--http</code></td>
    <td><code>[http]<br/>http</code></td>
    <td>Valor booleano. Valor predeterminado: <code>false</code></td>
  </tr>
  <tr>
    <td><code>Kore_HTTP_DOC</code></td>
    <td>Habilitar/deshabilitar REST API documentación. Si está habilitado, la documentación está disponible en <code>/doc</code></td>
    <td><code>--http.doc</code></td>
    <td><code>[http]<br/>doc</code></td>
    <td>Valor booleano. Valor predeterminado: <code>false</code></td>
  </tr>
  <tr>
    <td><code>Kore_HTTP_PORT</code></td>
    <td>Puerto REST API</td>
    <td><code>--http.port</code></td>
    <td><code>[http]<br/>port</code></td>
    <td>Un número de puerto válido. Por defecto: <code>3000</code></td>
  </tr>
  <tr>
    <td><code>Kore_HTTP_ADDR</code></td>
    <td>Interfaz de red en la que se escuchan las conexiones entrantes</td>
    <td><code>--http.addr</code></td>
    <td><code>[http]<br/>addr</code></td>
    <td>Una interfaz de red válida. Por defecto: <code>0.0.0.0</code></td>
  </tr>
</table>

## Contratos

<table>
  <tr>
    <td><b>Variable de entorno</b></td>
    <td><b>Descripción</b></td>
    <td><b>Parámetro de entrada</b></td>
    <td><b>settings.toml</b></td>
    <td><b>Valores admitidos</b></td>
  </tr>
  <tr>
    <td><code>Kore_SC_BUILD_PATH</code></td>
    <td>Ruta donde se compilan los contratos</td>
    <td><code>--sc.build-path</code></td>
    <td><code>[sc]<br/>build-path</code></td>
    <td>Cualquier ruta de carpeta con permiso de escritura válida. El valor predeterminado es <code>$HOME_PATH/.Kore/sc</code>. si no existe o no tiene permisos de escritura, usa <code>tmp/.Kore/sc</code></td>
  </tr>
</table>
