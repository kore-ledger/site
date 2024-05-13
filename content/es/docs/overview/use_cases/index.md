---
title: Casos de uso
date: 2024-04-26
weight: 14
description: Diferentes casos de uso de trazabilidad con Kore Ledger.
resources:
- src: "smartcity.png"
  params: 
    byline: "*Figura 2: Ciudad inteligente conectada a la red Kore Ledger.*"
- src: "water.png"
  params: 
    byline: "*Figura 1: Ciclo del agua con Kore Ledger.*"
---
Kore ha sido diseñado teniendo en cuenta los casos de uso de trazabilidad. Se considera que en estos casos de uso la gran mayoría de eventos son unilaterales, lo que permite aprovechar las características diferenciadoras de Kore, como el modelo de [propiedad única](../../getting-started/concepts/subjects/_index.md#modelo-de-propiedad) del libro mayor. Algunos casos de uso de la tecnología Kore se presentarán como ejemplos para facilitar la comprensión.

## Procesos

Cualquier proceso que requiera trazabilidad con altos niveles de seguridad y confianza puede ser un caso de uso adecuado para rastrear a través de nodos Kore, por ejemplo, el ciclo del agua. Este proceso describe cómo el flujo de agua parte de un punto A y pasa por una serie de otros puntos hasta finalmente regresar al punto de origen, simulando un camino circular. En su recorrido, el flujo de agua pasa por diversas entidades y procesos que hacen que su volumen disminuya. Simultáneamente, en algunos de estos puntos es posible analizar el estado de ese flujo mediante sensores u otros sistemas que permitan obtener y generar información adicional del propio flujo.

{{% imgproc water Fit "1800x600" %}}
{{% /imgproc %}}

## Iot

IoT se define como [Internet de las cosas](https://en.wikipedia.org/wiki/Internet_of_things). El Internet de las cosas describe objetos físicos (o grupos de dichos objetos) con sensores, capacidad de procesamiento, software y otras tecnologías que se conectan e intercambian datos con otros dispositivos y sistemas a través de Internet u otras redes de comunicaciones. Por ejemplo, el concepto de ciudad inteligente ha ido ganando impulso últimamente.

Hoy en día, los beneficios de una ciudad no sólo se limitan a la infraestructura física, los servicios y el apoyo institucional, sino también a la disponibilidad y calidad de los canales de comunicación, y a la transmisión y explotación del conocimiento a partir de estos canales para mejorar y dotar eficientemente de recursos a las infraestructuras sociales. .

{{% imgproc smartcity Fit "1800x600" %}}
{{% /imgproc %}}

Uno de los procesos más interesantes dentro de una ciudad inteligente, tanto por sus implicaciones para la salud pública como por su carácter económico, es la gestión de residuos. El primer paso es recoger la basura proporcionada por los ciudadanos en contenedores que cuentan con sensores u otros sistemas que determinan el peso del contenedor y su nivel de llenado. Una vez activado el sensor al valor marcado por la empresa, el camión de la basura recoge el contenedor para llevarlo a la fábrica de reciclaje, donde se encargan de separar estos elementos y realizar los procesos pertinentes para su reciclaje. Finalmente, cuando finaliza el proceso, estos materiales se vuelven a poner a la venta para que puedan ser utilizados nuevamente y se repite el proceso explicado anteriormente.

## Trazabilidad de la Carne de Res
La carne de res es un producto común en los supermercados y su trazabilidad es crucial para garantizar su calidad, seguridad y origen. Con Kore, se puede implementar un sistema de trazabilidad para la carne de res desde el campo hasta la mesa, siguiendo estos pasos:

1. Cría y Alimentación del Ganado: El sistema comienza con la cría y alimentación del ganado en granjas. Kore puede registrar información sobre la procedencia del ganado, su genética, dieta, condiciones de cría y salud. Los datos pueden incluir el tipo de alimentación (orgánica, convencional), el uso de medicamentos y otros detalles importantes.
2. Sacrificio y Procesamiento: Cuando el ganado es sacrificado, Kore registra los datos del proceso, incluidos los controles de calidad, la fecha y el lugar del sacrificio. Durante el procesamiento, se puede hacer un seguimiento de los cortes de carne y los subproductos, garantizando la trazabilidad de cada pieza.
3. Transporte y Almacenamiento: Kore permite el seguimiento de la carne durante el transporte desde la planta de procesamiento hasta los centros de distribución y tiendas. Se pueden monitorear las condiciones de transporte, como la temperatura, para asegurarse de que la carne se mantenga en condiciones óptimas.
4. Distribución a Supermercados: Una vez que la carne llega a los supermercados, Kore puede registrar datos sobre su almacenamiento, rotación y exposición en las estanterías. Los minoristas pueden acceder a información detallada sobre el origen de la carne y sus características, lo que les permite tomar decisiones informadas sobre la venta.
5. Venta al Consumidor Final: Los consumidores pueden acceder a la información de trazabilidad mediante códigos QR o etiquetas en el empaque de la carne. Esto les permite conocer el origen de la carne, su historial de calidad y cualquier otra información relevante.


Este nivel de trazabilidad garantiza que los consumidores reciban carne de res de alta calidad y que se cumplan los estándares de seguridad alimentaria. Además, ayuda a prevenir fraudes y a identificar rápidamente problemas en caso de brotes de enfermedades transmitidas por alimentos.
