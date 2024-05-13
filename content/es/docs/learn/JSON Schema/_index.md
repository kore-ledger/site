---
title: Aprende JSON Schema
linkTitle: JSON Schema
date: 2024-04-26
weight: 5
description: Especificación y ejemplos de JSON Schema.
---
El JSON Schema [especificación](https://json-schema.org/specification.html) está en [estado BORRADOR en el IETF](https://json-schema.org/specification-links.html), sin embargo, se utiliza ampliamente en la actualidad y prácticamente se considera un estándar de facto.

JSON Schema establece un conjunto de reglas que modelan y validan una estructura de datos. El siguiente ejemplo define un esquema que modela una estructura de datos simple con 2 campos: `id` y `value`. También se indica que el `id` es obligatorio y que no se permiten campos adicionales.

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": [
    "id"
  ],
  "properties": {
    "id": {"type":"string"},
    "value": {"type":"integer"}
  }
}
```

{{< alert type="success" title="JSON OBJECT CORRECTO">}}
```json
{
    "id": "id_1",
    "value": 23
}
```
{{< /alert >}}



{{< alert type="danger" title="JSON OBJECTS INCORRECTOS">}}
```json
{
    "value": 3 // id no está definida y es obligatoria
}
```
```json
{
    "id": "id_3",
    "value": 3,
    "count": 5    // no se permiten propiedades adicionales
}
```
{{< /alert >}}

{{< alert type="info" title="JSON SCHEMA ONLINE VALIDATOR">}}
Puede probar este comportamiento utilizando este [validador de JSON Schema interactivo y en línea](https://www.jsonschemavalidator.net/s/oyxObQeM).
{{< /alert >}}

## Creando un JSON Schema

El siguiente ejemplo no es de ninguna manera definitivo de todo el valor que puede proporcionar el JSON Schema. Para ello necesitarás profundizar en la propia especificación. Obtenga más información en [especificación del JSON Schema](https://json-schema.org/specification.html).

Supongamos que estamos interactuando con el registro de un automóvil basado en JSON. Esta matrícula tiene un coche que tiene:

* Un identificador del fabricante: `chassisNumber`
* Identificación del país de registro: `licensePlate`
* Número de kilómetros recorridos: `mileage`
* Un conjunto opcional de etiquetas: `tags`.

Por ejemplo

```json
{
  "chassisNumber": 72837362,
  "licensePlate": "8256HYN",
  "mileage": 60000,
  "tags": [ "semi-new", "red" ]
}
```

Si bien en general es sencillo, el ejemplo deja algunas preguntas abiertas. Éstos son sólo algunos de ellos:

* ¿Qué es `chassisNumber`?
* ¿Se requiere `licensePlate`?
* ¿El `mileage` puede ser menor que cero?
* ¿Todas las `tags` son valores de cadena?

Cuando habla de un formato de datos, desea tener metadatos sobre el significado de las claves, incluidas las entradas válidas para esas claves. **JSON Schema** es un estándar propuesto por el IETF sobre cómo responder esas preguntas sobre datos.

### Iniciando el esquema
Para iniciar una definición de esquema, comencemos con un JSON Schema básico.

Comenzamos con cuatro propiedades llamadas **palabras clave** que se expresan como claves [JSON](https://www.json.org/).

> Sí. el estándar utiliza un documento de datos JSON para describir documentos de datos, que en la mayoría de los casos también son documentos de datos JSON, pero que pueden estar en cualquier otro tipo de contenido como `text/xml`.

* La palabra clave [`$schema`](https://json-schema.org/draft/2020-12/json-schema-core.html#section-8.1.1) indica que este esquema está escrito de acuerdo con un código específico.
* La palabra clave [`$id`](https://json-schema.org/draft/2020-12/json-schema-core.html#section-8.2.1) define un Identificador de recursos uniforme(URI) para el esquema y la base URI con el que se resuelven otras referencias de URI dentro del esquema.
* El [`title`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-9.1) y la [`description`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-9.1) las palabras clave de anotación son solo descriptivas. No añaden restricciones a los datos que se validan. La intención del esquema se expresa con estas dos palabras clave.
* La palabra clave de validación [`type`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.1.1) define la primera restricción en nuestros datos JSON y en este caso tiene que ser un JSON Object.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/car.schema.json",
  "title": "Car",
  "description": "A registered car",
  "type": "object"
}
```

Introducimos las siguientes piezas de terminología cuando iniciamos el esquema:

* [Schema Keyword](https://json-schema.org/draft/2020-12/json-schema-core.html#section-8.1.1): `$schema` and `$id`.
* [Schema Annotations](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-9.1): `title` and `description`.
* [Validation Keyword](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.1.1): `type`.

### Definiendo las propiedades

`chassisNumber` es un valor numérico que identifica de forma única un automóvil. Dado que este es el identificador canónico de una variable, no tiene sentido tener un automóvil sin uno, por lo que es obligatorio.

En términos de JSON Schema, actualizamos nuestro esquema para agregar:

* La palabra clave de validación [`properties`](https://json-schema.org/draft/2020-12/json-schema-core.html#section-10.3.2.1).
* La clave `chassisNumber`.
  * Se anotan las claves del esquema `description` y la palabra clave de validación `type`; cubrimos ambas en la sección anterior.
* La lista de palabras clave de validación [`required`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.5.3) `chassisNumber`.


```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/car.schema.json",
  "title": "Car",
  "description": "A registered car",
  "type": "object",
  "properties": {
    "chassisNumber": {
      "description": "Manufacturer's serial number",
      "type": "integer"
    }
  },
  "required": [ "chassisNumber" ]
}
```

* `licensePlate` es un valor de cadena que actúa como identificador secundario. Como no hay ningún coche sin matrícula, también es obligatorio.
* Dado que la palabra clave de validación `required` es un array de `strings`, podemos anotar varias claves según sea necesario; Ahora incluimos `licensePlate`.


```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/car.schema.json",
  "title": "Car",
  "description": "A registered car",
  "type": "object",
  "properties": {
    "chassisNumber": {
      "description": "Manufacturer's serial number",
      "type": "integer"
    },
    "licensePlate": {
      "description": "Identification of country of registration",
      "type": "string"
    }
  },
  "required": [ "chassisNumber", "licensePlate" ]
}
```

### Profundizando con las propiedades

Según el registro de coches, no pueden tener `mileage` negativo.

* La clave `mileage` se agrega con la anotación de esquema `description` habitual y las palabras clave de validación de `type` cubiertas anteriormente. También se incluye en el array de claves definida por la palabra clave de validación `required`.
* Especificamos que el valor de `mileage` debe ser mayor o igual a cero usando el [`minimum`](https://json-schema.org/draft/2020-12/json-schema-validation.html#sección-6.2.5) palabra clave de validación.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/car.schema.json",
  "title": "Car",
  "description": "A registered car",
  "type": "object",
  "properties": {
    "chassisNumber": {
      "description": "Manufacturer's serial number",
      "type": "integer"
    },
    "licensePlate": {
      "description": "Identification of country of registration",
      "type": "string"
    },
    "mileage": {
      "description": "Number of kilometers driven",
      "type": "number",
      "minimum": 0
    }
  },
  "required": [ "chassisNumber", "licensePlate", "mileage" ]
}
```

A continuación, llegamos a la clave `tags`.

El registro de vehículos ha establecido lo siguiente:

* Si hay `tags` debe haber al menos una etiqueta,
* Todas las `tags` deben ser únicas; no hay duplicación dentro de un solo automóvil.
* Todas las `tags` deben ser de texto.
* Las `tags` son bonitas pero no es necesario que estén presentes.

Por lo tanto:

* La clave `tags` se agrega con las anotaciones y palabras clave habituales.
* Esta vez la palabra clave de validación `type` es `array`.
* Introducimos la palabra clave de validación [`items`](https://json-schema.org/draft/2020-12/json-schema-core.html#section-10.3.1.2) para que podamos definir lo que aparece en el formación. En este caso: valores de `string` a través de la palabra clave de validación `type`.
* La palabra clave de validación [`minItems`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.4.2) se utiliza para garantizar que haya al menos una elemento en el array.
* La palabra clave de validación [`uniqueItems`](https://json-schema.org/draft/2020-12/json-schema-validation.html#section-6.4.3) indica que todos los elementos del array deben ser únicos entre sí.
* No agregamos esta clave al array de palabras clave de validación `required` porque es opcional.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/car.schema.json",
  "title": "Car",
  "description": "A registered car",
  "type": "object",
  "properties": {
    "chassisNumber": {
      "description": "Manufacturer's serial number",
      "type": "integer"
    },
    "licensePlate": {
      "description": "Identification of country of registration",
      "type": "string"
    },
    "mileage": {
      "description": "Number of kilometers driven",
      "type": "number",
      "minimum": 0
    },
    "tags": {
      "description": "Tags for the car",
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    }
  },
  "required": [ "chassisNumber", "licensePlate", "mileage" ]
}
```

### Anidar estructuras de datos

Hasta este punto hemos estado tratando con un esquema muy plano: sólo un nivel. Esta sección demuestra estructuras de datos anidadas.

* La clave `dimensions` se agrega usando los conceptos que hemos descubierto anteriormente. Dado que la palabra clave de validación `type` es `object`, podemos usar la palabra clave de validación `properties` para definir una estructura de datos anidada.
  * Omitimos la palabra clave de anotación `description` por motivos de brevedad en el ejemplo. Si bien normalmente es preferible realizar anotaciones exhaustivas, en este caso la estructura y los nombres de las claves son bastante familiares para la mayoría de los desarrolladores.
* Notará que el alcance de la palabra clave de validación `required` se aplica a la clave de dimensiones y no más allá.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/car.schema.json",
  "title": "Car",
  "description": "A registered car",
  "type": "object",
  "properties": {
    "chassisNumber": {
      "description": "Manufacturer's serial number",
      "type": "integer"
    },
    "licensePlate": {
      "description": "Identification of country of registration",
      "type": "string"
    },
    "mileage": {
      "description": "Number of kilometers driven",
      "type": "number",
      "minimum": 0
    },
    "tags": {
      "description": "Tags for the car",
      "type": "array",
      "items": {
        "type": "string"
      },
      "minItems": 1,
      "uniqueItems": true
    },
    "dimensions": {
      "type": "object",
      "properties": {
        "length": {
          "type": "number"
        },
        "width": {
          "type": "number"
        },
        "height": {
          "type": "number"
        }
      },
      "required": [ "length", "width", "height" ]
    }
  },
  "required": [ "chassisNumber", "licensePlate", "mileage" ]
}
```

### Echando un vistazo a los datos de nuestro JSON Schema

Ciertamente hemos ampliado el concepto de automóvil desde nuestros primeros datos de muestra (desplácese hacia arriba). Echemos un vistazo a los datos que coinciden con el JSON Schema que hemos definido.

```json

  {
    "chassisNumber": 1,
    "licensePlate": "8256HYN",
    "mileage": 60000,
    "tags": [ "semi-new", "red" ],
    "dimensions": {
      "length": 4.005,
      "width": 1.932,
      "height": 1.425
    }
  }
```

{{< alert type="info" title="INFORMACIÓN">}}
Este tutorial se basa en el tutorial de JSON Schema ["Cómo comenzar paso a paso"](https://json-schema.org/learn/getting-started-step-by-step.html). Si desea obtener más información sobre JSON Schema, visite el [sitio web de JSON-Schema](https://json-schema.org) para obtener el tutorial original y otros recursos.
{{< /alert >}}