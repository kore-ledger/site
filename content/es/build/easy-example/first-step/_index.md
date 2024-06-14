---
title: Levantar el primer nodo
description: Pasos para configurar el primer nodo Kore
weight: 1
---
Para lanzar un nodo kore, debe ejecutar el binario [kore-http](https://github.com/kore-ledger/kore-http), ubicado en la carpeta cliente del repositorio. Para utilizar su imagen Docker, hay que ir a la página de [dockerhub](https://hub.docker.com/repositories/koreadmin).

Si no disponemos de la imagen o no tenemos la última versión, descárgala con:

```bash
docker pull koreadmin/kore-http:0.5-sqlite
```

Podemos ejecutarlo lanzándolo:

```bash
docker run koreadmin/kore-http:0.5-sqlite
```


Sin embargo, esto nos dará un error, ya que debemos especificar obligatoriamente ciertos aspectos de la configuración.

Podemos generar nosotros la clave criptográfica o dejar que el nodo la genere. En este tutorial el nodo se encargara de esa tarea.
-  Lo primero que debemos añadir obligatoriamente a la configuración es la clave privada. Podemos generar una válida utilizando kore-tools, que se encuentra en el mismo repositorio que el cliente en el directorio [kore-tools](https://github.com/kore-ledger/kore-tools). En concreto, su binario keygen, que creará el material criptográfico necesario para el nodo.

{{< alert type="warning"  title="PRECAUCIÓN" >}}
Es importante resaltar que se debe utilizar el mismo esquema criptográfico al generar la clave y agregarla al cliente, keygen y cliente usan `ed25519` por defecto.
{{< /alert >}}


- Una vez tenemos la imagen debemos generar un archivo de configuración indicando lo siguiente:
. `listen_addresses` Dirección donde va a escuchar el nodo para comunicarse con otros nodos
. `boot_nodes` un vector de nodos conocidos, como es el primer nodo lo dejaremos vacio

```json
// config.json
{
    "kore": {
      "network": {
          "listen_addresses": ["/ip4/0.0.0.0/tcp/50000"],
          "routing": {
            "boot_nodes": [""]
          }
      }
    }
  }
```
Para levantar el nodo debemos indicar desde que puerto de nuestra máquina podemos acceder a la API, además del puerto donde escuchara el nodo. Po último importante indicar el archivo de configuración.
```bash
docker run -p 3000:3000 -p 50000:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config.json:/config.json koreadmin/kore-http:0.5-sqlite
```


{{< alert type="info"  title="INFORMACIÓN" >}}
Para conocer más sobre las variables de entorno vaya a la sección de [configuración](../../../docs/learn/kore%20node/kore%20client%20http/configuration/)
{{< /alert >}}