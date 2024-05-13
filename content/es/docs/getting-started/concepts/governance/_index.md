---
title: Gobernanza
description: Descripción de la gobernanza.
weight: 1
resources:
- src: "diagram.png"
  params: 
    byline: "*Figure 2: Jerarquía de relaciones .*"
- src: "governance.png"
  params: 
    byline: "*Figure 1: Componentes de la gobernanza.*"
---

La **gobernanza** es el conjunto de definiciones y reglas que establecen cómo los diferentes nodos participantes en una red se relacionan con los sujetos de la trazabilidad e interaccionan entre si. Los componentes de las **gobernanza** son:

- Los nodos participantes.
- El esquema de los atributos de los sujetos.
- El contrato para aplicar los eventos que modifican el estado del sujeto.
- Los permisos de cada participante para participar en la red.

{{% imgproc governance Fit "1800x400"  %}}
{{% /imgproc %}}

## Miembros
Estas son las personas, entidades u organizaciones que participan en la **gobernanza** y por tanto pueden ser parte de los casos de uso que se soportan. Cada miembro declara un identificador único que representa el material criptográfico con el que operará en la red, su [identidad](../identifiers/) .
## Esquemas
Los [esquemas](../schema/) son las estructuras de datos que modelan la información almacenada en los **sujetos**. Dentro de una **gobernanza**, se pueden definir diferentes **esquemas** para admitir diferentes casos de uso. Cuando se crea un sujeto, define a qué gobierno está asociado y qué esquema utilizará. Además, cada esquema tiene asociado un **contrato inteligente** que permitirá modificar el estado de los sujetos.
## Roles
Los [roles](../roles/) representan grupos de participantes con algún tipo de interés común en un conjunto de sujetos. Los **roles** nos permiten asignar permisos sobre estos grupos de sujetos más fácilmente que si tuviéramos que asignarlos individualmente a cada miembro del gobierno.
## Políticas
Las **políticas** definen las condiciones específicas bajo las cuales se afecta el ciclo de vida de un evento, como el número de firmas necesarias para llevar a cabo los procesos de evaluación, aprobación y validación. A esto se le llama quórum.
La configuración de **gobernanza** permite la definición de [distintos tipos de quórum] , más o menos restrictivos, dependiendo de la necesidad del caso de uso.

{{< alert type="warning" title="ATENCIÓN">}}Como sabemos, el propietario de un sujeto es el único que puede actuar sobre él , y por tanto tiene absoluta libertad para modificarlo. La gobernanza no puede impedir que los propietarios maliciosos intenten realizar acciones prohibidas, pero sí define las condiciones bajo las cuales el resto de participantes ignoran o penalizan estos comportamientos maliciosos. {{< /alert >}}

## La gobernanza como sujeto
La **gobernanza** es un sujeto de trazabilidad, dado que puede evolucionar y adaptarse a las necesidades de negocio, y por tanto su ciclo de vida también esta determinado por una **gobernanza**, lo que dota a nuestra infraestructura de transparencia y confianza para todos los participantes.

## Jerarquía de relaciones
La gobernanza define las reglas a seguir en un caso de uso. Sin embargo, el titular de un nodo no está limitado a participar en un único caso de uso. Combine esto con la estructura de gobernanza y obtendrá la siguiente jerarquía de relaciones:

- Una gobernanza:
  - definir uno o varios: miembros, políticas, esquemas y roles.
  - admite uno o varios casos de uso.
- Un participante (persona, entidad u organización):
  - tiene una [identidad](../identifiers/) , y la identidad actúa como miembro de una gobernanza.
  - ejecutar un nodo que almacena muchos sujetos.
  - está involucrado en uno o varios casos de uso.
- Un sujeto:
  - depende de una gobernanza.
  - está modelado por un esquema.
  - tiene espacios de nombres.

{{% imgproc diagram Fit "1800x700"  %}}
{{% /imgproc %}}