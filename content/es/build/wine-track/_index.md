---
title: Trazabilidad del vino
pagination_next: build/assets-traceability/running-node
date: 2024-05-02
description: Aplicar la tecnología Kore-ledger para trazar el vino
weight: 2
---
Este tutorial cubrirá una serie de conceptos avanzados dentro de Kore-ledger, en los que aprenderemos:

1. Cómo realizar invocaciones externas a métodos de un contrato.
2. Cómo transferir la propiedad de un sujeto a otro participante.
3. Cómo funciona la segmentación de sujetos por espacio de nombres.
4. Cómo modificar las políticas de votación sobre un sujeto.
5. Cómo finalizar el seguimiento del ciclo de vida de un sujeto.

## Descripción del caso de uso

En este tutorial, implementaremos un sistema para rastrear el ciclo de vida de un producto alimenticio, específicamente un vino premium de alta calidad. El objetivo es certificar la calidad del vino a los compradores finales en base a ciertos parámetros, como la certificación orgánica y el control óptimo de la temperatura.

Para lograr este objetivo será necesario el apoyo de diferentes participantes, cada uno de ellos responsable de llevar a cabo diversas acciones requeridas para el buen funcionamiento de este ciclo de vida. Entre ellos podemos distinguir:

* **Organización de Productores de Vino (WPO)**: Responsable de formalizar el caso de uso de trazabilidad.
* **Vinos Premium**: Personal autorizado encargado de iniciar el seguimiento de las botellas de vino.
* **Organización Mundial de la Alimentación (WFO)**: Administrador de los cambios realizados en los temas de casos de uso y tipo vino.
* **Organización Española de la Alimentación (OFS)**: Responsable de validar los cambios en la materia vino.
* **Ciudadano**: Entidad externa a quien se transferirá la propiedad de una botella de vino.

A lo largo de este tutorial se proporcionarán instrucciones detalladas y los comandos necesarios para realizar cada paso. ¡Comencemos con el desarrollo de este caso de uso para rastrear el ciclo de vida del vino en Kore