---
title: Configuration
date: 2024-04-26
weight: 2
description: Configuration for Node Client Http
---
The configuration of a Kore-Client node can be done in different ways. The supported mechanisms are listed below, from the highest to the lowest priority:

- Environment variables.
- Input parameters.
- File **settings.toml**.
- Default value.

## General options

<table>
  <tr>
  <td><b>EnvVar</b></td>
    <td><b>Description</b></td>
    <td><b>Input param</b></td>
    <td><b>settings.toml</b></td>
    <td><b>Admited values</b></td>
  </tr>
  
  <!-- Database path -->
  <tr>
    <td><code>Kore_DB_PATH</code></td>
    <td>Path where the database is stored</td>
    <td><code>-d</code>, <code>--db-path</code></td>
    <td><code>db-path</code></td>
    <td>Any valid writable folder path. Default to <code>$HOME_PATH/.Kore/db</code>. If it does not exist or does not have write permissions, it uses <code>tmp/.Kore/db</code></td>
  </tr>
  
  <!-- ID private key -->
  <tr>
    <td><code>Kore_ID_PRIVATE_KEY</code></td>
    <td>Private key identifying the node's owner</td>
    <td><code>-k</code>, <code>--id-private-key</code></td>
    <td><code>id-private-key</code></td>
    <td>Private keys associated with an identity in Kore. HEX format.</td>
  </tr>
  
  <!-- ID key derivator -->
  <tr>
  <td><code>Kore_ID_KEY_DERIVATOR</code></td>
    <td>Key derivative to be used by the Kore node</td>
    <td><code>--id-key-derivator</code></td>
    <td><code>id-key-derivator</code></td>
    <td><code>ed25519 (default)</code>, <code>secp256k1</code></td>
  </tr>
  
  <!-- Digest derivator -->
  <tr>
  <td><code>Kore_DIGEST_DERIVATOR</code></td>
    <td>Digest derivator to use when signing</td>
    <td><code>--digest-derivator</code></td>
    <td><code>digest-derivator</code></td>
    <td><code>Blake3_256 (default)</code>, <code>Blake3_512</code>, <code>SHA2_256</code>, <code>SHA2_512</code>, <code>SHA3_256</code>, <code>SHA3_512</code></td>
  </tr>
  
  <!-- Key derivator -->
  <tr>
  <td><code>Kore_KEY_DERIVATOR</code></td>
    <td>Key derivator to use when creating new key pairs</td>
    <td><code>--key-derivator</code></td>
    <td><code>key-derivator</code></td>
    <td><code>ed25519 (default)</code>, <code>secp256k1</code></td>
  </tr>
  
  <!-- Network listen address -->
  <tr>
    <td><code>Kore_NETWORK_LISTEN_ADDR</code></td>
    <td>Network interface on which incoming connections are listened for</td>
    <td><code>-a</code>, <code>--network.listen-addr</code></td>
    <td><code>[network]<br/>listen-addr</code></td>
    <td>A valid multiaddr representing a listen interface. More than 1 value can be specified. Default value: <code>/ip4/0.0.0.0/tcp/40040</code></td>
  </tr>
  
  <!-- Known node -->
  <tr>
    <td><code>Kore_NETWORK_KNOWN_NODE</code></td>
    <td>Address of a known node at start-up</td>
    <td><code>--network.known-node</code></td>
    <td><code>[network]<br/>known-node</code></td>
    <td>A valid multiaddr. More than 1 value can be specified.</td>
  </tr>
  
  <!-- External address -->
  <tr>
    <td><code>Kore_NETWORK_EXTERNAL_ADDR</code></td>
    <td>Public address known at start-up</td>
    <td><code>--network.external-addr</code></td>
    <td><code>[network]<br/>external-addr</code></td>
    <td>A valid multiaddr. More than 1 value can be specified.</td>
  </tr>
</table>


## API REST

<table>
  <tr>
    <td><b>EnvVar</b></td>
    <td><b>Description</b></td>
    <td><b>Input param</b></td>
    <td><b>settings.toml</b></td>
    <td><b>Admited values</b></td>
  </tr>

  <!-- Enable/disable API REST -->
  <tr>
    <td><code>Kore_HTTP</code></td>
    <td>Enable/disable API REST</td>
    <td><code>--http</code></td>
    <td><code>[http]<br/>http</code></td>
    <td>Boolean value. Default: <code>false</code></td>
  </tr>

  <!-- Enable/disable API REST documentation -->
  <tr>
    <td><code>Kore_HTTP_DOC</code></td>
    <td>Enable/disable API REST documentation. If enabled, documentation is available at <code>/doc</code></td>
    <td><code>--http.doc</code></td>
    <td><code>[http]<br/>doc</code></td>
    <td>Boolean value. Default: <code>false</code></td>
  </tr>

  <!-- API REST port -->
  <tr>
    <td><code>Kore_HTTP_PORT</code></td>
    <td>API REST port</td>
    <td><code>--http.port</code></td>
    <td><code>[http]<br/>port</code></td>
    <td>A valid port number. Default: <code>3000</code></td>
  </tr>

  <!-- Network interface for incoming connections -->
  <tr>
    <td><code>Kore_HTTP_ADDR</code></td>
    <td>Network interface on which incoming connections are listened for</td>
    <td><code>--http.addr</code></td>
    <td><code>[http]<br/>addr</code></td>
    <td>A valid network interface. Default: <code>0.0.0.0</code></td>
  </tr>
</table>


## Contracts

<table>
  <tr>
    <td><b>Description</b></td>
    <td>Path where smart contracts are compiled</td>
  </tr>
  <tr>
    <td><b>EnvVar</b></td>
    <td><code>Kore_SC_BUILD_PATH</code></td>
  </tr>
  <tr>
    <td><b>Input param</b></td>
    <td><code>--sc.build-path</code></td>
  </tr>
  <tr>
    <td><b>settings.toml</b></td>
    <td><code>[sc]<br/>build-path</code></td>
  </tr>
  <tr>
    <td><b>Admited values</b></td>
    <td>Any valid writable folder path. Default: <code>$HOME_PATH/.Kore/sc</code>. If it does not exist or does not have write permissions, it uses <code>tmp/.Kore/sc</code></td>
  </tr>
</table>
