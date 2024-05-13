---
title: Glosario
description: Definición de conceptos
---
## A

### Aprobador
Algunas solicitudes de eventos requieren una serie de firmas para ser aprobadas y pasar a formar parte del microledger del sujeto. Esta recogida de firmas es un proceso de votación donde los participantes pueden votar a favor o en contra. Estos participantes, definidos en la gobernanza, son los aprobadores.

## B

### Bootstrap
Es parte del protocolo Kademlia. Es el nombre del nodo que se utiliza para todos los nodos de noticias que quieren unirse a la red P2P para ser descubiertos por todos los demás.

### Blockchain
Blockchain es un subtipo de DLT, y por tanto podemos decir que es fundamentalmente una base de datos distribuida, descentralizada, compartida e inmutable.

## C

### Criptografía
Es la práctica y el estudio de técnicas para la comunicación segura en presencia de conductas adversas.

## D

### DLT
- Inmutable y resistente a manipulaciones. Implementa mecanismos de seguridad criptográfica que evitan que su contenido sea alterado, o al menos, si algún nodo intenta modificar la información, puede ser detectado y bloqueado fácilmente.
Significa "Tecnología de contabilidad distribuida". Una DLT no es más que una base de datos que actúa como un libro mayor pero que además tiene, en mayor o menor medida, las siguientes características:
* Está distribuido y descentralizado.
* Compartido.
* Inmutable y resistente a manipulaciones.

### Dispositivos perimetrales
Un dispositivo que proporciona un punto de entrada a las redes centrales de la empresa o del proveedor de servicios.

## E

### Evento
El incidente que se produce cuando se pretende modificar el estado de un sujeto.

## F

### Fog Computing
Es una arquitectura que utiliza dispositivos periféricos para llevar a cabo una cantidad sustancial de computación, almacenamiento y comunicación localmente y enrutada a través de la red troncal de Internet.


### Fog GateWay
Sinónimo de dispositivos perimetrales. Un dispositivo que proporciona un punto de entrada a las redes centrales de la empresa o del proveedor de servicios.

## G

### Gobernanza
La gobernanza es una estructura a través de la cual un participante o usuario de un sistema acepta utilizar el sistema. Podemos decir fácilmente que hay tres principios que dictan la gobernanza. Estos principios incluyen:

* Gobernando
* Reglas
* Participantes

## k

### Kademlia
Es un DTL que define la estructura de la red y cómo se intercambia la información mediante búsquedas de nodos. Las comunicaciones se realizan mediante UDP y, en el proceso, se crea una red superpuesta de nodos identificados por una ID. Esta ID no solo es útil para identificar el nodo sino también para determinar la *distancia* entre dos nodos para que el protocolo pueda determinar con quién debe comunicarse.

### Kore
Significa "Seguimiento (autónomo) de eventos de procedencia y ciclo de vida". Kore es una solución DLT autorizada para la trazabilidad de activos y procesos.

### Kore Node
Cliente oficial para crear un Nodo Kore. Es la forma más sencilla de trabajar con Kore, ya que es una aplicación de consola simple que proporciona todo lo necesario para construir un nodo (Kore Base, API Rest y diferentes configuraciones de mecanismos).

### Kore Base
Es la biblioteca que implementa la mayor parte de la funcionalidad de Kore (creación y gestión de temas y sus microledgers asociados, implementación del protocolo P2P para la comunicación entre nodos y persistencia de la base de datos). Cualquier aplicación que quiera formar parte de una red Kore deberá hacer uso de esta biblioteca desde la API que expone.

### Kore Network
Es la red P2P creada por todos los nodos de Kore en funcionamiento.

## L

### Ledger
Un libro mayor es un concepto contable que básicamente define un libro mayor en el que siempre se agrega información, generalmente en forma de transacciones.

## M

### Microledger
El microledger es un conjunto de eventos encadenados entre sí mediante mecanismos criptográficos.

### Multiaddr
Una **[multiaddress](https://github.com/multiformats/multiaddr)** (a menudo abreviada multiaddr) es una convención para codificar múltiples capas de información de direcciones en una única estructura de ruta "preparada para el futuro". Ofrece codificaciones legibles por humanos y optimizadas para máquinas de protocolos de superposición y transporte comunes y permite combinar y utilizar juntas muchas capas de direccionamiento.

## N

### Nodo
Es una computadora conectada a otras computadoras que sigue reglas y comparte información.

## P

### P2P
Es una arquitectura de aplicación distribuida que divide tareas o cargas de trabajo entre pares igualmente privilegiados y participantes equipotentes en la red que la conforman.


## S

### Sujeto
Los sujetos son una entidad lógica o proceso que almacena todos los datos necesarios para definirse y que emite eventos a lo largo de su ciclo de vida con un orden de emisión determinado por él mismo.

## T
### Transacción
Es un acuerdo o comunicación entre 2 entidades diferentes para aceptar un cambio en el estado de un sujeto.

### Testigo
Participante interesado en tener una copia del tema y la información que almacena.
## V

### Validador
El validador es un participante de la red que proporciona la firma de seguridad al sujeto. El validador mantiene una copia completa de los sujetos que valida y se compromete con la red a no aceptar más de una versión del mismo evento.
