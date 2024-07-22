---
title: Configuración
date: 2024-04-26
weight: 2
description: Configuración de Kore Node
---
Estos parámetros de configuración son generales a cualquier nodo indpendientemente del tipo de cliente que se vaya a usar, los parámetros específicos de cada cliente se encontrarán en sus respectivas secciones.

La configuración de un nodo puede realizarse de diferentes maneras. A continuación se enumeran los mecanismos admitidos, de menor a mayor prioridad:

- Variables de entorno.
- Archivo de configuración.

## Variables de entorno
Los siguientes parámetros de configuración solo se pueden configurar a través de variables de entorno y como parámetros al binario que se genera al compilar el cliente, pero no haciendo uso de archivos:
<table>
  <tr> 
    <td><b>Variable de entorno</b></td>
    <td><b>Descripción</b></td>
    <td><b>Parámetro de entrada</b></td>
    <td><b>Qué recibe</b></td>
  </tr>
  <tr>
    <td><code>KORE_PASSWORD</code></td>
    <td>Contraseña que se utilizará para encriptar el material criptográfico</td>
    <td><code>-p</code></td>
    <td>La contraseña</td>
  </tr>
    <tr>
    <td><code>KORE_FILE_PATH</code></td>
    <td>Ruta del archivo de configuración a utilizar</td>
    <td><code>-f</code></td>
    <td>Ruta del archivo</td>
  </tr>
</table>


Los parámetros que se pueden configurar mediante variables de entorno y archivos son:
<table>
  <tr> 
    <td><b>Variable de entorno</b></td>
    <td><b>Descripción</b></td>
    <td><b>Qué recibe</b></td>
    <td><b>Valor por defecto</b></td>
  </tr>
  <tr>
    <td><code>KORE_PROMETHEUS</code></td>
    <td>Dirección y puerto donde se va a exponer el servidor que contiene el endpoint <code>/metrics</code> donde se encuentra el prometheus</td>
    <td>Una dirección IP y un puerto</td>
    <td><code>0.0.0.0:3050</code></td>
  </tr>
  <tr>
    <td><code>KORE_KEYS_PATH</code></td>
    <td>Ruta donde se guardará la clave privada en formato <code>PKCS8</code> encriptada con <code>PKCS5</code></td>
    <td>Un directorio</td>
    <td><code>examples/keys</code></td>
  </tr>
  <tr>
    <td><code>KORE_DB_PATH</code></td>
    <td>Ruta donde se creará la base de datos si no existe o donde se encuentra la base de datos en caso de que ya exista</td>
    <td>Un directorio</td>
    <td>Para LevelDB <code>examples/leveldb</code> y para SQlite <code>examples/sqlitedb</code></td>
  </tr>


  <tr>
    <td><code>KORE_NODE_KEY_DERIVATOR</code></td>
    <td><code>Key derivator</code> a utilizar</td>
    <td>Un String con <code>Ed25519</code> o <code>Secp256k1</code></td>
    <td><code>Ed25519</code></td>
  </tr>
  <tr>
    <td><code>KORE_NODE_DIGEST_DERIVATOR</code></td>
    <td><code>Digest derivator</code> a utilizar</td>
    <td>Un String con <code>Blake3_256</code>, <code>Blake3_512</code>, <code>SHA2_256</code>, <code>SHA2_512</code>, <code>SHA3_256</code> o <code>SHA3_512</code></td>
    <td><code>Blake3_256</code></td>
  </tr>
  <tr>
    <td><code>KORE_NODE_REPLICATION_FACTOR</code></td>
    <td>Porcentaje de nodos de red que reciben mensajes de protocolo en una iteración</td>
    <td>Valor flotante</td>
    <td><code>0.25</code></td>
  </tr>
  <tr>
    <td><code>KORE_NODE_TIMEOUT</code></td>
    <td>Tiempo de espera que se utilizará entre iteraciones del protocolo</td>
    <td>Valor entero sin signo</td>
    <td><code>3000</code></td>
  </tr>
  <tr>
    <td><code>KORE_NODE_PASSVOTATION</code></td>
    <td>Comportamiento del nodo en la fase de aprobación</td>
    <td>Valor entero sin signo, 1 para aprobar siempre, 2 para denegar siempre, otro valor para aprobación manual</td>
    <td><code>0</code></td>
  </tr>
  <tr>
    <td><code>KORE_NODE_SMARTCONTRACTS_DIRECTORY</code></td>
    <td>Directorio donde se almacenarán los contratos de los sujetos</td>
    <td>Un directorio</td>
    <td><code>Contracts</code></td>
  </tr>


  <tr>
    <td><code>KORE_NETWORK_PORT_REUSE</code></td>
    <td>Verdadero para configurar la reutilización de puertos para sockets locales, lo que implica la reutilización de puertos de escucha para conexiones salientes para mejorar las capacidades transversales de NAT.</td>
    <td>Valor Boolean</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_USER_AGENT</code></td>
    <td>El user agent</td>
    <td>El user agent</td>
    <td><code>kore-node</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_NODE_TYPE</code></td>
    <td>Tipo de nodo</td>
    <td>Un String: Bootstrap, Addressable o Ephemeral</td>
    <td><code>Bootstrap</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_LISTEN_ADDRESSES</code></td>
    <td>Direcciones donde el nodo va a escuchar</td>
    <td>Direcciones donde el nodo va a escuchar</td>
    <td><code>/ip4/0.0.0.0/tcp/50000</code></td>
  </tr>
  <tr>
 <td><code>KORE_NETWORK_EXTERNAL_ADDRESSES</code></td>
 <td>Dirección externa por la cual se puede acceder al nodo, pero no se encuentra entre sus interfaces</td>
 <td>Dirección externa por la cual se puede acceder al nodo, pero no se encuentra entre sus interfaces</td>
 <td><code>/ip4/90.0.0.70/tcp/50000</code></td>
 </tr>

  <tr>
    <td><code>KORE_NETWORK_ROUTING_BOOT_NODES</code></td>
    <td>Direcciones de los Boot Nodes en la red P2P a los cuales nos conectaremos para empezar a formar parte de la red</td>
    <td>Direcciones de los Boot Nodes, donde si tiene más de una dirección será separada con una <code>_</code> y las direcciones se separan del <code>Peer-ID</code> del nodo mediante <code>/p2p/</code></td>
    <td></td>

  </tr>
  <tr>
    <td><code>KORE_NETWORK_ROUTING_DHT_RANDOM_WALK</code></td>
    <td>Verdadero para activar el <code>random walk</code> en la DHT de Kademlia</td>
    <td>Valor Boolean</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_ROUTING_DISCOVERY_ONLY_IF_UNDER_NUM</code></td>
    <td>Número de conexiones activas sobre las que interrumpimos el proceso de descubrimiento</td>
    <td>Cantidad de conexiónes activas</td>
    <td><code>u64::MAX</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_ROUTING_ALLOW_NON_GLOBALS_IN_DHT</code></td>
    <td>Verdadero si se permiten direcciones no globales en el DHT</td>
    <td>Valor Boolean</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_ROUTING_ALLOW_PRIVATE_IP</code></td>
    <td>Si es false el dirección de un nodo no puede ser privada</td>
    <td>Valor Boolean</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_ROUTING_ENABLE_MDNS</code></td>
    <td>Verdadero para activar mDNS</td>
    <td>Valor Boolean</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_ROUTING_KADEMLIA_DISJOINT_QUERY_PATHS</code></td>
    <td>Cuando está habilitado, el número de rutas separadas utilizadas es igual al paralelismo configurado</td>
    <td>Valor Boolean</td>
    <td><code>true</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_ROUTING_KADEMLIA_REPLICATION_FACTOR</code></td>
    <td>El factor de replicación determina a cuántos peers más cercanos se replica un registro</td>
    <td>Valor entero sin signo mayor a 0</td>
    <td><code>false</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_ROUTING_PROTOCOL_NAMES</code></td>
    <td>Protocolos que soporta el nodo</td>
    <td>Protocolos que soporta el nodo</td>
    <td><code>/kore/routing/1.0.0</code></td>
  </tr>


  <tr>
    <td><code>KORE_NETWORK_TELL_MESSAGE_TIMEOUT_SECS</code></td>
    <td>Tiempo de espera de un mensaje</td>
    <td>Cantidad de segundos</td>
    <td><code>10</code></td>
  </tr>
  <tr>
    <td><code>KORE_NETWORK_TELL_MAX_CONCURRENT_STREAMS</code></td>
    <td>Cantidad máxima de transmisiones simultáneas</td>
    <td>Valor entero sin signo</td>
    <td><code>100</code></td>
  </tr>
  </table>

## Archivo .json
```json
{
    "kore": {
        "network": {
            "user_agent": "Kore2.0",
            "node_type": "Addressable",
            "listen_addresses": [
                "/ip4/127.0.0.1/tcp/50000",
                "/ip4/127.0.0.1/tcp/50001",
                "/ip4/127.0.0.1/tcp/50002"
            ],
            "external_addresses": [
                "/ip4/90.0.0.70/tcp/50000"
            ],
            "tell": {
                "message_timeout_secs": 58,
                "max_concurrent_streams": 166
            },
            "routing": {
                "boot_nodes": [
                    "/ip4/172.17.0.1/tcp/50000_/ip4/127.0.0.1/tcp/60001/p2p/12D3KooWLXexpg81PjdjnrhmHUxN7U5EtfXJgr9cahei1SJ9Ub3B",
                    "/ip4/11.11.0.11/tcp/10000_/ip4/12.22.33.44/tcp/55511/p2p/12D3KooWRS3QVwqBtNp7rUCG4SF3nBrinQqJYC1N5qc1Wdr4jrze"
                ],
                "dht_random_walk": false,
                "discovery_only_if_under_num": 55,
                "allow_non_globals_in_dht": true,
                "allow_private_ip": true,
                "enable_mdns": false,
                "kademlia_disjoint_query_paths": false,
                "kademlia_replication_factor": 30,
                "protocol_names": [
                    "/kore/routing/2.2.2",
                    "/kore/routing/1.1.1"
                ]
            },
            "port_reuse": true
        },
        "node": {
            "key_derivator": "Secp256k1",
            "digest_derivator": "Blake3_512",
            "replication_factor": 0.555,
            "timeout": 30,
            "passvotation": 50,
            "smartcontracts_directory": "./fake_route"
        },
        "db_path": "./fake/db/path",
        "keys_path": "./fake/keys/path",
        "prometheus": "10.0.0.0:3030"
    }
}
```

## Archivo .toml
```toml
[kore.network]
user_agent = "Kore2.0"
node_type = "Addressable"
port_reuse = true
listen_addresses = ["/ip4/127.0.0.1/tcp/50000","/ip4/127.0.0.1/tcp/50001","/ip4/127.0.0.1/tcp/50002"]
external_addresses = ["/ip4/90.0.0.70/tcp/50000"]
        
[kore.network.tell]
message_timeout_secs = 58
max_concurrent_streams = 166
        
[kore.network.routing]
boot_nodes = ["/ip4/172.17.0.1/tcp/50000_/ip4/127.0.0.1/tcp/60001/p2p/12D3KooWLXexpg81PjdjnrhmHUxN7U5EtfXJgr9cahei1SJ9Ub3B", "/ip4/11.11.0.11/tcp/10000_/ip4/12.22.33.44/tcp/55511/p2p/12D3KooWRS3QVwqBtNp7rUCG4SF3nBrinQqJYC1N5qc1Wdr4jrze"]
dht_random_walk = false
discovery_only_if_under_num = 55
allow_non_globals_in_dht = true
allow_private_ip = true
enable_mdns = false
kademlia_disjoint_query_paths = false
kademlia_replication_factor = 30
protocol_names = ["/kore/routing/2.2.2", "/kore/routing/1.1.1"]
        
[kore.node]
key_derivator = "Secp256k1"
digest_derivator = "Blake3_512"
replication_factor = 0.555
timeout = 30
passvotation = 50
smartcontracts_directory = "./fake_route"
        
[kore]
db_path = "./fake/db/path"
keys_path = "./fake/keys/path"    
prometheus = "10.0.0.0:3030"    
```

## Archivo .yaml
```yaml
kore:
  network:
    user_agent: "Kore2.0"
    node_type: "Addressable"
    listen_addresses:
      - "/ip4/127.0.0.1/tcp/50000"
      - "/ip4/127.0.0.1/tcp/50001"
      - "/ip4/127.0.0.1/tcp/50002"
    external_addresses:
      - "/ip4/90.0.0.70/tcp/50000"
    tell:
      message_timeout_secs: 58
      max_concurrent_streams: 166
    routing:
      boot_nodes:
        - "/ip4/172.17.0.1/tcp/50000_/ip4/127.0.0.1/tcp/60001/p2p/12D3KooWLXexpg81PjdjnrhmHUxN7U5EtfXJgr9cahei1SJ9Ub3B"
        - "/ip4/11.11.0.11/tcp/10000_/ip4/12.22.33.44/tcp/55511/p2p/12D3KooWRS3QVwqBtNp7rUCG4SF3nBrinQqJYC1N5qc1Wdr4jrze"
      dht_random_walk: false
      discovery_only_if_under_num: 55
      allow_non_globals_in_dht: true
      allow_private_ip: true
      enable_mdns: false
      kademlia_disjoint_query_paths: false
      kademlia_replication_factor: 30
      protocol_names:
        - "/kore/routing/2.2.2"
        - "/kore/routing/1.1.1"
    port_reuse: true
  node:
    key_derivator: "Secp256k1"
    digest_derivator: "Blake3_512"
    replication_factor: 0.555
    timeout: 30
    passvotation: 50
    smartcontracts_directory: "./fake_route"
  db_path: "./fake/db/path"
  keys_path: "./fake/keys/path"
  prometheus: "10.0.0.0:3030"

```