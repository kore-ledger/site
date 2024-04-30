---
title: Esquema
description: Descripción del esquema.
weight: 4
---

El **esquema** es la estructura del estado contenido en un sujeto.

Los **esquemas** se definen dentro de una **gobernanza** y, por tanto, se distribuyen junto con ella. Diferentes **gobernanzas** pueden definir **esquemas** equivalentes, sin embargo, para todos los efectos, dado que pertenecen a diferentes **gobernanzas**, se consideran **esquemas** diferentes.

Los **esquemas** se componen de 2 elementos:
- Un identificador único. Cada **esquemas** tiene un identificador que permite referenciarlo dentro de la **gobernanzas** en la que está definido. Se pueden definir diferentes **esquemas** dentro de una misma **gobernanzas**. Además, siempre que tengan identificadores diferentes, podrás crear **esquemas** con el mismo contenido.
- Un contenido. Es la estructura de datos utilizada para validar el estado de los sujetos.

```json
{
    "id": {"type":"string"},       
    "content": {"type": "object"}  
}

```

{{< alert type="info" title="INFO">}}
Si desea aprender cómo definir un esquema JSON, visite el siguiente [enlace](../../../learn/json-schema/).
{{< /alert >}}