---
title: Levantar el primer nodo
description: Pasos para configurar el primer nodo Kore
weight: 1
---
Para lanzar un nodo kore, debe ejecutar el binario [kore-client](https://github.com/kore-ledger/kore-client), ubicado en la carpeta cliente del repositorio. Para utilizar su imagen Docker, hay que ir a la página de [dockerhub](https://hub.docker.com/r/kore-ledger/kore-client).

Si no disponemos de la imagen o no tenemos la última versión, descárgala con:

```bash
docker pull kore-ledger/kore-client:0.3
```

Podemos ejecutarlo lanzándolo:

```bash
docker run kore-ledger/kore-client:0.3
```

Sin embargo, esto nos dará un error, ya que debemos especificar obligatoriamente ciertos aspectos de la configuración.

Lo primero que debemos añadir obligatoriamente a la configuración es la clave privada. Podemos generar una válida utilizando kore-tools, que se encuentra en el mismo repositorio que el cliente en el directorio kore-tools, y en [dockerhub](https://hub.docker.com/r/kore-ledger/kore-tools). En concreto, su binario keygen, que creará el material criptográfico necesario para el nodo. Una salida sin configuración extra nos dará un resultado como:

```bash
PRIVATE KEY ED25519 (HEX): f78e9b42c3f265d0c5bf613f47bf4fb8fa3f18b3b38dd4e90ca7eed497e3394a
CONTROLLER ID ED25519: EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4
PeerID: 12D3KooWLXexpg81PjdjnrhmHUxN7U5EtfXJgr9cahei1SJ9Ub3B
```

Lo que debemos agregar a la variable de entorno KORE_SECRET_KEY es la clave privada, en este caso:`f78e9b42c3f265d0c5bf613f47bf4fb8fa3f18b3b38dd4e90ca7eed497e3394a`.

{{< alert type="warning"  title="PRECAUCIÓN" >}}
Es importante resaltar que se debe utilizar el mismo esquema criptográfico al generar la clave y agregarla al cliente, keygen y cliente usan `ed25519` por defecto.
{{< /alert >}}

Otra variable de entorno que debemos añadir es **KORE_HTTP**, que nos permitirá lanzar el servidor http para poder utilizar la API REST. Para esto, debes configurar **KORE_HTTP=true**.

Una vez que tengamos estas dos variables, podremos lanzar el nodo con la configuración mínima (el puerto **3000** es el predeterminado para el servicio http). Pondremos el nodo en modo informativo usando **RUST_LOG** con el valor **info**, en caso de querer más información podemos usar el valor **debug**. Por último lo pondremos a escuchar en todas las interfaces por el puerto **5000** definiendo la variable **KORE_NETWORK_LISTEN_ADDR**.



```bash
docker run -p 3000:3000 -p 50000:50000 \
-e KORE_ID_PRIVATE_KEY=f78e9b42c3f265d0c5bf613f47bf4fb8fa3f18b3b38dd4e90ca7eed497e3394a \
-e KORE_HTTP=true \
-e KORE_NETWORK_LISTEN_ADDR=/ip4/0.0.0.0/tcp/50000 \
-e RUST_LOG=info \
kore-ledger/kore-client:0.3
```
{{< alert type="info"  title="INFORMACIÓN" >}}
Para conocer más sobre las variables de entorno vaya a la sección de [configuración](../../../docs/learn/kore%20node/kore%20client%20http/configuration/_index.md)
{{< /alert >}}