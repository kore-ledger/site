---
title: Programming contracts
date: 2024-04-26
weight: 2
description: How to program contracts.
---

## SDK
For the correct development of the contracts it is necessary to use its **SDK**, a project that can be found in the official Kore [repository](https://github.com/kore-ledger/kore-contract-sdk/). The main objective of this project is to abstract the programmer from the interaction with the context of the underlying evaluating machine, making it much easier to obtain the input data, as well as the process of writing the result of the contract.

The SDK project can be divided into three sections. On the one hand, a set of functions whose binding occurs at runtime and which are aimed at being able to interact with the evaluating machine, in particular, for reading and writing data to an internal buffer. Additionally, we also distinguish a module that, using the previous functions, is in charge of the serialization and deserialization of the data, as well as of providing the main function of any contract. Finally, we highlight a number of utility functions and structures that can be actively used in the code.

Many of the above elements are private, so the user will never have the opportunity to use them. Therefore, in this documentation we will focus on those that are exposed to the user and that the user will be able to actively use in the development of his contracts.

{{< alert type="warning" title="CAUTION" >}}Please note that it is not possible to execute every function or use every type of data in a Web Assembly environment. You should inform yourself about the possibilities of the environment. For example, any interaction with the operating system is disabled, since it is an isolated and secure environment. {{< /alert >}}

### Auxiliary structures
```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct Context<State, Event> {
    pub initial_state: State,
    pub event: Event,
    pub is_owner: bool,
}
```
This structure contains the three input data of any contract: the initial or current state of the subject, the incoming event and a flag indicating whether or not the person requesting the event is the owner of the subject. Note the use of generics for the state and the event.

```rust
#[derive(Serialize, Deserialize, Debug)]
pub struct ContractResult<State> {
    pub final_state: State,
    pub approval_required: bool,
    pub success: bool,
}
```
It contains the result of the execution of the contract, being this a conjunction of the resulting state and two flags that indicate, on the one hand, if the execution has been successful according to the criteria established by the programmer (or if an error has occurred in the data loading); and on the other hand, if the event requires [approval](../../../getting-started/concepts/roles/_index.md/#approval) or not.

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
This function is the main function of the SDK and, likewise, the most important one. Specifically, it is in charge of obtaining the input data, data that it obtains from the context that it shares with the evaluating machine. The function, which will initially receive a pointer to each of these data, will be in charge of extracting them from the context and deserializing them to the state and event structures that the contract expects to receive, which can be specified by means of generics. These data, once obtained, are encapsulated in the Context structure present above and are passed as arguments to a callback function that manages the contract logic, i.e. it knows what to do with the data received. Finally, regardless of whether the execution has been successful or not, the function will take care of writing the result in the context, so that it can be used by the evaluating machine.

```rust
pub fn apply_patch<State: for<'a> Deserialize<'a> + Serialize>(
    patch_arg: Value,
    state: &State,
) -> Result<State, i32>;
```
This is the latest public feature of the SDK and allows to update a state by applying a JSON-PATCH, useful in cases where this technique is considered to update the state.

## Your first contract
### Creating the project
Locate the desired path and/or directories and create a new cargo package using `cargo new NAME --lib`. The project should be a library. Make sure you have a `lib.rs` file and not a `main.rs` file.

Then, include in the **Cargo.toml** as a dependency the SDK of the contracts and the rest of the dependencies you want from the following list:
  * **serde**.
  * **serde_json**.
  * **json_patch**.
  * **thiserror**.

The `Cargo.toml` should contain something like this:
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

### Writing the contract
The following contract does not have a complicated logic since that aspect depends on the needs of the contract itself, but it does contain a wide range of the types that can be used and how they should be used. Since the compilation will be done by the node, **we must write the whole contract in the lib.rs file**.

In our case, we will start the contract by **specifying the packages we are going to use**.

```rust
use kore_contract_sdk as sdk;
use serde::{Deserialize, Serialize};
```

Next, it is necessary to specify the data structure that will represent the state of our subjects as well as the family of events that we will receive.

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
{{< alert type="info" title="INFO" >}}The event family will generally be defined as an enumerate, although in practice nothing prevents it from being a structure if required. Regardless of the case, if an enumerate is used, if its variants receive data, these must be specified by means of an anonymous structure and not by means of the tuple syntax.

It should also be noted that the events of the family can be subsets of the real events. Thus, as an example, the contract would accept a `StateEvent::ChangeObject` event that includes more data than the `obj` attribute. The contract, when executed, will only keep the necessary data, discarding all other data in the deserialization process. This could be used to store information in the string that is not needed for the contract logic.{{< /alert >}}

{{< alert type="warning" title="CAUTION" >}}Note that the implementation of the trait Serialize and Deserialize are mandatory to specify for state and events. Additionally, the former must also implement Clone. {{< /alert >}}

Next we define the **contract entry function**, the equivalent of the **main** function. It is important that this function always has the same name as the one specified here, since it is the identifier with which the evaluating machine will try to execute it, producing an error if it is not found.

```rust
#[no_mangle]
pub unsafe fn main_function(state_ptr: i32, event_ptr: i32, is_owner: i32) -> u32 {
    sdk::execute_contract(state_ptr, event_ptr, is_owner, contract_logic)
}
```
This function must always be accompanied by the attribute `#[no_mangle]` and its input and output parameters must also match those of the example. Specifically, this function will receive the pointers to the input data, which will then be processed by the SDK function. As output, a new pointer to the result of the contract is generated, which, as mentioned above, is obtained by the SDK and not by the programmer.

{{< alert type="info" title="INFO" >}}Modifying the pointer values in this section of the code will have no effect. Pointers are with respect to the shared context, which corresponds to a single buffer per contract execution. Altering the pointer values does not allow the programmer to access arbitrary information either from the evaluating machine or from other contracts.{{< /alert >}}

Finally, we specify the logic of our contract, which can be defined by as many functions as we wish. Preferably a main function will be highlighted, which will be the one to be executed as **callback** by the `execute_contract` function of the SDK.

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

This main function receives the contract input data encapsulated in an instance of the **SDK Context structure**. It also receives a mutable reference to the contract result containing the final state, originally identical to the initial state, and the approval required and successful execution flags, `contract_result.approval_required` and `contract_result.success`, respectively. Note how, in addition to modifying the status according to the event received, the previous flags must be modified. With the first flag we specify that the contract accepts the event and the changes it proposes for the current state of the subject, which will be translated in the **SDK** by generating a **JSON_PATCH** with the necessary modifications to move from the initial state to the obtained one. The second flag, on the other hand, allows us to conditionally indicate whether we consider that the event should be approved or not.

### Testing your contract
Since this is Rust code, we can create a battery of unit tests in the contract code itself to check its performance using the resources of the language itself. It would also be possible to specify them in a different file.

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

As you can see, the only thing you need to do to create a valid test is to manually define an initial state and an incoming event instead of using the SDK executor function, which can only be properly executed by Kore. Once the inputs are defined, making a call to the main function of the contract logic should be sufficient.

Once the contract is tested, it is ready to be sent to Kore as indicated in the [introduction](../introduction/_index.md) section. Note that it is not necessary to send the contract tests to the Kore nodes. In fact, sending them will result in a higher byte usage of the encoded file and, consequently, as it is stored in the governance, a higher byte consumption of the governance.