---
title: Herramientas
date: 2024-04-29
weight: 7
description: Utilidades para trabajar con Kore Node
---
Kore Tools son un grupo de utilidades desarrolladas para facilitar el uso de Kore Node, especialmente durante las pruebas y la creación de prototipos. En este apartado profundizaremos en ellos y en cómo se pueden obtener y utilizar.

## Instalación

Existen diferentes formas en las que el usuario puede adquirir estas herramientas. La primera y más básica es la generación de sus binarios mediante la compilación de su código fuente, el cual se puede obtener a través de los repositorios públicos. Sin embargo, recomendamos hacer uso de las imágenes de Docker disponibles junto con una serie de scripts que abstraen el uso de estas imágenes, de modo que el usuario no necesite compilar el código.

### Compilando binarios

```bash
$ git clone git@github.com:kore-ledger/kore-tools.git
$ cd kore-tools
$ sudo apt install -y libprotobuf-dev protobuf-compiler cmake
$ cargo install --locked --path keygen
$ cargo install --locked --path patch
$ cargo install --locked --path sign
$ cargo install --locked --path control
$ kore-keygen -h
$ kore-sign -h
$ kore-patch -h
```

{{< alert type="success"  title="TIP" >}}
Estas utilidades pueden usarse con relativa frecuencia, por lo que recomendamos que incluya los scripts en el PATH para simplificar su uso.{{< /alert >}}

## Kore Keygen

Cualquier nodo Kore necesita material criptográfico para funcionar. Para ello es necesario generarlo externamente y luego indicarlo al nodo, ya sea mediante variables de entorno o mediante parámetros de entrada. La utilidad Kore Keygen satisface esta necesidad permitiendo, de forma sencilla, la generación de este material criptográfico. En concreto, su ejecución permite obtener una ***clave privada*** en formato hexadecimal, así como el ***identificador (controller ID)*** que es el identificador a nivel Kore en el que su formato incluye la clave pública. , más información del esquema criptográfico utilizado (puede obtener más información en el siguiente **[link](../../getting-started/concepts/identifiers/)**).

```bash
# Generate pkcs8 encrpty with pkcs5(ED25519)
kore-keygen -p a
kore-keygen -p a -r keys-Ed25519/private_key.der
kore-keygen -p a -r keys-Ed25519/public_key.der -d public-key
# Generate pkcs8 encrpty with pkcs5(SECP256K1)
kore-keygen -p a -m secp256k1
kore-keygen -p a -r keys-secp2561k/private_key.der -m secp256k1
kore-keygen -p a -r keys-secp2561k/public_key.der -m secp256k1 -d public-key
```

{{< alert type="info"  title="INFO" >}}
X y las otras herramientas aceptan diferentes argumentos de ejecución. Para obtener más información, intente **--help**, por ejemplo:
```bash
kore-keygen --help
```
{{< /alert >}}


## Kore Sign

Esta es una utilidad que tiene como objetivo facilitar la ejecución de invocaciones externas. Para proporcionar contexto, [una invocación externa](../../getting-started/concepts/events/) es el proceso mediante el cual un nodo propone un cambio a un sujeto de la red que no controla, es decir, de del que no es propietario. También existen una serie de reglas que regulan qué usuarios de la red tienen la capacidad de realizar estas operaciones. En cualquiera de los casos, el nodo invocante deberá presentar, además de los cambios que desee sugerir, una firma válida que acredite su identidad.

Kore Sign permite precisamente esto último, generando la firma necesaria para acompañar la solicitud de cambios. Además, como la utilidad está estrictamente diseñada para tal escenario, lo que realmente devuelve su ejecución es la estructura de datos completa (en formato JSON) que debe entregarse a otros nodos de la red para que consideren la solicitud.

Para el correcto funcionamiento de la utilidad es necesario pasar como argumentos tanto los datos de solicitud del evento como la clave privada en formato hexadecimal a utilizar.

```bash
# Ejemplo uso básico
kore-sign --id-private-key 2a71a0aff12c2de9e21d76e0538741aa9ac6da9ff7f467cf8b7211bd008a3198 '{"Transfer":{"subject_id":"JjyqcA-44TjpwBjMTu9kLV21kYfdIAu638juh6ye1gyU","public_key":"E9M2WgjXLFxJ-zrlZjUcwtmyXqgT1xXlwYsKZv47Duew"}}'
```

```json
// Salida en fomato json
{
  "request": {
    "Transfer": {
      "subject_id": "JjyqcA-44TjpwBjMTu9kLV21kYfdIAu638juh6ye1gyU",
      "public_key": "E9M2WgjXLFxJ-zrlZjUcwtmyXqgT1xXlwYsKZv47Duew"
    }
  },
  "signature": {
    "signer": "EtbFWPL6eVOkvMMiAYV8qio291zd3viCMepUL6sY7RjA",
    "timestamp": 1717684953822643000,
    "content_hash": "J1XWoQaLArB5q6B_PCfl4nzT36qqgoHzG-Uh32L_Q3cY",
    "value": "SEYml_XhryHvxRylu023oyR0nIjlwVCyw2ZC_Tgvf04W8DnEzP9I3fFpHIc0eHrp46Exk8WIlG6fT1qp1bg1WgAg"
  }
}
```

{{< alert type="warning"  title="CAUTION" >}}
Es importante tener en cuenta que actualmente solo se admiten claves privadas del algoritmo ***ED25519***
{{< /alert >}}


{{< alert type="success"  title="TIP" >}}
Si necesita pasar la solicitud de evento a Kore-sign a través de una pipe en lugar de como argumento, puede usar [xargs](https://man7.org/linux/man-pages/man1/xargs.1.html ) utilidad. Por ejemplo,
```bash
echo '{"Transfer":{"subject_id":"JjyqcA-44TjpwBjMTu9kLV21kYfdIAu638juh6ye1gyU","public_key":"E9M2WgjXLFxJ-zrlZjUcwtmyXqgT1xXlwYsKZv47Duew"}}' | xargs -0 -I {} kore-sign --id-private-key 2a71a0aff12c2de9e21d76e0538741aa9ac6da9ff7f467cf8b7211bd008a3198 {}
```
{{< /alert >}}

## Kore Patch
Actualmente, el [contrato que maneja los cambios de gobernanza](../governance/schema/) solo permite un tipo de evento que incluye un **JSON Patch**.

JSON Patch es un formato de datos que representa cambios en las estructuras de datos JSON. Así, partiendo de una estructura inicial, tras aplicar el JSON-Patch se obtiene una estructura actualizada. En el caso de Kore, el JSON Patch define los cambios que se realizarán en la estructura de datos que representa la gobernanza cuando es necesario modificarla. Kore Patch nos permite calcular el JSON Patch de forma sencilla si tenemos la gobernanza original y la gobernanza modificada.

```bash
# Ejemplos de uso básico
kore-patch '{"members":[]}' '{"members":[{"id":"EtbFWPL6eVOkvMMiAYV8qio291zd3viCMepUL6sY7RjA","name":"ACME"}]}'
```

```json
// Salida en formato json
[
  {
    "op": "add",
    "path": "/members/0",
    "value": {
      "id": "EtbFWPL6eVOkvMMiAYV8qio291zd3viCMepUL6sY7RjA",
      "name": "ACME"
    }
  }
]
```

Una vez que se obtiene el JSON Patch, se puede incluir en una solicitud de evento que se enviará al propietario del gobierno.

{{< alert type="success"  title="TIP" >}}
Aunque Kore Patch se desarrolló para facilitar modificaciones en la gobernanza de Kore, en realidad es solo una utilidad que genera un JSON PATH a partir de 2 objetos JSON, por lo que puede usarse para otros fines.
{{< /alert >}}

## Control
Herramienta para proporcionar una lista de permitidos y bloqueados a los nodos. Dispone de 3 variables de entorno `SERVERS` que permite indicar cuantos servidores quieres y en que puerto quieres que escuchen y dos listas `ALLOWLIST` y `BLOCKLIST`. Estas listas seran las por defecto pero se dispone de una ruta `/allow` y `/block` con PUT y GET para modificarlas. 

```bash
export SERVERS="0.0.0.0:3040,0.0.0.0:3041"
export ALLOWLIST="172.10.10.2"
control
```
Salida
```bash
Server started at: 0.0.0.0:3040
Server started at: 0.0.0.0:3041
```