---
title: Eventos
description: Eventos dentro de la red Kore Ledger.
weight: 212
---
## Ciclo de vida

La **gobernanza** determina el procolo por el que los eventos son incorporados al ciclo de vida del sujeto de trazabilidad

![Protocol](protocol.png) 


## Tipos de eventos
| Evento    | Descripción                                                                                               |
|-----------|-----------------------------------------------------------------------------------------------------------|
| Start     | Inicializa el registro de eventos de un sujeto, estableciendo a los participantes y la **gobernanza** del libro contable. |
| State     | Los registros de estado cambian las propiedades del sujeto, por lo que su estado se modifica.             |
| Fact      | Hechos relacionados con la función o el entorno del sujeto pero que no modifican sus propiedades.         |
| Transfer  | Transfiere la propiedad del sujeto a un nuevo propietario. Ocurre una rotación de clave para evitar la manipulación de eventos anteriores por el nuevo propietario. |
| EOL       | Evento de fin de vida que finaliza el registro de eventos, evitando nuevas adiciones.                     |


En cuanto a la estructura y los contenidos de los actos, nos hemos basado en soluciones de diseño reconocidas por la industria [^1]. El enfoque habitual es estructurar el evento en una cabecera, con una estructura común para todos los eventos, incluyendo sus metadatos, y una carga útil con información específica para cada evento.

## Ejemplo
Diagrama generado un evento tipo **Fact**.
```mermaid
sequenceDiagram
    actor Emisor
    actor Propietario
    actor Evaluador
    actor Aprobador
    actor Validador
    actor Testigo
    Note over Propietario: 1 - Fase de Petición
    Emisor->>Propietario: Solicitud de evento
    Note over Propietario: 2 - Fase de Evaluación
    alt Evento Fact
      Propietario->>Evaluador: Solicitud de evaluación
      Evaluador->>Propietario: Respuesta de evaluación
    end
    Note over Propietario: 3 - Fase de Aprobación
    alt La evaluación del contrato dice que se requiere aprobación
        Propietario->>Aprobador: Solicitud de aprobación
        Aprobador->>Propietario: Respuesta de aprobación
    end
    Note over Propietario: 4 - Fase de composición
    Propietario->>Propietario: Generación de eventos
    Note over Propietario: 5 - Fase de validación
    Propietario->>Propietario: Generación de pruebas de validación
    Propietario->>Validador: Solicitud de validación
    Validador->>Propietario: Respuesta de validación
    Note over Propietario: 6 - Fase de distribución
    Propietario->>Testigo: Evento
    Testigo->>Propietario: ACK
```
Diagrama generado un evento tipo **State**.
```mermaid
sequenceDiagram
    actor Emisor
    actor Propietario
    actor Evaluador
    actor Aprobador
    actor Validador
    actor Testigo
    Note over Propietario: Fase 1 - Solicitud de cambio de estado(Evento State)
    Emisor->>Propietario: Solicita cambio de estado en el sujeto
    Note over Propietario: Fase 2 - Evaluación de la solicitud
    Propietario->>Evaluador: Solicita evaluación de la solicitud
    Evaluador->>Propietario: Devuelve evaluación (positiva o negativa)
    alt Evaluación positiva
        Note over Propietario: Fase 3 - Aprobación (si es necesario)
        alt Aprobación requerida
            Propietario->>Aprobador: Solicita aprobación
            Aprobador->>Propietario: Devuelve aprobación (positiva o negativa)
        end
        Note over Propietario: Fase 4 - Incorporación del evento
        Propietario->>Propietario: Incorpora el evento al registro de eventos
        Note over Propietario: Fase 5 - Validación del evento
        Propietario->>Validador: Solicita validación
        Validador->>Propietario: Devuelve respuesta de validación
        Note over Propietario: Fase 6 - Distribución del evento
        Propietario->>Testigo: Envía evento a testigos
        Testigo->>Propietario: Confirma recepción del evento
    else Evaluación negativa
        Note over Propietario: La solicitud es rechazada
    end
```
Diagrama generado un evento tipo **EOL**.
```mermaid
sequenceDiagram
    actor Emisor
    actor Propietario
    actor Evaluador
    actor Aprobador
    actor Validador
    actor Testigo
    Note over Propietario: Fase 1 - Solicitud de fin de vida
    Emisor->>Propietario: Solicita fin de vida del sujeto (evento EOL)
    Note over Propietario: Fase 2 - Evaluación de la solicitud
    Propietario->>Evaluador: Solicita evaluación de la solicitud
    Evaluador->>Propietario: Devuelve evaluación (positiva o negativa)
    alt Evaluación positiva
        Note over Propietario: Fase 3 - Aprobación (si es necesario)
        alt Aprobación requerida
            Propietario->>Aprobador: Solicita aprobación
            Aprobador->>Propietario: Devuelve aprobación (positiva o negativa)
        end
        Note over Propietario: Fase 4 - Incorporación del evento
        Propietario->>Propietario: Incorpora el evento EOL al registro de eventos
        Note over Propietario: Fase 5 - Validación del evento
        Propietario->>Validador: Solicita validación
        Validador->>Propietario: Devuelve respuesta de validación
        Note over Propietario: Fase 6 - Distribución del evento
        Propietario->>Testigo: Envía evento EOL a testigos
        Testigo->>Propietario: Confirma recepción del evento EOL
    else Evaluación negativa
        Note over Propietario: La solicitud es rechazada
    end
```
## Referencias
[^1]: Event Processing in Action - Opher Etzion y Peter Niblett (2010). Manning Publications Co., 3 Lewis Street Greenwich, Estados Unidos. ISBN: 978-1-935182-21-4.