---
title: Contratos en Kore
linkTitle: Introducción
date: 2023-11-29
weight: 1
description: Introducción a la programación de contratos en Kore Ledger.
---

## Contratos y esquemas
En Kore, cada sujeto está asociado a un [esquema](../../../getting-started/concepts/schema/_index.md) que determina, fundamentalmente, sus propiedades. El valor de estas propiedades puede cambiar a lo largo del tiempo mediante la emisión de eventos, siendo necesario, en consecuencia, establecer el mecanismo a través del cual estos eventos realizan dicha acción. En la práctica, esto se gestiona a través de una serie de reglas que constituyen lo que llamamos un [contrato](../../../getting-started/concepts/contracts/_index.md).

En consecuencia, podemos decir que un esquema tiene siempre asociado un contrato que regula su evolución. La especificación de ambos se realiza en la gobernanza.

## Entradas y salidas
Los contratos, aunque especificados en la gobernanza, sólo son ejecutados por aquellos nodos que tienen capacidades de evaluación y han sido definidos como tales en las reglas de gobernanza. Es importante señalar que Kore permite que un nodo actúe como [evaluador](../../../getting-started/concepts/roles/_index.md/#evaluador) de un sujeto incluso si **no posee la cadena de eventos del sujeto**, es decir, incluso si no es [testigo](../../../getting-started/concepts/roles/_index.md/#testigo). Esto ayuda a reducir la carga en estos nodos y contribuye al rendimiento general de la red.

Para lograr la correcta ejecución de un contrato, recibe tres entradas: el estado actual del sujeto, el evento a procesar y una flag que indica si la solicitud del evento ha sido emitida o no por el propietario del sujeto. Una vez recibidos estos insumos, el contrato debe utilizarlos para generar un nuevo estado válido. Tenga en cuenta que la lógica de esto último recae enteramente en el programador del contrato. El programador del contrato también determina qué eventos son válidos, es decir, decide la **familia de eventos que se utilizará**. Así, el contrato sólo aceptará eventos de esta familia, rechazando todos los demás, y que el programador pueda adaptar, en estructura y datos, a las necesidades de su caso de uso. Como ejemplo, supongamos un sujeto que representa el perfil de un usuario con su información de contacto así como su identidad; un evento de la familia podría ser aquel que solo actualice el número de teléfono del usuario. Por otro lado, la flag se puede utilizar para restringir ciertas operaciones únicamente al propietario del sujeto, ya que la ejecución del contrato se realiza tanto por los eventos que genera por sí mismo como por invocaciones externas.

Cuando un contrato termina de ejecutarse, genera tres resultados:

  * **Flag de éxito**: Mediante un booleano indica si la ejecución del contrato ha sido exitosa, es decir, si el evento debe provocar un cambio de estado del sujeto. Este indicador se establecerá en falso siempre que se produzca un error al obtener los datos de entrada del contrato o si la lógica del contrato así lo dicta. En otras palabras, se puede y se debe indicar explícitamente si la ejecución puede considerarse exitosa o no. Esto es importante porque estas decisiones dependen completamente del caso de uso, del cual Kore se abstrae en su totalidad. Así, por ejemplo, el programador podría determinar que si, tras la ejecución de un evento, el valor de una de las propiedades del sujeto ha superado un umbral, el evento no puede considerarse válido.

   * **Estado final**: Si el evento ha sido procesado exitosamente y la ejecución del contrato ha sido marcada como exitosa, entonces devuelve el nuevo estado generado, que en la práctica podría ser el mismo que el anterior. Este estado se validará con el esquema definido en la gobernanza para garantizar la integridad de la información. Si la validación no es exitosa, se cancela el indicador de éxito.

   * **Flag de aprobación**: el contrato debe decidir si un evento debe [aprobarse](../../../getting-started/concepts/roles/_index.md/#aprobador) o no. Nuevamente, esto dependerá enteramente del caso de uso, siendo responsabilidad del programador establecer cuándo es necesario. Así, la aprobación se fija como una fase facultativa pero también **condicional**.

{{< alert type="warning" title="CAUTION" >}}Los contratos Kore funcionan sin ningún estado asociado. Toda la información con la que pueden trabajar es la que reciben como entrada. Esto significa que el valor de las variables no se retiene entre ejecuciones, marcando una diferencia importante respecto a los contratos inteligentes de otras plataformas, como Ethereum. {{< /alert >}}

## Ciclo de vida
{{< imgproc cycle Fit "2000x600" >}}
{{< /imgproc >}}

### Desarrollo
Los contratos se definen en proyectos locales de Rust, el único lenguaje permitido para escribirlos. Estos proyectos, que debemos definir como bibliotecas, deben importar el **SDK** de los contratos disponibles en los repositorios oficiales y, además, deben seguir las indicaciones especificadas en ["cómo escribir un contrato"](../programming-contracts/_index.md/#tu-primer-contrato).

### Distribución
Una vez definido el contrato, se debe incluir en una gobernanza y asociar a un esquema para que pueda ser utilizado por los nodos de una red. Para ello es necesario realizar una operación de actualización de gobernanza en la que se incluye el contrato en el apartado correspondiente y se codifica en **base64**. Si se ha definido una batería de prueba, no es necesario incluirla en el proceso de codificación.

{{< alert type="warning" title="CAUTION" >}}Dado que los nodos Kore están a cargo de la compilación del contrato, es necesario que la **base64** incluya el contrato en su totalidad. En otras palabras, el contrato debe redactarse íntegramente en un único archivo y codificado.

Esta es una limitación actual y se espera que haya otras alternativas disponibles en el futuro. {{< /alert >}}

### Compilación
Si la solicitud de actualización tiene éxito, el estado de gobernanza cambiará y los nodos evaluadores compilarán el contrato como un módulo de **Web Assembly**, lo serializarán y lo almacenarán en su base de datos. Se trata de un proceso automatizado y autogestionado, por lo que no requiere la intervención del usuario en ninguna etapa del proceso.

Después de este paso, el contrato puede ser utilizado.

### Ejecución
La ejecución del contrato se realizará en un **Web Assembly Runtime**, aislando su ejecución del resto del sistema. Esto evita el mal uso de sus recursos, añadiendo una capa de seguridad.

## Rust y WASM
Web Assembly se utiliza para la ejecución de contratos debido a sus características:

  * Alto rendimiento y eficiencia.
  * Ofrece un entorno de ejecución aislado y seguro.
  * Tiene una comunidad activa.
  * Permite compilar desde varios lenguajes, muchos de ellos con una base de usuarios considerable.
  * Los módulos resultantes de la compilación, una vez optimizados, son ligeros.

Se eligió Rust como lenguaje para escribir contratos de Kore debido a su capacidad de compilar en Web Assembly, así como a sus capacidades y especificaciones, la misma razón que motivó su elección para el desarrollo de Kore. Específicamente, Rust es un lenguaje centrado en escribir código seguro y de alto rendimiento, los cuales contribuyen a la calidad del módulo Web Assembly resultante. Además, el lenguaje cuenta de forma nativa con recursos para crear pruebas, lo que favorece la prueba de contratos.