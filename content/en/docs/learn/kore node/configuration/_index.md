---
title: Configuration
date: 2024-06-06
weight: 2
description: Configuration for Node Client Http
---
These configuration parameters are general to any node regardless of the type of client to be used, the specific parameters of each client will be found in their respective sections.

Configuring a node can be done in different ways. The supported mechanisms are listed below, from lowest to highest priority:

- Environment Variables.
- Configuration file.

## Environment Variables
The following configuration parameters can only be configured through environment variables and as parameters to the binary that is generated when the client is compiled, but not using files:
<table>
  <tr> 
<td><b>Environment variable</b></td>
 <td><b>Description</b></td>
 <td><b>Input parameter</b></td>
 <td><b>What you receive</b></td>
  </tr>
  <tr>
    <td><code>KORE_PASSWORD</code></td>
    <td>Password that will be used to encrypt the cryptographic material</td>
    <td><code>-p</code></td>
    <td>The password</td>
  </tr>
    <tr>
    <td><code>KORE_FILE_PATH</code></td>
    <td>Path of the configuration file to use</td>
    <td><code>-f</code></td>
    <td>File path</td>
  </tr>
</table>


The parameters that can be configured through environment variables and files are:
<table>
  <tr> 
    <td><b>Environment variable</b></td>
    <td><b>Description</b></td>
    <td><b>What you receive</b></td>
    <td><b>Default value</b></td>
  </tr>
  <tr>
    <td><code>KORE_PROMETHEUS</code></td>
    <td>Address and port where the server that contains the endpoint <code>/metrics</code> where the prometheus is located is going to be exposed</td>
    <td>For example</td>
    <td><code>0.0.0.0:3050</code></td>
  </tr>
  <tr>
    <td><code>KORE_KEYS_PATH</code></td>
    <td>Path where the private key will be saved in <code>PKCS8</code> format encrypted with <code>PKCS5</code></td>
    <td>Path where the private key will be saved</td>
    <td><code>examples/keys</code></td>
 </tr>
 <tr>
    <td><code>KORE_DB_PATH</code></td>
    <td>Path where the database will be created if it does not exist or where the database is located if it already exists</td>
    <td>Database path</td>
    <td>For LevelDB <code>examples/leveldb</code> and for SQlite <code>examples/sqlitedb</code></td>
 </tr>


<tr>
 <td><code>KORE_NODE_KEY_DERIVATOR</code></td>
 <td><code>Key derivator</code> to use</td>
 <td><code>Ed25519</code> or <code>Secp256k1</code></td>
 <td><code>Ed25519</code></td>
 </tr>
 <tr>
 <td><code>KORE_NODE_DIGEST_DERIVATOR</code></td>
 <td><code>Digest derivator</code> to use</td>
 <td><code>Blake3_256</code>, <code>Blake3_512</code>, <code>SHA2_256</code>, <code>SHA2_512</code>, <code>SHA3_256</code> or <code >SHA3_512</code></td>
 <td><code>Blake3_256</code></td>
 </tr>
 <tr>
 <td><code>KORE_NODE_REPLICATION_FACTOR</code></td>
 <td>Percentage of network nodes that receive protocol messages in an iteration</td>
 <td>Float value</td>
 <td><code>0.25</code></td>
 </tr>
 <tr>
 <td><code>KORE_NODE_TIMEOUT</code></td>
 <td>Waiting time to be used between protocol iterations</td>
 <td>Unsigned integer value</td>
 <td><code>3000</code></td>
 </tr>
 <tr>
 <td><code>KORE_NODE_PASSVOTATION</code></td>
 <td>Node behavior in the approval phase</td>
 <td>Unsigned integer value, 1 to always approve, 2 to always deny, another value for manual approval</td>
 <td><code>0</code></td>
 </tr>
 <tr>
 <td><code>KORE_NODE_SMARTCONTRACTS_DIRECTORY</code></td>
 <td>Directory where the subjects' contracts will be stored</td>
 <td>Directory where the subjects' contracts will be stored</td>
 <td><code>Contracts</code></td>
 </tr>


 <tr>
 <td><code>KORE_NETWORK_PORT_REUSE</code></td>
 <td>True to configure port reuse for local sockets, which involves reusing listening ports for outgoing connections to improve NAT traversal capabilities.</td>
 <td>Boolean Value</td>
 <td><code>false</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_USER_AGENT</code></td>
 <td>The user agent</td>
 <td>The user agent</td>
 <td><code>kore-node</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_NODE_TYPE</code></td>
 <td>Node type</td>
 <td>Bootstrap, Addressable or Ephemeral</td>
 <td><code>Bootstrap</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_LISTEN_ADDRESSES</code></td>
 <td>Addresses where the node will listen</td>
 <td>Addresses where the node will listen</td>
 <td><code>/ip4/0.0.0.0/tcp/0</code></td>
 </tr>


<tr>
 <td><code>KORE_NETWORK_ROUTING_BOOT_NODES</code></td>
 <td>Addresses of the Boot Nodes in the P2P network to which we will connect to become part of the network</td>
 <td>Addresses of the Boot Nodes, where if it has more than one address it will be separated with a <code>_</code> and the addresses are separated from the <code>Peer-ID</code> of the node using <code> /p2p/</code></td>
 <td></td>

 </tr>
 <tr>
 <td><code>KORE_NETWORK_ROUTING_DHT_RANDOM_WALK</code></td>
 <td>True to enable <code>random walk</code> in Kademlia DHT</td>
 <td>Boolean Value</td>
 <td><code>true</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_ROUTING_DISCOVERY_ONLY_IF_UNDER_NUM</code></td>
 <td>Number of active connections for which we interrupt the discovery process</td>
 <td>Number of active connections</td>
 <td><code>u64::MAX</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_ROUTING_ALLOW_NON_GLOBALS_IN_DHT</code></td>
 <td>True if non-global addresses are allowed in the DHT</td>
 <td>Boolean Value</td>
 <td><code>false</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_ROUTING_ALLOW_PRIVATE_IP</code></td>
 <td>If the address of a node is false, it cannot be private</td>
 <td>Boolean Value</td>
 <td><code>false</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_ROUTING_ENABLE_MDNS</code></td>
 <td>True to activate mDNS</td>
 <td>Boolean Value</td>
 <td><code>true</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_ROUTING_KADEMLIA_DISJOINT_QUERY_PATHS</code></td>
 <td>When enabled, the number of separate paths used is equal to the configured parallelism</td>
 <td>Boolean Value</td>
 <td><code>true</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_ROUTING_KADEMLIA_REPLICATION_FACTOR</code></td>
 <td>The replication factor determines how many closest peers a record is replicated to</td>
 <td>Unsigned integer value greater than 0</td>
 <td><code>false</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_ROUTING_PROTOCOL_NAMES</code></td>
 <td>Protocols supported by the node</td>
 <td>Protocols supported by the node</td>
 <td><code>/kore/routing/1.0.0</code></td>
 </tr>

<tr>
 <td><code>KORE_NETWORK_TELL_MESSAGE_TIMEOUT_SECS</code></td>
 <td>Message waiting time</td>
 <td>Number of seconds</td>
 <td><code>10</code></td>
 </tr>
 <tr>
 <td><code>KORE_NETWORK_TELL_MAX_CONCURRENT_STREAMS</code></td>
 <td>Maximum number of simultaneous transmissions</td>
 <td>Unsigned integer value</td>
 <td><code>100</code></td>
 </tr>
 </table>

## .json File
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

## .toml File
```toml
[kore.network]
user_agent = "Kore2.0"
node_type = "Addressable"
port_reuse = true
listen_addresses = ["/ip4/127.0.0.1/tcp/50000","/ip4/127.0.0.1/tcp/50001","/ip4/127.0.0.1/tcp/50002"]
        
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

## .yaml File
```yaml
kore:
  network:
    user_agent: "Kore2.0"
    node_type: "Addressable"
    listen_addresses:
      - "/ip4/127.0.0.1/tcp/50000"
      - "/ip4/127.0.0.1/tcp/50001"
      - "/ip4/127.0.0.1/tcp/50002"
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