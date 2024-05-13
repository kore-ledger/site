---
title: Programación de contratos
date: 2024-04-25
weight: 2
description: Cómo programar los contratos.
---

## SDK
Para el correcto desarrollo de los contratos es necesario utilizar su **SDK**, proyecto que se puede encontrar en el [repositorio](https://github.com/kore-ledger/kore-contract-sdk/) oficial de Kore. El principal objetivo de este proyecto es abstraer al programador de la interacción con el contexto de la máquina evaluadora subyacente, haciendo mucho más fácil la obtención de los datos de entrada, así como el proceso de escritura del resultado del contrato.

El proyecto SDK se puede dividir en tres secciones. Por un lado, un conjunto de funciones cuya vinculación se produce en tiempo de ejecución y que tienen como objetivo poder interactuar con la máquina evaluadora, en particular, para leer y escribir datos en un buffer interno. Adicionalmente también distinguimos un módulo que, utilizando las funciones anteriores, se encarga de la serialización y deserialización de los datos, así como de proporcionar la función principal de cualquier contrato. Finalmente, destacamos una serie de funciones y estructuras de utilidad que se pueden utilizar activamente en el código.

Muchos de los elementos anteriores son privados, por lo que el usuario nunca tendrá la oportunidad de utilizarlos. Por ello, en esta documentación nos centraremos en aquellas que están expuestas al usuario y que éste podrá utilizar activamente en el desarrollo de sus contratos.

{{< alert type="warning" title="ATENCIÓN" >}}Tenga en cuenta que no es posible ejecutar todas las funciones ni utilizar todos los tipos de datos en un entorno Web Assembly. Debes informarte sobre las posibilidades del entorno. Por ejemplo, se desactiva cualquier interacción con el sistema operativo, ya que es un entorno aislado y seguro. {{< /alert >}}

### Estructuras auxiliares
```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct Context<State, Event> {
    pub initial_state: State,
    pub event: Event,
    pub is_owner: bool,
}
```
Esta estructura contiene los tres datos de entrada de cualquier contrato: el estado inicial o actual del sujeto, el evento entrante y una flag que indica si la persona que solicita el evento es o no el propietario del sujeto. Tenga en cuenta el uso de genéricos para el estado y el evento.

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct ContractResult<State> {
    pub final_state: State,
    pub approval_required: bool,
    pub success: bool,
}
```
Contiene el resultado de la ejecución del contrato, siendo este una conjunción del estado resultante y dos flags que indican, por un lado, si la ejecución ha sido exitosa según los criterios establecidos por el programador (o si se ha producido en la carga de datos); y por otro lado, si el evento requiere [aprobación](../../../getting-started/concepts/roles/) o no.

```rust
pub fn execute_contract<F, State, Event>(
    state_ptr: i32,
    event_ptr: i32,
    is_owner: i32,
    callback: F,
) -> u32
where
    State: for<'a> Deserialize<'a> + Serialize + Clone,
    Event: for<'a> Deserialize<'a> + Serialize,
    F: Fn(&Context<State, Event>, &mut ContractResult<State>);
```
Esta función es la función principal del SDK y, además, la más importante. En concreto se encarga de obtener los datos de entrada, datos que obtiene del contexto que comparte con la máquina evaluadora. La función, que inicialmente recibirá un puntero a cada uno de estos datos, se encargará de extraerlos del contexto y deserializarlos al estado y estructuras de eventos que espera recibir el contrato, los cuales pueden especificarse mediante genéricos. Estos datos, una vez obtenidos, se encapsulan en la estructura de contexto presente arriba y se pasan como argumentos a una función de devolución de llamada que gestiona la lógica del contrato, es decir, sabe qué hacer con los datos recibidos. Finalmente, independientemente de si la ejecución ha sido exitosa o no, la función se encargará de escribir el resultado en el contexto, para que pueda ser utilizado por la máquina evaluadora.

```rust
pub fn apply_patch<State: for<'a> Deserialize<'a> + Serialize>(
    patch_arg: Value,
    state: &State,
) -> Result<State, i32>;
```
Esta es la última característica pública del SDK y permite actualizar un estado aplicando un JSON-PATCH, útil en los casos en los que se considera que esta técnica actualiza el estado.

## Tu primer contrato
### Creando el proyecto
Localice la ruta y/o los directorios deseados y cree un nuevo paquete de carga utilizando `cargo new NOMBRE --lib`. El proyecto debería ser una biblioteca. Asegúrese de tener un archivo `lib.rs` y no un archivo `main.rs`.

Luego, incluye en el **Cargo.toml** como dependencia el SDK de los contratos y el resto de dependencias que quieras de la siguiente lista:
  * **serde**.
  * **serde_json**.
  * **json_patch**.
  * **thiserror**.

El `Cargo.toml` se debería contener algo como esto:
```rust
[package]
name = "kore_contract"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "=1.0.198", features = ["derive"] }
serde_json = "=1.0.116"
json-patch = "=1.2"
thiserror = "=1.0"
# Note: Change the tag label to the appropriate one
kore-contract-sdk = { git = "https://github.com/kore-ledger/kore-contract-sdk.git", branch = "main"}
```

### Escribiendo el contrato
El siguiente contrato no tiene una lógica complicada ya que ese aspecto depende de las necesidades del propio contrato, pero sí que contiene un amplio abanico de los tipos que se pueden usar y cómo se deben usar. Dado que la compilación la realizará el nodo, **debemos escribir el contrato completo en el archivo lib.rs**.

En nuestro caso, iniciaremos el contrato **especificando los paquetes que vamos a utilizar**.

```rust
use kore_contract_sdk as sdk;
use serde::{Deserialize, Serialize};
```
A continuación, es necesario especificar la estructura de datos que representará el estado de nuestros sujetos así como la familia de eventos que recibiremos.

```rust
#[derive(Serialize, Deserialize, Clone)]
struct State {
    pub text: String,
    pub value: u32,
    pub array: Vec<String>,
    pub boolean: bool,
    pub object: Object,
}

#[derive(Serialize, Deserialize, Clone)]
struct Object {
    number: f32,
    optional: Option<i32>,
}

#[derive(Serialize, Deserialize)]
enum StateEvent {
    ChangeObject {
        obj: Object,
    },
    ChangeOptional {
        integer: i32,
    },
    ChangeAll {
        text: String,
        value: u32,
        array: Vec<String>,
        boolean: bool,
        object: Object,
    },
}
```
{{< alert type="info" title="INFORMACIÓN" >}}La familia de eventos se definirá generalmente como un enumerado, aunque en la práctica nada impide que sea una estructura si es necesario. En cualquier caso, si se utiliza un enumerado, si sus variantes reciben datos, éstos deberán especificarse mediante una estructura anónima y no mediante la sintaxis de tuplas.

También hay que tener en cuenta que los eventos de la familia pueden ser subconjuntos de los eventos reales. Así, por ejemplo, el contrato aceptaría un evento `StateEvent::ChangeObject` que incluya más datos que el atributo `obj`. El contrato, cuando se ejecute, sólo conservará los datos necesarios, descartando todos los demás datos en el proceso de deserialización. Esto podría utilizarse para almacenar información en la cadena que no es necesaria para la lógica del contrato. {{< /alert >}}

{{< alert type="warning" title="ATENCIÓN" >}}Nótese que la implementación del trait `Serialize` y `Deserialize` son obligatorias para especificar el estado y los eventos. Además, el primero también debe implementar `Clone`. {{< /alert >}}

A continuación definimos la **función de entrada al contrato**, el equivalente a la función **main**. Es importante que esta función tenga siempre el mismo nombre que el especificado aquí, ya que es el identificador con el que la máquina evaluadora intentará ejecutarla, produciendo un error si no se encuentra.

```rust
#[no_mangle]
pub unsafe fn main_function(state_ptr: i32, event_ptr: i32, is_owner: i32) -> u32 {
    sdk::execute_contract(state_ptr, event_ptr, is_owner, contract_logic)
}
```
Esta función debe ir siempre acompañada del atributo `#[no_mangle]` y sus parámetros de entrada y salida deben coincidir también con los del ejemplo. En concreto, esta función recibirá los punteros a los datos de entrada, que serán procesados por la función SDK. Como salida, se generará un nuevo puntero al resultado del contrato que, como se ha mencionado anteriormente, es obtenido por el SDK y no por el programador.

{{< alert type="info" title="INFORMACIÓN" >}}La modificación de los valores de los punteros en esta sección del código no tendrá ningún efecto. Los punteros son con respecto al contexto compartido, que corresponde a un único buffer por ejecución de contrato. Alterar los valores de los punteros no permite al programador acceder a información arbitraria ni de la máquina evaluadora ni de otros contratos.{{< /alert >}}

Por último, especificamos la lógica de nuestro contrato, que puede estar definida por tantas funciones como deseemos. Preferiblemente se destacará una función principal, que será la que ejecutará como **callback** la función `execute_contract` del SDK.

```rust
fn contract_logic(
    context: &sdk::Context<State, StateEvent>,
    contract_result: &mut sdk::ContractResult<State>,
) {
    let state = &mut contract_result.final_state;
    match &context.event {
        StateEvent::ChangeObject { obj } => {
            state.object = obj.to_owned();
        }
        StateEvent::ChangeOptional { integer } => state.object.optional = Some(*integer),
        StateEvent::ChangeAll {
            text,
            value,
            array,
            boolean,
            object,
        } => {
            state.text = text.to_string();
            state.value = *value;
            state.array = array.to_vec();
            state.boolean = *boolean;
            state.object = object.to_owned();
        }
    }
    contract_result.success = true;
    contract_result.approval_required = true;
}
```

Esta función principal recibe los datos de entrada del contrato encapsulados en una instancia de la **estructura Context del SDK**. También recibe una referencia mutable al resultado del contrato que contiene el estado final, originalmente idéntico al estado inicial, y las flags de aprobación requerida y ejecución correcta, `contract_result.approval_required` y `contract_result.success`, respectivamente. Nótese cómo, además de modificar el estado en función del evento recibido, hay que modificar las flags anteriores. Con la primera especificaremos que el contrato acepta el evento y los cambios que propone para el estado actual del sujeto, lo que se traducirá en el **SDK** generando un **JSON_PATCH** con las modificaciones necesarias para transitar del estado inicial al obtenido. La segunda flag, por su parte, nos permite indicar condicionalmente si consideramos que el evento debe ser aprobado o no.

### Testeando el contrato
Al ser código Rust, podemos crear una batería de pruebas unitarias en el propio código del contrato para comprobar su rendimiento utilizando los recursos del propio lenguaje. También sería posible especificarlos en un archivo diferente.

```rust
// Testing Change Object
#[test]
fn contract_test_change_object() {
    let initial_state = State {
        array: Vec::new(),
        boolean: false,
        object: Object {
            number: 0.5,
            optional: None,
        },
        text: "".to_string(),
        value: 24,
    };
    let context = sdk::Context {
        initial_state: initial_state.clone(),
        event: StateEvent::ChangeObject {
            obj: Object {
                number: 21.70,
                optional: Some(64),
            },
        },
        is_owner: false,
    };
    let mut result = sdk::ContractResult::new(initial_state);
    contract_logic(&context, &mut result);
    assert_eq!(result.final_state.object.number, 21.70);
    assert_eq!(result.final_state.object.optional, Some(64));
    assert!(result.success);
    assert!(result.approval_required);
}

// Testing Change Optional
#[test]
fn contract_test_change_optional() {
    let initial_state = State {
        array: Vec::new(),
        boolean: false,
        object: Object {
            number: 0.5,
            optional: None,
        },
        text: "".to_string(),
        value: 24,
    };
    // Testing Change Object
    let context = sdk::Context {
        initial_state: initial_state.clone(),
        event: StateEvent::ChangeOptional { integer: 1000 },
        is_owner: false,
    };
    let mut result = sdk::ContractResult::new(initial_state);
    contract_logic(&context, &mut result);
    assert_eq!(result.final_state.object.optional, Some(1000));
    assert_eq!(result.final_state.object.number, 0.5);
    assert!(result.success);
    assert!(result.approval_required);
}

// Testing Change All
#[test]
fn contract_test_change_all() {
    let initial_state = State {
        array: Vec::new(),
        boolean: false,
        object: Object {
            number: 0.5,
            optional: None,
        },
        text: "".to_string(),
        value: 24,
    };
    // Testing Change Object
    let context = sdk::Context {
        initial_state: initial_state.clone(),
        event: StateEvent::ChangeAll {
            text: "Kore_contract_test_all".to_string(),
            value: 2024,
            array: vec!["Kore".to_string(), "Ledger".to_string(), "SL".to_string()],
            boolean: true,
            object: Object {
                number: 0.005,
                optional: Some(2024),
            },
        },
        is_owner: false,
    };
    let mut result = sdk::ContractResult::new(initial_state);
    contract_logic(&context, &mut result);
    assert_eq!(
        result.final_state.text,
        "Kore_contract_test_all".to_string()
    );
    assert_eq!(result.final_state.value, 2024);
    assert_eq!(
        result.final_state.array,
        vec!["Kore".to_string(), "Ledger".to_string(), "SL".to_string()]
    );
    assert_eq!(result.final_state.boolean, true);
    assert_eq!(result.final_state.object.optional, Some(2024));
    assert_eq!(result.final_state.object.number, 0.005);
    assert!(result.success);
    assert!(result.approval_required);
}
```

Como puede ver, lo único que necesita hacer para crear una prueba válida es definir manualmente un estado inicial y un evento entrante en lugar de utilizar la función ejecutora del SDK, que sólo puede ser ejecutada correctamente por Kore. Una vez definidas las entradas, hacer una llamada a la función principal de la lógica del contrato debería ser suficiente.

Una vez probado el contrato, está listo para ser enviado a Kore como se indica en la sección de [introducción](../introduction/). Tenga en cuenta que no es necesario enviar las pruebas del contrato a los nodos Kore. De hecho, enviarlas supondrá un mayor uso de bytes del fichero codificado y, en consecuencia, al estar almacenado en el gobierno, un mayor consumo de bytes del mismo.