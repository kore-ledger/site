---
title: Creando un schema
pagination_next: build/assets-traceability/running-node
date: 2024-06-06
weight: 4
---
Hemos agregado nuestro primer miembro a la gobernanza, pero todavía hay más por completar, ya que no hemos definido la estructura de datos para rastrear sujetos de tipo *Wine* en este caso de uso.

Para avanzar en el tutorial, necesitamos definir una estructura de datos donde podamos almacenar información para cada botella de vino. En Kore, esta definición se realiza usando [*schemas*](../../../docs/getting-started/concepts/schema/), que nos permite especificar los campos, tipos de datos y relaciones que queremos almacenar, como el número de cosecha, tipo de uva, origen de la uva, certificación ecológica, etc.

## Schema

Antes de continuar, es fundamental tener clara la información que queremos almacenar de cada botella de vino. Luego, procederemos a crear el esquema que represente esa información adecuadamente. A continuación se muestra el esquema que hemos creado:

- Número de cosecha
- Tipo de uva
- Origen de la uva
- Certificado que acredite si es ecológico o no
- Valores a cambiar en el evento de control de temperatura:
    - Marca de tiempo del último cheque
    - Valor que confirma si se ha cumplido la cadena de frío del vino.

El esquema debe definirse en formato [Json Schema](../../../docs/getting-started/concepts/schema/) para que kore pueda interpretarlo correctamente. Aquí está el esquema en este formato:

{{< alert-details type="info" title="Schema" summary="Pincha para ver el Schema" >}}
```json
{
    "id": "Wine",
    "description": "Representation of a bottle of wine",
    "type": "object",
    "properties": {
        "harvest": {
            "description": "Harvest number",
            "type": "integer"
        },
        "grape": {
            "description": "Type of grape",
            "type": ["string", "null"],
            "enum": ["CabernetSauvignon", "Chardonnay", "PinotNoir", null]
        },
        "origin": {
            "description": "Origin of the grape",
            "type": "string"
        },
        "organic_certified": {
            "description": "Certificate authenticating whether it is organic or not",
            "type": ["boolean", "null"]
        },
        "temperature_control": {
            "description": "Values to be changed in the temperature control event",
            "type": "object",
            "properties": {
                "last_check": {
                    "description": "Timestamp of last check",
                    "type": "number"
                },
                "temperature_ok": {
                    "description": "Value that corroborates whether the wine cold chain has been complied with",
                    "type": "boolean"
                }
            },
            "required": [ "last_check", "temperature_ok" ],
            "additionalProperties": false
        }
    },
    "required": [ "harvest", "grape", "origin", "organic_certified", "temperature_control" ],
    "additionalProperties": false
}
```
{{< /alert-details >}}

## Contrato

Después de declarar nuestro esquema, el siguiente paso es crear el [*contrato*](../../../docs/learn/contracts/) ya que necesitamos una forma de actualizar los estados de los sujetos que declaramos. Por lo tanto, crearemos un pequeño proyecto para el desarrollo del contrato, tomando como referencia lo [declarado en esta sección](../../../docs/learn/contracts/programming%20contracts/).

1. Ejecute el siguiente comando:

    ```bash
    cargo new wine-contract
    ```

    Esto creará un proyecto Rust vacío con el nombre especificado, lo que dará como resultado la siguiente estructura:

    ```bash
    .
    ├── Cargo.toml
    └── src
        └── main.rs
    ```

2. Necesitamos modificar el archivo *Cargo.toml* para incluir los contratos kore *SDK* así como el módulo *serde*, que manejará la serialización y deserialización de datos:

    ```toml
    [package]
    name = "wine-contract"
    version = "0.1.0"
    edition = "2021"

    [dependencies]
    serde = { version = "1.0.152", features = ["derive"] }
    kore-sc-rust = { git = "https://github.com/kore-ledger/kore-contract-sdk.git", branch = "main"}
    ```

    {{< alert type="info" title="INFORMACIÓN">}}De ahora en adelante, todos los pasos numerados restantes se realizarán dentro del archivo `main.rs`.{{< /alert >}}

3. Agregue las dependencias necesarias al comienzo de nuestro archivo:

    ```rust
    use kore_sc_rust as sdk;
    use serde::{Deserialize, Serialize};
    ```

4. A continuación, agregaremos las estructuras de datos que representarán nuestros sujetos *Wine*:

    ```rust
    #[derive(Serialize, Deserialize, Clone, PartialEq)] 
    enum Grape {
        CabernetSauvignon,
        Chardonnay,
        PinotNoir,
    }

    #[derive(Serialize, Deserialize, Clone)]
    struct TemperatureControl {
        pub last_check: u32,
        pub temperature_ok: bool,
    }

    #[derive(Serialize, Deserialize, Clone)]
    struct State {
        pub harvest: u32,
        pub grape: Option<Grape>,
        pub origin: String,
        pub organic_certified: Option<bool>,
        pub temperature_control: TemperatureControl,
    }
    ```

5. Ahora es el momento de definir los eventos de estado que se pueden desencadenar en nuestros sujetos tipo *Wine*, que son:
    - *Init*: Responsable de inicializar sólo aquellos sujetos que provienen de un estado de **génesis**.
    - *TemperatureControl*: Encargado de realizar el control de temperatura.
    - *CertificaciónOrgánica*: Responsable de modificar el estado de la certificación orgánica.

    El código agregado será:

    ```rust
    #[derive(Serialize, Deserialize)]
    enum StateEvent {
        Init {
            harvest: u32,
            grape: String,
            origin: String,
        },
        TemperatureControl {
            temperature: f32,
            timestamp: u32,
        },
        OrganicCertification {
            fertilizers_control: bool,
            pesticides_control: bool,
            analytics: bool,
            additional_info: String,
        },
    }
    ```

6. Agregue la función de entrada para el contrato, equivalente a la función `main`:

    ```rust
    #[no_mangle]
    pub unsafe fn main_function(state_ptr: i32, event_ptr: i32, is_owner: i32) -> u32 {
        sdk::execute_contract(state_ptr, event_ptr, is_owner, contract_logic)
    }
    ```
    {{< alert type="warning" title="PRECAUCIÓN">}}Es importante que esta función siempre tenga el mismo nombre especificado aquí ya que es el identificador con el que el evaluador intentará ejecutarla, y dará como resultado un error si no la encuentra.{{< /alert >}}

7. Por último agregar la lógica de negocio que actuará en cada uno de los casos para los eventos de estado declarados anteriormente:
{{< alert-details type="info" title="Lógica del contrato" summary="Pincha para ver la lógica" >}}
 ```rust
    const TEMPERATURE_RANGE: (f32, f32) = (10.0, 16.0);

    fn contract_logic(
        context: &sdk::Context<State, StateEvent>,
        contract_result: &mut sdk::ContractResult<State>,
    ) {
        let state = &mut contract_result.final_state;
        match &context.event {
            StateEvent::Init {
                harvest,
                grape,
                origin,
            } => {
                if context.is_owner && !check_subject_has_been_initiated(state) {
                    let grape = match grape.as_str() {
                        "CabernetSauvignon" => Some(Grape::CabernetSauvignon),
                        "Chardonnay" => Some(Grape::Chardonnay),
                        "PinotNoir" => Some(Grape::PinotNoir),
                        _ => None,
                    };
                    if grape.is_some() {
                        state.harvest = *harvest;
                        state.grape = grape;
                        state.origin = origin.to_string();
                        contract_result.success = true;
                    }
                }
            }
            StateEvent::TemperatureControl {
                temperature,
                timestamp,
            } => {
                if context.is_owner && check_subject_has_been_initiated(state) {
                    if check_temperature_in_range(*temperature)
                        && state.temperature_control.temperature_ok
                    {
                        state.temperature_control.last_check = *timestamp;
                    } else {
                        state.temperature_control.temperature_ok = false;
                        state.temperature_control.last_check = *timestamp;
                    }
                    contract_result.success = true;
                }
            }
            StateEvent::OrganicCertification {
                fertilizers_control,
                pesticides_control,
                analytics,
                additional_info,
            } => {
                if check_subject_has_been_initiated(state) {
                    match state.organic_certified {
                        Some(organic_cerified) => {
                            if organic_cerified
                                && !check_is_organic(
                                    *fertilizers_control,
                                    *pesticides_control,
                                    *analytics,
                                )
                            {
                                state.organic_certified = Some(false);
                            }
                        }
                        None => {
                            if check_is_organic(*fertilizers_control, *pesticides_control, *analytics) {
                                state.organic_certified = Some(true);
                            } else {
                                state.organic_certified = Some(false);
                            }
                        }
                    }
                    contract_result.success = true;
                }
            }
        }
    }

    fn check_subject_has_been_initiated(state: &State) -> bool {
        let initial_grape = match state.grape {
            Some(_) => false,
            None => true,
        };
        if state.harvest == 0 && initial_grape && state.origin == format!("") {
            return false;
        }
        return true;
    }

    fn check_temperature_in_range(temperature: f32) -> bool {
        if temperature >= TEMPERATURE_RANGE.0 && temperature <= TEMPERATURE_RANGE.1 {
            return true;
        }
        return false;
    }

    fn check_is_organic(fertilizers_control: bool, pesticides_control: bool, analytics: bool) -> bool {
        if fertilizers_control && pesticides_control && analytics {
            return true;
        }
        return false;
    }
    
```
{{< /alert-details >}}

    {{< alert type="warning" title="PRECAUCIÓN">}}Es imprescindible incluir `contract_result.success = true` en aquellos puntos de la función `contract_logic` donde creemos que la ejecución ha sido exitosa. De lo contrario, al emitir los eventos, siempre terminarán con el estado `"success" = false`.{{< /alert >}}

kore sólo admite contratos en *Base64*, por lo que necesitaremos transformar el nuestro a ese formato. Para ello, Linux tiene su propia utilidad llamada `base64`. Por lo tanto, lo que debemos hacer en nuestro archivo `main.rs` es:

```bash
base64 main.rs
```

El resultado devuelto será el contrato codificado en *base64*.

## Volvemos a la red kore

Una vez que hayamos declarado tanto el esquema como el contrato, es necesario emitir un evento **Fact** a la gobernanza para agregar esta nueva información.

Comencemos verificando los cambios que queremos realizar en las propiedades de gobernanza. En este punto, nuestra gobernanza debería verse así:

```json
{
    "policies": [
        {
            "approve": {
                "quorum": "MAJORITY"
            },
            "evaluate": {
                "quorum": "MAJORITY"
            },
            "id": "governance",
            "validate": {
                "quorum": "MAJORITY"
            }
        }
    ],
    "schemas": []
}
```

Ahora, necesitamos incluir el *esquema*, el *contrato*,el [**génesis**](../../../docs/getting-started/concepts/events/) estado de un sujeto, así como las políticas que se le aplicarán:

{{< alert-details type="info" title="Añadiendo el contrato a la gobernanza" summary="Pincha para ver la gobernanza" >}}
```json
{
    "policies": [

        ...

        {
            "approve": {
                "quorum": "MAJORITY"
            },
            "evaluate": {
                "quorum": "MAJORITY"
            },
            "id": "Wine",
            "validate": {
                "quorum": "MAJORITY"
            }
        }
    ],
    "schemas": [
        {
            "contract": {
                "raw": "dXNlIHRhcGxlX3NjX3J1c3QgYXMgc2RrOwp1c2Ugc2VyZGU6OntEZXNlcmlhbGl6ZSwgU2VyaWFs
                        aXplfTsKCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lLCBQYXJ0aWFsRXEp
                        XSAKZW51bSBHcmFwZSB7CiAgICBDYWJlcm5ldFNhdXZpZ25vbiwKICAgIENoYXJkb25uYXksCiAg
                        ICBQaW5vdE5vaXIsCn0KCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lKV0K
                        c3RydWN0IFRlbXBlcmF0dXJlQ29udHJvbCB7CiAgICBwdWIgbGFzdF9jaGVjazogdTMyLAogICAg
                        cHViIHRlbXBlcmF0dXJlX29rOiBib29sLAp9CgojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFs
                        aXplLCBDbG9uZSldCnN0cnVjdCBTdGF0ZSB7CiAgICBwdWIgaGFydmVzdDogdTMyLAogICAgcHVi
                        IGdyYXBlOiBPcHRpb248R3JhcGU+LAogICAgcHViIG9yaWdpbjogU3RyaW5nLAogICAgcHViIG9y
                        Z2FuaWNfY2VydGlmaWVkOiBPcHRpb248Ym9vbD4sCiAgICBwdWIgdGVtcGVyYXR1cmVfY29udHJv
                        bDogVGVtcGVyYXR1cmVDb250cm9sLAp9CgojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXpl
                        KV0KZW51bSBTdGF0ZUV2ZW50IHsKICAgIEluaXQgewogICAgICAgIGhhcnZlc3Q6IHUzMiwKICAg
                        ICAgICBncmFwZTogU3RyaW5nLAogICAgICAgIG9yaWdpbjogU3RyaW5nLAogICAgfSwKICAgIFRl
                        bXBlcmF0dXJlQ29udHJvbCB7CiAgICAgICAgdGVtcGVyYXR1cmU6IGYzMiwKICAgICAgICB0aW1l
                        c3RhbXA6IHUzMiwKICAgIH0sCiAgICBPcmdhbmljQ2VydGlmaWNhdGlvbiB7CiAgICAgICAgZmVy
                        dGlsaXplcnNfY29udHJvbDogYm9vbCwKICAgICAgICBwZXN0aWNpZGVzX2NvbnRyb2w6IGJvb2ws
                        CiAgICAgICAgYW5hbHl0aWNzOiBib29sLAogICAgICAgIGFkZGl0aW9uYWxfaW5mbzogU3RyaW5n
                        LAogICAgfSwKfQoKI1tub19tYW5nbGVdCnB1YiB1bnNhZmUgZm4gbWFpbl9mdW5jdGlvbihzdGF0
                        ZV9wdHI6IGkzMiwgZXZlbnRfcHRyOiBpMzIsIGlzX293bmVyOiBpMzIpIC0+IHUzMiB7CiAgICBz
                        ZGs6OmV4ZWN1dGVfY29udHJhY3Qoc3RhdGVfcHRyLCBldmVudF9wdHIsIGlzX293bmVyLCBjb250
                        cmFjdF9sb2dpYykKfQoKY29uc3QgVEVNUEVSQVRVUkVfUkFOR0U6IChmMzIsIGYzMikgPSAoMTAu
                        MCwgMTYuMCk7CgpmbiBjb250cmFjdF9sb2dpYygKICAgIGNvbnRleHQ6ICZzZGs6OkNvbnRleHQ8
                        U3RhdGUsIFN0YXRlRXZlbnQ+LAogICAgY29udHJhY3RfcmVzdWx0OiAmbXV0IHNkazo6Q29udHJh
                        Y3RSZXN1bHQ8U3RhdGU+LAopIHsKICAgIGxldCBzdGF0ZSA9ICZtdXQgY29udHJhY3RfcmVzdWx0
                        LmZpbmFsX3N0YXRlOwogICAgbWF0Y2ggJmNvbnRleHQuZXZlbnQgewogICAgICAgIFN0YXRlRXZl
                        bnQ6OkluaXQgewogICAgICAgICAgICBoYXJ2ZXN0LAogICAgICAgICAgICBncmFwZSwKICAgICAg
                        ICAgICAgb3JpZ2luLAogICAgICAgIH0gPT4gewogICAgICAgICAgICBpZiBjb250ZXh0LmlzX293
                        bmVyICYmICFjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkgewogICAgICAg
                        ICAgICAgICAgbGV0IGdyYXBlID0gbWF0Y2ggZ3JhcGUuYXNfc3RyKCkgewogICAgICAgICAgICAg
                        ICAgICAgICJDYWJlcm5ldFNhdXZpZ25vbiIgPT4gU29tZShHcmFwZTo6Q2FiZXJuZXRTYXV2aWdu
                        b24pLAogICAgICAgICAgICAgICAgICAgICJDaGFyZG9ubmF5IiA9PiBTb21lKEdyYXBlOjpDaGFy
                        ZG9ubmF5KSwKICAgICAgICAgICAgICAgICAgICAiUGlub3ROb2lyIiA9PiBTb21lKEdyYXBlOjpQ
                        aW5vdE5vaXIpLAogICAgICAgICAgICAgICAgICAgIF8gPT4gTm9uZSwKICAgICAgICAgICAgICAg
                        IH07CiAgICAgICAgICAgICAgICBpZiBncmFwZS5pc19zb21lKCkgewogICAgICAgICAgICAgICAg
                        ICAgIHN0YXRlLmhhcnZlc3QgPSAqaGFydmVzdDsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS5n
                        cmFwZSA9IGdyYXBlOwogICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yaWdpbiA9IG9yaWdpbi50
                        b19zdHJpbmcoKTsKICAgICAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9
                        IHRydWU7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAg
                        U3RhdGVFdmVudDo6VGVtcGVyYXR1cmVDb250cm9sIHsKICAgICAgICAgICAgdGVtcGVyYXR1cmUs
                        CiAgICAgICAgICAgIHRpbWVzdGFtcCwKICAgICAgICB9ID0+IHsKICAgICAgICAgICAgaWYgY29u
                        dGV4dC5pc19vd25lciAmJiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkg
                        ewogICAgICAgICAgICAgICAgaWYgY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UoKnRlbXBlcmF0
                        dXJlKQogICAgICAgICAgICAgICAgICAgICYmIHN0YXRlLnRlbXBlcmF0dXJlX2NvbnRyb2wudGVt
                        cGVyYXR1cmVfb2sKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS50
                        ZW1wZXJhdHVyZV9jb250cm9sLmxhc3RfY2hlY2sgPSAqdGltZXN0YW1wOwogICAgICAgICAgICAg
                        ICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9s
                        LnRlbXBlcmF0dXJlX29rID0gZmFsc2U7CiAgICAgICAgICAgICAgICAgICAgc3RhdGUudGVtcGVy
                        YXR1cmVfY29udHJvbC5sYXN0X2NoZWNrID0gKnRpbWVzdGFtcDsKICAgICAgICAgICAgICAgIH0K
                        ICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5zdWNjZXNzID0gdHJ1ZTsKICAgICAgICAg
                        ICAgfQogICAgICAgIH0KICAgICAgICBTdGF0ZUV2ZW50OjpPcmdhbmljQ2VydGlmaWNhdGlvbiB7
                        CiAgICAgICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2wsCiAgICAgICAgICAgIHBlc3RpY2lkZXNf
                        Y29udHJvbCwKICAgICAgICAgICAgYW5hbHl0aWNzLAogICAgICAgICAgICBhZGRpdGlvbmFsX2lu
                        Zm8sCiAgICAgICAgfSA9PiB7CiAgICAgICAgICAgIGlmIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5f
                        aW5pdGlhdGVkKHN0YXRlKSB7CiAgICAgICAgICAgICAgICBtYXRjaCBzdGF0ZS5vcmdhbmljX2Nl
                        cnRpZmllZCB7CiAgICAgICAgICAgICAgICAgICAgU29tZShvcmdhbmljX2NlcmlmaWVkKSA9PiB7
                        CiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9yZ2FuaWNfY2VyaWZpZWQKICAgICAgICAgICAg
                        ICAgICAgICAgICAgICAgICYmICFjaGVja19pc19vcmdhbmljKAogICAgICAgICAgICAgICAgICAg
                        ICAgICAgICAgICAgICpmZXJ0aWxpemVyc19jb250cm9sLAogICAgICAgICAgICAgICAgICAgICAg
                        ICAgICAgICAgICpwZXN0aWNpZGVzX2NvbnRyb2wsCiAgICAgICAgICAgICAgICAgICAgICAgICAg
                        ICAgICAgKmFuYWx5dGljcywKICAgICAgICAgICAgICAgICAgICAgICAgICAgICkKICAgICAgICAg
                        ICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5p
                        Y19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAg
                        ICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBOb25lID0+IHsKICAgICAgICAg
                        ICAgICAgICAgICAgICAgaWYgY2hlY2tfaXNfb3JnYW5pYygqZmVydGlsaXplcnNfY29udHJvbCwg
                        KnBlc3RpY2lkZXNfY29udHJvbCwgKmFuYWx5dGljcykgewogICAgICAgICAgICAgICAgICAgICAg
                        ICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKHRydWUpOwogICAgICAgICAgICAg
                        ICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3Jn
                        YW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsKICAgICAgICAgICAgICAgICAgICAgICAgfQog
                        ICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNv
                        bnRyYWN0X3Jlc3VsdC5zdWNjZXNzID0gdHJ1ZTsKICAgICAgICAgICAgfQogICAgICAgIH0KICAg
                        IH0KfQoKZm4gY2hlY2tfc3ViamVjdF9oYXNfYmVlbl9pbml0aWF0ZWQoc3RhdGU6ICZTdGF0ZSkg
                        LT4gYm9vbCB7CiAgICBsZXQgaW5pdGlhbF9ncmFwZSA9IG1hdGNoIHN0YXRlLmdyYXBlIHsKICAg
                        ICAgICBTb21lKF8pID0+IGZhbHNlLAogICAgICAgIE5vbmUgPT4gdHJ1ZSwKICAgIH07CiAgICBp
                        ZiBzdGF0ZS5oYXJ2ZXN0ID09IDAgJiYgaW5pdGlhbF9ncmFwZSAmJiBzdGF0ZS5vcmlnaW4gPT0g
                        Zm9ybWF0ISgiIikgewogICAgICAgIHJldHVybiBmYWxzZTsKICAgIH0KICAgIHJldHVybiB0cnVl
                        Owp9CgpmbiBjaGVja190ZW1wZXJhdHVyZV9pbl9yYW5nZSh0ZW1wZXJhdHVyZTogZjMyKSAtPiBi
                        b29sIHsKICAgIGlmIHRlbXBlcmF0dXJlID49IFRFTVBFUkFUVVJFX1JBTkdFLjAgJiYgdGVtcGVy
                        YXR1cmUgPD0gVEVNUEVSQVRVUkVfUkFOR0UuMSB7CiAgICAgICAgcmV0dXJuIHRydWU7CiAgICB9
                        CiAgICByZXR1cm4gZmFsc2U7Cn0KCmZuIGNoZWNrX2lzX29yZ2FuaWMoZmVydGlsaXplcnNfY29u
                        dHJvbDogYm9vbCwgcGVzdGljaWRlc19jb250cm9sOiBib29sLCBhbmFseXRpY3M6IGJvb2wpIC0+
                        IGJvb2wgewogICAgaWYgZmVydGlsaXplcnNfY29udHJvbCAmJiBwZXN0aWNpZGVzX2NvbnRyb2wg
                        JiYgYW5hbHl0aWNzIHsKICAgICAgICByZXR1cm4gdHJ1ZTsKICAgIH0KICAgIHJldHVybiBmYWxz
                        ZTsKfQo=
                        "
            },
            "id": "Wine",
            "initial_value": {
                "grape": null,
                "harvest": 0,
                "organic_certified": null,
                "origin": "",
                "temperature_control": {
                    "last_check": 0,
                    "temperature_ok": true
                }
            },
            "schema": {
                "additionalProperties": false,
                "description": "Representation of a bottle of wine",
                "properties": {
                    "grape": {
                        "description": "Type of grape",
                        "enum": [
                            "CabernetSauvignon",
                            "Chardonnay",
                            "PinotNoir",
                            null
                        ],
                        "type": [
                            "string",
                            "null"
                        ]
                    },
                    "harvest": {
                        "description": "Harvest number",
                        "type": "integer"
                    },
                    "organic_certified": {
                        "description": "Certificate authenticating whether it is organic or not",
                        "type": [
                            "boolean",
                            "null"
                        ]
                    },
                    "origin": {
                        "description": "Origin of the grape",
                        "type": "string"
                    },
                    "temperature_control": {
                        "additionalProperties": false,
                        "description": "Values to be changed in the temperature control event",
                        "properties": {
                            "last_check": {
                                "description": "Timestamp of last check",
                                "type": "integer"
                            },
                            "temperature_ok": {
                                "description": "Value that corroborates whether the wine cold chain has been complied with",
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "last_check",
                            "temperature_ok"
                        ],
                        "type": "object"
                    }
                },
                "required": [
                    "harvest",
                    "grape",
                    "origin",
                    "organic_certified",
                    "temperature_control"
                ],
                "type": "object"
            }
        }
    ]
}
```
{{< /alert-details >}}


Para generar los cambios mencionados, usaremos nuestra herramienta [**kore-Patch**](../../../docs/learn/tools/) de la siguiente manera:

```bash
kore-patch '{"policies":[{"approve":{"quorum":"MAJORITY"},"evaluate":{"quorum":"MAJORITY"},"id":"governance","validate":{"quorum":"MAJORITY"}}],"schemas":[]}' '{"policies":[{"approve":{"quorum":"MAJORITY"},"evaluate":{"quorum":"MAJORITY"},"id":"governance","validate":{"quorum":"MAJORITY"}},{"approve":{"quorum":"MAJORITY"},"evaluate":{"quorum":"MAJORITY"},"id":"Wine","validate":{"quorum":"MAJORITY"}}],"schemas":[{"contract":{"raw":"dXNlIHRhcGxlX3NjX3J1c3QgYXMgc2RrOwp1c2Ugc2VyZGU6OntEZXNlcmlhbGl6ZSwgU2VyaWFsaXplfTsKCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lLCBQYXJ0aWFsRXEpXSAKZW51bSBHcmFwZSB7CiAgICBDYWJlcm5ldFNhdXZpZ25vbiwKICAgIENoYXJkb25uYXksCiAgICBQaW5vdE5vaXIsCn0KCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lKV0Kc3RydWN0IFRlbXBlcmF0dXJlQ29udHJvbCB7CiAgICBwdWIgbGFzdF9jaGVjazogdTMyLAogICAgcHViIHRlbXBlcmF0dXJlX29rOiBib29sLAp9CgojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplLCBDbG9uZSldCnN0cnVjdCBTdGF0ZSB7CiAgICBwdWIgaGFydmVzdDogdTMyLAogICAgcHViIGdyYXBlOiBPcHRpb248R3JhcGU+LAogICAgcHViIG9yaWdpbjogU3RyaW5nLAogICAgcHViIG9yZ2FuaWNfY2VydGlmaWVkOiBPcHRpb248Ym9vbD4sCiAgICBwdWIgdGVtcGVyYXR1cmVfY29udHJvbDogVGVtcGVyYXR1cmVDb250cm9sLAp9CgojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplKV0KZW51bSBTdGF0ZUV2ZW50IHsKICAgIEluaXQgewogICAgICAgIGhhcnZlc3Q6IHUzMiwKICAgICAgICBncmFwZTogU3RyaW5nLAogICAgICAgIG9yaWdpbjogU3RyaW5nLAogICAgfSwKICAgIFRlbXBlcmF0dXJlQ29udHJvbCB7CiAgICAgICAgdGVtcGVyYXR1cmU6IGYzMiwKICAgICAgICB0aW1lc3RhbXA6IHUzMiwKICAgIH0sCiAgICBPcmdhbmljQ2VydGlmaWNhdGlvbiB7CiAgICAgICAgZmVydGlsaXplcnNfY29udHJvbDogYm9vbCwKICAgICAgICBwZXN0aWNpZGVzX2NvbnRyb2w6IGJvb2wsCiAgICAgICAgYW5hbHl0aWNzOiBib29sLAogICAgICAgIGFkZGl0aW9uYWxfaW5mbzogU3RyaW5nLAogICAgfSwKfQoKY29uc3QgVEVNUEVSQVRVUkVfUkFOR0U6IChmMzIsIGYzMikgPSAoMTAuMCwgMTYuMCk7CgojW25vX21hbmdsZV0KcHViIHVuc2FmZSBmbiBtYWluX2Z1bmN0aW9uKHN0YXRlX3B0cjogaTMyLCBldmVudF9wdHI6IGkzMiwgaXNfb3duZXI6IGkzMikgLT4gdTMyIHsKICAgIHNkazo6ZXhlY3V0ZV9jb250cmFjdChzdGF0ZV9wdHIsIGV2ZW50X3B0ciwgaXNfb3duZXIsIGNvbnRyYWN0X2xvZ2ljKQp9CgpmbiBjb250cmFjdF9sb2dpYygKICAgIGNvbnRleHQ6ICZzZGs6OkNvbnRleHQ8U3RhdGUsIFN0YXRlRXZlbnQ+LAogICAgY29udHJhY3RfcmVzdWx0OiAmbXV0IHNkazo6Q29udHJhY3RSZXN1bHQ8U3RhdGU+LAopIHsKICAgIGxldCBzdGF0ZSA9ICZtdXQgY29udHJhY3RfcmVzdWx0LmZpbmFsX3N0YXRlOwogICAgbWF0Y2ggJmNvbnRleHQuZXZlbnQgewogICAgICAgIFN0YXRlRXZlbnQ6OkluaXQgewogICAgICAgICAgICBoYXJ2ZXN0LAogICAgICAgICAgICBncmFwZSwKICAgICAgICAgICAgb3JpZ2luLAogICAgICAgIH0gPT4gewogICAgICAgICAgICBpZiBjb250ZXh0LmlzX293bmVyICYmICFjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkgewogICAgICAgICAgICAgICAgbGV0IGdyYXBlID0gbWF0Y2ggZ3JhcGUuYXNfc3RyKCkgewogICAgICAgICAgICAgICAgICAgICJDYWJlcm5ldFNhdXZpZ25vbiIgPT4gU29tZShHcmFwZTo6Q2FiZXJuZXRTYXV2aWdub24pLAogICAgICAgICAgICAgICAgICAgICJDaGFyZG9ubmF5IiA9PiBTb21lKEdyYXBlOjpDaGFyZG9ubmF5KSwKICAgICAgICAgICAgICAgICAgICAiUGlub3ROb2lyIiA9PiBTb21lKEdyYXBlOjpQaW5vdE5vaXIpLAogICAgICAgICAgICAgICAgICAgIF8gPT4gTm9uZSwKICAgICAgICAgICAgICAgIH07CiAgICAgICAgICAgICAgICBpZiBncmFwZS5pc19zb21lKCkgewogICAgICAgICAgICAgICAgICAgIHN0YXRlLmhhcnZlc3QgPSAqaGFydmVzdDsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS5ncmFwZSA9IGdyYXBlOwogICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yaWdpbiA9IG9yaWdpbi50b19zdHJpbmcoKTsKICAgICAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgU3RhdGVFdmVudDo6VGVtcGVyYXR1cmVDb250cm9sIHsKICAgICAgICAgICAgdGVtcGVyYXR1cmUsCiAgICAgICAgICAgIHRpbWVzdGFtcCwKICAgICAgICB9ID0+IHsKICAgICAgICAgICAgaWYgY29udGV4dC5pc19vd25lciAmJiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkgewogICAgICAgICAgICAgICAgaWYgY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UoKnRlbXBlcmF0dXJlKQogICAgICAgICAgICAgICAgICAgICYmIHN0YXRlLnRlbXBlcmF0dXJlX2NvbnRyb2wudGVtcGVyYXR1cmVfb2sKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLmxhc3RfY2hlY2sgPSAqdGltZXN0YW1wOwogICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLnRlbXBlcmF0dXJlX29rID0gZmFsc2U7CiAgICAgICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmVfY29udHJvbC5sYXN0X2NoZWNrID0gKnRpbWVzdGFtcDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5zdWNjZXNzID0gdHJ1ZTsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICBTdGF0ZUV2ZW50OjpPcmdhbmljQ2VydGlmaWNhdGlvbiB7CiAgICAgICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2wsCiAgICAgICAgICAgIHBlc3RpY2lkZXNfY29udHJvbCwKICAgICAgICAgICAgYW5hbHl0aWNzLAogICAgICAgICAgICBhZGRpdGlvbmFsX2luZm8sCiAgICAgICAgfSA9PiB7CiAgICAgICAgICAgIGlmIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7CiAgICAgICAgICAgICAgICBtYXRjaCBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCB7CiAgICAgICAgICAgICAgICAgICAgU29tZShvcmdhbmljX2NlcmlmaWVkKSA9PiB7CiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9yZ2FuaWNfY2VyaWZpZWQKICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICFjaGVja19pc19vcmdhbmljKAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpmZXJ0aWxpemVyc19jb250cm9sLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpwZXN0aWNpZGVzX2NvbnRyb2wsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKmFuYWx5dGljcywKICAgICAgICAgICAgICAgICAgICAgICAgICAgICkKICAgICAgICAgICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBOb25lID0+IHsKICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hlY2tfaXNfb3JnYW5pYygqZmVydGlsaXplcnNfY29udHJvbCwgKnBlc3RpY2lkZXNfY29udHJvbCwgKmFuYWx5dGljcykgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKHRydWUpOwogICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5hcHByb3ZhbF9yZXF1aXJlZCA9IHRydWU7CiAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICB9Cn0KCmZuIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlOiAmU3RhdGUpIC0+IGJvb2wgewogICAgbGV0IGluaXRpYWxfZ3JhcGUgPSBtYXRjaCBzdGF0ZS5ncmFwZSB7CiAgICAgICAgU29tZShfKSA9PiBmYWxzZSwKICAgICAgICBOb25lID0+IHRydWUsCiAgICB9OwogICAgaWYgc3RhdGUuaGFydmVzdCA9PSAwICYmIGluaXRpYWxfZ3JhcGUgJiYgc3RhdGUub3JpZ2luID09IGZvcm1hdCEoIiIpIHsKICAgICAgICByZXR1cm4gZmFsc2U7CiAgICB9CiAgICByZXR1cm4gdHJ1ZTsKfQoKZm4gY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UodGVtcGVyYXR1cmU6IGYzMikgLT4gYm9vbCB7CiAgICBpZiB0ZW1wZXJhdHVyZSA+PSBURU1QRVJBVFVSRV9SQU5HRS4wICYmIHRlbXBlcmF0dXJlIDw9IFRFTVBFUkFUVVJFX1JBTkdFLjEgewogICAgICAgIHJldHVybiB0cnVlOwogICAgfQogICAgcmV0dXJuIGZhbHNlOwp9CgpmbiBjaGVja19pc19vcmdhbmljKGZlcnRpbGl6ZXJzX2NvbnRyb2w6IGJvb2wsIHBlc3RpY2lkZXNfY29udHJvbDogYm9vbCwgYW5hbHl0aWNzOiBib29sKSAtPiBib29sIHsKICAgIGlmIGZlcnRpbGl6ZXJzX2NvbnRyb2wgJiYgcGVzdGljaWRlc19jb250cm9sICYmIGFuYWx5dGljcyB7CiAgICAgICAgcmV0dXJuIHRydWU7CiAgICB9CiAgICByZXR1cm4gZmFsc2U7Cn0="},"id":"Wine","initial_value":{"grape":null,"harvest":0,"organic_certified":null,"origin":"","temperature_control":{"last_check":0,"temperature_ok":true}},"schema":{"additionalProperties":false,"description":"Representationofabottleofwine","properties":{"grape":{"description":"Typeofgrape","enum":["CabernetSauvignon","Chardonnay","PinotNoir",null],"type":["string","null"]},"harvest":{"description":"Harvestnumber","type":"integer"},"organic_certified":{"description":"Certificateauthenticatingwhetheritisorganicornot","type":["boolean","null"]},"origin":{"description":"Originofthegrape","type":"string"},"temperature_control":{"additionalProperties":false,"description":"Valuestobechangedinthetemperaturecontrolevent","properties":{"last_check":{"description":"Timestampoflastcheck","type":"integer"},"temperature_ok":{"description":"Valuethatcorroborateswhetherthewinecoldchainhasbeencompliedwith","type":"boolean"}},"required":["last_check","temperature_ok"],"type":"object"}},"required":["harvest","grape","origin","organic_certified","temperature_control"],"type":"object"}}]}'
```

El resultado obtenido será el siguiente:
{{< alert-details type="info" title="Resultado" summary="Pincha para ver la gobernanza" >}}
```json
[
    {
        "op": "add",
        "path": "/policies/1",
        "value": {
            "approve": {
                "quorum": "MAJORITY"
            },
            "evaluate": {
                "quorum": "MAJORITY"
            },
            "id": "Wine",
            "validate": {
                "quorum": "MAJORITY"
            }
        }
    },
    {
        "op": "add",
        "path": "/schemas/0",
        "value": {
            "contract": {
                "raw": "dXNlIHRhcGxlX3NjX3J1c3QgYXMgc2RrOwp1c2Ugc2VyZGU6OntEZXNlcmlhbGl6ZSwgU2VyaWFsaXplfTsKCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lLCBQYXJ0aWFsRXEpXSAKZW51bSBHcmFwZSB7CiAgICBDYWJlcm5ldFNhdXZpZ25vbiwKICAgIENoYXJkb25uYXksCiAgICBQaW5vdE5vaXIsCn0KCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lKV0Kc3RydWN0IFRlbXBlcmF0dXJlQ29udHJvbCB7CiAgICBwdWIgbGFzdF9jaGVjazogdTMyLAogICAgcHViIHRlbXBlcmF0dXJlX29rOiBib29sLAp9CgojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplLCBDbG9uZSldCnN0cnVjdCBTdGF0ZSB7CiAgICBwdWIgaGFydmVzdDogdTMyLAogICAgcHViIGdyYXBlOiBPcHRpb248R3JhcGU+LAogICAgcHViIG9yaWdpbjogU3RyaW5nLAogICAgcHViIG9yZ2FuaWNfY2VydGlmaWVkOiBPcHRpb248Ym9vbD4sCiAgICBwdWIgdGVtcGVyYXR1cmVfY29udHJvbDogVGVtcGVyYXR1cmVDb250cm9sLAp9CgojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplKV0KZW51bSBTdGF0ZUV2ZW50IHsKICAgIEluaXQgewogICAgICAgIGhhcnZlc3Q6IHUzMiwKICAgICAgICBncmFwZTogU3RyaW5nLAogICAgICAgIG9yaWdpbjogU3RyaW5nLAogICAgfSwKICAgIFRlbXBlcmF0dXJlQ29udHJvbCB7CiAgICAgICAgdGVtcGVyYXR1cmU6IGYzMiwKICAgICAgICB0aW1lc3RhbXA6IHUzMiwKICAgIH0sCiAgICBPcmdhbmljQ2VydGlmaWNhdGlvbiB7CiAgICAgICAgZmVydGlsaXplcnNfY29udHJvbDogYm9vbCwKICAgICAgICBwZXN0aWNpZGVzX2NvbnRyb2w6IGJvb2wsCiAgICAgICAgYW5hbHl0aWNzOiBib29sLAogICAgICAgIGFkZGl0aW9uYWxfaW5mbzogU3RyaW5nLAogICAgfSwKfQoKY29uc3QgVEVNUEVSQVRVUkVfUkFOR0U6IChmMzIsIGYzMikgPSAoMTAuMCwgMTYuMCk7CgojW25vX21hbmdsZV0KcHViIHVuc2FmZSBmbiBtYWluX2Z1bmN0aW9uKHN0YXRlX3B0cjogaTMyLCBldmVudF9wdHI6IGkzMiwgaXNfb3duZXI6IGkzMikgLT4gdTMyIHsKICAgIHNkazo6ZXhlY3V0ZV9jb250cmFjdChzdGF0ZV9wdHIsIGV2ZW50X3B0ciwgaXNfb3duZXIsIGNvbnRyYWN0X2xvZ2ljKQp9CgpmbiBjb250cmFjdF9sb2dpYygKICAgIGNvbnRleHQ6ICZzZGs6OkNvbnRleHQ8U3RhdGUsIFN0YXRlRXZlbnQ+LAogICAgY29udHJhY3RfcmVzdWx0OiAmbXV0IHNkazo6Q29udHJhY3RSZXN1bHQ8U3RhdGU+LAopIHsKICAgIGxldCBzdGF0ZSA9ICZtdXQgY29udHJhY3RfcmVzdWx0LmZpbmFsX3N0YXRlOwogICAgbWF0Y2ggJmNvbnRleHQuZXZlbnQgewogICAgICAgIFN0YXRlRXZlbnQ6OkluaXQgewogICAgICAgICAgICBoYXJ2ZXN0LAogICAgICAgICAgICBncmFwZSwKICAgICAgICAgICAgb3JpZ2luLAogICAgICAgIH0gPT4gewogICAgICAgICAgICBpZiBjb250ZXh0LmlzX293bmVyICYmICFjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkgewogICAgICAgICAgICAgICAgbGV0IGdyYXBlID0gbWF0Y2ggZ3JhcGUuYXNfc3RyKCkgewogICAgICAgICAgICAgICAgICAgICJDYWJlcm5ldFNhdXZpZ25vbiIgPT4gU29tZShHcmFwZTo6Q2FiZXJuZXRTYXV2aWdub24pLAogICAgICAgICAgICAgICAgICAgICJDaGFyZG9ubmF5IiA9PiBTb21lKEdyYXBlOjpDaGFyZG9ubmF5KSwKICAgICAgICAgICAgICAgICAgICAiUGlub3ROb2lyIiA9PiBTb21lKEdyYXBlOjpQaW5vdE5vaXIpLAogICAgICAgICAgICAgICAgICAgIF8gPT4gTm9uZSwKICAgICAgICAgICAgICAgIH07CiAgICAgICAgICAgICAgICBpZiBncmFwZS5pc19zb21lKCkgewogICAgICAgICAgICAgICAgICAgIHN0YXRlLmhhcnZlc3QgPSAqaGFydmVzdDsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS5ncmFwZSA9IGdyYXBlOwogICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yaWdpbiA9IG9yaWdpbi50b19zdHJpbmcoKTsKICAgICAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgU3RhdGVFdmVudDo6VGVtcGVyYXR1cmVDb250cm9sIHsKICAgICAgICAgICAgdGVtcGVyYXR1cmUsCiAgICAgICAgICAgIHRpbWVzdGFtcCwKICAgICAgICB9ID0+IHsKICAgICAgICAgICAgaWYgY29udGV4dC5pc19vd25lciAmJiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkgewogICAgICAgICAgICAgICAgaWYgY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UoKnRlbXBlcmF0dXJlKQogICAgICAgICAgICAgICAgICAgICYmIHN0YXRlLnRlbXBlcmF0dXJlX2NvbnRyb2wudGVtcGVyYXR1cmVfb2sKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLmxhc3RfY2hlY2sgPSAqdGltZXN0YW1wOwogICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLnRlbXBlcmF0dXJlX29rID0gZmFsc2U7CiAgICAgICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmVfY29udHJvbC5sYXN0X2NoZWNrID0gKnRpbWVzdGFtcDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5zdWNjZXNzID0gdHJ1ZTsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICBTdGF0ZUV2ZW50OjpPcmdhbmljQ2VydGlmaWNhdGlvbiB7CiAgICAgICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2wsCiAgICAgICAgICAgIHBlc3RpY2lkZXNfY29udHJvbCwKICAgICAgICAgICAgYW5hbHl0aWNzLAogICAgICAgICAgICBhZGRpdGlvbmFsX2luZm8sCiAgICAgICAgfSA9PiB7CiAgICAgICAgICAgIGlmIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7CiAgICAgICAgICAgICAgICBtYXRjaCBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCB7CiAgICAgICAgICAgICAgICAgICAgU29tZShvcmdhbmljX2NlcmlmaWVkKSA9PiB7CiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9yZ2FuaWNfY2VyaWZpZWQKICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICFjaGVja19pc19vcmdhbmljKAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpmZXJ0aWxpemVyc19jb250cm9sLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpwZXN0aWNpZGVzX2NvbnRyb2wsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKmFuYWx5dGljcywKICAgICAgICAgICAgICAgICAgICAgICAgICAgICkKICAgICAgICAgICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBOb25lID0+IHsKICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hlY2tfaXNfb3JnYW5pYygqZmVydGlsaXplcnNfY29udHJvbCwgKnBlc3RpY2lkZXNfY29udHJvbCwgKmFuYWx5dGljcykgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKHRydWUpOwogICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5hcHByb3ZhbF9yZXF1aXJlZCA9IHRydWU7CiAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICB9Cn0KCmZuIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlOiAmU3RhdGUpIC0+IGJvb2wgewogICAgbGV0IGluaXRpYWxfZ3JhcGUgPSBtYXRjaCBzdGF0ZS5ncmFwZSB7CiAgICAgICAgU29tZShfKSA9PiBmYWxzZSwKICAgICAgICBOb25lID0+IHRydWUsCiAgICB9OwogICAgaWYgc3RhdGUuaGFydmVzdCA9PSAwICYmIGluaXRpYWxfZ3JhcGUgJiYgc3RhdGUub3JpZ2luID09IGZvcm1hdCEoIiIpIHsKICAgICAgICByZXR1cm4gZmFsc2U7CiAgICB9CiAgICByZXR1cm4gdHJ1ZTsKfQoKZm4gY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UodGVtcGVyYXR1cmU6IGYzMikgLT4gYm9vbCB7CiAgICBpZiB0ZW1wZXJhdHVyZSA+PSBURU1QRVJBVFVSRV9SQU5HRS4wICYmIHRlbXBlcmF0dXJlIDw9IFRFTVBFUkFUVVJFX1JBTkdFLjEgewogICAgICAgIHJldHVybiB0cnVlOwogICAgfQogICAgcmV0dXJuIGZhbHNlOwp9CgpmbiBjaGVja19pc19vcmdhbmljKGZlcnRpbGl6ZXJzX2NvbnRyb2w6IGJvb2wsIHBlc3RpY2lkZXNfY29udHJvbDogYm9vbCwgYW5hbHl0aWNzOiBib29sKSAtPiBib29sIHsKICAgIGlmIGZlcnRpbGl6ZXJzX2NvbnRyb2wgJiYgcGVzdGljaWRlc19jb250cm9sICYmIGFuYWx5dGljcyB7CiAgICAgICAgcmV0dXJuIHRydWU7CiAgICB9CiAgICByZXR1cm4gZmFsc2U7Cn0="
            },
            "id": "Wine",
            "initial_value": {
                "grape": null,
                "harvest": 0,
                "organic_certified": null,
                "origin": "",
                "temperature_control": {
                    "last_check": 0,
                    "temperature_ok": true
                }
            },
            "schema": {
                "additionalProperties": false,
                "description": "Representationofabottleofwine",
                "properties": {
                    "grape": {
                        "description": "Typeofgrape",
                        "enum": [
                            "CabernetSauvignon",
                            "Chardonnay",
                            "PinotNoir",
                            null
                        ],
                        "type": [
                            "string",
                            "null"
                        ]
                    },
                    "harvest": {
                        "description": "Harvestnumber",
                        "type": "integer"
                    },
                    "organic_certified": {
                        "description": "Certificateauthenticatingwhetheritisorganicornot",
                        "type": [
                            "boolean",
                            "null"
                        ]
                    },
                    "origin": {
                        "description": "Originofthegrape",
                        "type": "string"
                    },
                    "temperature_control": {
                        "additionalProperties": false,
                        "description": "Valuestobechangedinthetemperaturecontrolevent",
                        "properties": {
                            "last_check": {
                                "description": "Timestampoflastcheck",
                                "type": "integer"
                            },
                            "temperature_ok": {
                                "description": "Valuethatcorroborateswhetherthewinecoldchainhasbeencompliedwith",
                                "type": "boolean"
                            }
                        },
                        "required": [
                            "last_check",
                            "temperature_ok"
                        ],
                        "type": "object"
                    }
                },
                "required": [
                    "harvest",
                    "grape",
                    "origin",
                    "organic_certified",
                    "temperature_control"
                ],
                "type": "object"
            }
        }
    }
]
```
{{< /alert-details >}}


Ahora es el momento de llamar al método del contrato de la gobernanza responsable de actualizar sus propiedades. Para ello ejecutaremos lo siguiente:

{{< alert-details type="info" title="Evento" summary="Pincha para ver el evento" >}}
```bash
curl --request POST 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Fact": {
            "subject_id": {{GOVERNANCE-ID}},
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/policies/1",
                            "value": {
                                "approve": {
                                    "quorum": "MAJORITY"
                                },
                                "evaluate": {
                                    "quorum": "MAJORITY"
                                },
                                "id": "Wine",
                                "validate": {
                                    "quorum": "MAJORITY"
                                }
                            }
                        },
                        {
                            "op": "add",
                            "path": "/schemas/0",
                            "value": {
                                "contract": {
                                    "raw": "dXNlIHRhcGxlX3NjX3J1c3QgYXMgc2RrOwp1c2Ugc2VyZGU6OntEZXNlcmlhbGl6ZSwgU2VyaWFsaXplfTsKCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lLCBQYXJ0aWFsRXEpXSAKZW51bSBHcmFwZSB7CiAgICBDYWJlcm5ldFNhdXZpZ25vbiwKICAgIENoYXJkb25uYXksCiAgICBQaW5vdE5vaXIsCn0KCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lKV0Kc3RydWN0IFRlbXBlcmF0dXJlQ29udHJvbCB7CiAgICBwdWIgbGFzdF9jaGVjazogdTMyLAogICAgcHViIHRlbXBlcmF0dXJlX29rOiBib29sLAp9CgojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplLCBDbG9uZSldCnN0cnVjdCBTdGF0ZSB7CiAgICBwdWIgaGFydmVzdDogdTMyLAogICAgcHViIGdyYXBlOiBPcHRpb248R3JhcGU+LAogICAgcHViIG9yaWdpbjogU3RyaW5nLAogICAgcHViIG9yZ2FuaWNfY2VydGlmaWVkOiBPcHRpb248Ym9vbD4sCiAgICBwdWIgdGVtcGVyYXR1cmVfY29udHJvbDogVGVtcGVyYXR1cmVDb250cm9sLAp9CgojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplKV0KZW51bSBTdGF0ZUV2ZW50IHsKICAgIEluaXQgewogICAgICAgIGhhcnZlc3Q6IHUzMiwKICAgICAgICBncmFwZTogU3RyaW5nLAogICAgICAgIG9yaWdpbjogU3RyaW5nLAogICAgfSwKICAgIFRlbXBlcmF0dXJlQ29udHJvbCB7CiAgICAgICAgdGVtcGVyYXR1cmU6IGYzMiwKICAgICAgICB0aW1lc3RhbXA6IHUzMiwKICAgIH0sCiAgICBPcmdhbmljQ2VydGlmaWNhdGlvbiB7CiAgICAgICAgZmVydGlsaXplcnNfY29udHJvbDogYm9vbCwKICAgICAgICBwZXN0aWNpZGVzX2NvbnRyb2w6IGJvb2wsCiAgICAgICAgYW5hbHl0aWNzOiBib29sLAogICAgICAgIGFkZGl0aW9uYWxfaW5mbzogU3RyaW5nLAogICAgfSwKfQoKY29uc3QgVEVNUEVSQVRVUkVfUkFOR0U6IChmMzIsIGYzMikgPSAoMTAuMCwgMTYuMCk7CgojW25vX21hbmdsZV0KcHViIHVuc2FmZSBmbiBtYWluX2Z1bmN0aW9uKHN0YXRlX3B0cjogaTMyLCBldmVudF9wdHI6IGkzMiwgaXNfb3duZXI6IGkzMikgLT4gdTMyIHsKICAgIHNkazo6ZXhlY3V0ZV9jb250cmFjdChzdGF0ZV9wdHIsIGV2ZW50X3B0ciwgaXNfb3duZXIsIGNvbnRyYWN0X2xvZ2ljKQp9CgpmbiBjb250cmFjdF9sb2dpYygKICAgIGNvbnRleHQ6ICZzZGs6OkNvbnRleHQ8U3RhdGUsIFN0YXRlRXZlbnQ+LAogICAgY29udHJhY3RfcmVzdWx0OiAmbXV0IHNkazo6Q29udHJhY3RSZXN1bHQ8U3RhdGU+LAopIHsKICAgIGxldCBzdGF0ZSA9ICZtdXQgY29udHJhY3RfcmVzdWx0LmZpbmFsX3N0YXRlOwogICAgbWF0Y2ggJmNvbnRleHQuZXZlbnQgewogICAgICAgIFN0YXRlRXZlbnQ6OkluaXQgewogICAgICAgICAgICBoYXJ2ZXN0LAogICAgICAgICAgICBncmFwZSwKICAgICAgICAgICAgb3JpZ2luLAogICAgICAgIH0gPT4gewogICAgICAgICAgICBpZiBjb250ZXh0LmlzX293bmVyICYmICFjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkgewogICAgICAgICAgICAgICAgbGV0IGdyYXBlID0gbWF0Y2ggZ3JhcGUuYXNfc3RyKCkgewogICAgICAgICAgICAgICAgICAgICJDYWJlcm5ldFNhdXZpZ25vbiIgPT4gU29tZShHcmFwZTo6Q2FiZXJuZXRTYXV2aWdub24pLAogICAgICAgICAgICAgICAgICAgICJDaGFyZG9ubmF5IiA9PiBTb21lKEdyYXBlOjpDaGFyZG9ubmF5KSwKICAgICAgICAgICAgICAgICAgICAiUGlub3ROb2lyIiA9PiBTb21lKEdyYXBlOjpQaW5vdE5vaXIpLAogICAgICAgICAgICAgICAgICAgIF8gPT4gTm9uZSwKICAgICAgICAgICAgICAgIH07CiAgICAgICAgICAgICAgICBpZiBncmFwZS5pc19zb21lKCkgewogICAgICAgICAgICAgICAgICAgIHN0YXRlLmhhcnZlc3QgPSAqaGFydmVzdDsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS5ncmFwZSA9IGdyYXBlOwogICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yaWdpbiA9IG9yaWdpbi50b19zdHJpbmcoKTsKICAgICAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7CiAgICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgICAgU3RhdGVFdmVudDo6VGVtcGVyYXR1cmVDb250cm9sIHsKICAgICAgICAgICAgdGVtcGVyYXR1cmUsCiAgICAgICAgICAgIHRpbWVzdGFtcCwKICAgICAgICB9ID0+IHsKICAgICAgICAgICAgaWYgY29udGV4dC5pc19vd25lciAmJiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZSkgewogICAgICAgICAgICAgICAgaWYgY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UoKnRlbXBlcmF0dXJlKQogICAgICAgICAgICAgICAgICAgICYmIHN0YXRlLnRlbXBlcmF0dXJlX2NvbnRyb2wudGVtcGVyYXR1cmVfb2sKICAgICAgICAgICAgICAgIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLmxhc3RfY2hlY2sgPSAqdGltZXN0YW1wOwogICAgICAgICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLnRlbXBlcmF0dXJlX29rID0gZmFsc2U7CiAgICAgICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmVfY29udHJvbC5sYXN0X2NoZWNrID0gKnRpbWVzdGFtcDsKICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5zdWNjZXNzID0gdHJ1ZTsKICAgICAgICAgICAgfQogICAgICAgIH0KICAgICAgICBTdGF0ZUV2ZW50OjpPcmdhbmljQ2VydGlmaWNhdGlvbiB7CiAgICAgICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2wsCiAgICAgICAgICAgIHBlc3RpY2lkZXNfY29udHJvbCwKICAgICAgICAgICAgYW5hbHl0aWNzLAogICAgICAgICAgICBhZGRpdGlvbmFsX2luZm8sCiAgICAgICAgfSA9PiB7CiAgICAgICAgICAgIGlmIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7CiAgICAgICAgICAgICAgICBtYXRjaCBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCB7CiAgICAgICAgICAgICAgICAgICAgU29tZShvcmdhbmljX2NlcmlmaWVkKSA9PiB7CiAgICAgICAgICAgICAgICAgICAgICAgIGlmIG9yZ2FuaWNfY2VyaWZpZWQKICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICFjaGVja19pc19vcmdhbmljKAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpmZXJ0aWxpemVyc19jb250cm9sLAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpwZXN0aWNpZGVzX2NvbnRyb2wsCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKmFuYWx5dGljcywKICAgICAgICAgICAgICAgICAgICAgICAgICAgICkKICAgICAgICAgICAgICAgICAgICAgICAgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgICAgICBOb25lID0+IHsKICAgICAgICAgICAgICAgICAgICAgICAgaWYgY2hlY2tfaXNfb3JnYW5pYygqZmVydGlsaXplcnNfY29udHJvbCwgKnBlc3RpY2lkZXNfY29udHJvbCwgKmFuYWx5dGljcykgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKHRydWUpOwogICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsKICAgICAgICAgICAgICAgICAgICAgICAgfQogICAgICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIH0KICAgICAgICAgICAgICAgIGNvbnRyYWN0X3Jlc3VsdC5hcHByb3ZhbF9yZXF1aXJlZCA9IHRydWU7CiAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICB9Cn0KCmZuIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlOiAmU3RhdGUpIC0+IGJvb2wgewogICAgbGV0IGluaXRpYWxfZ3JhcGUgPSBtYXRjaCBzdGF0ZS5ncmFwZSB7CiAgICAgICAgU29tZShfKSA9PiBmYWxzZSwKICAgICAgICBOb25lID0+IHRydWUsCiAgICB9OwogICAgaWYgc3RhdGUuaGFydmVzdCA9PSAwICYmIGluaXRpYWxfZ3JhcGUgJiYgc3RhdGUub3JpZ2luID09IGZvcm1hdCEoIiIpIHsKICAgICAgICByZXR1cm4gZmFsc2U7CiAgICB9CiAgICByZXR1cm4gdHJ1ZTsKfQoKZm4gY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UodGVtcGVyYXR1cmU6IGYzMikgLT4gYm9vbCB7CiAgICBpZiB0ZW1wZXJhdHVyZSA+PSBURU1QRVJBVFVSRV9SQU5HRS4wICYmIHRlbXBlcmF0dXJlIDw9IFRFTVBFUkFUVVJFX1JBTkdFLjEgewogICAgICAgIHJldHVybiB0cnVlOwogICAgfQogICAgcmV0dXJuIGZhbHNlOwp9CgpmbiBjaGVja19pc19vcmdhbmljKGZlcnRpbGl6ZXJzX2NvbnRyb2w6IGJvb2wsIHBlc3RpY2lkZXNfY29udHJvbDogYm9vbCwgYW5hbHl0aWNzOiBib29sKSAtPiBib29sIHsKICAgIGlmIGZlcnRpbGl6ZXJzX2NvbnRyb2wgJiYgcGVzdGljaWRlc19jb250cm9sICYmIGFuYWx5dGljcyB7CiAgICAgICAgcmV0dXJuIHRydWU7CiAgICB9CiAgICByZXR1cm4gZmFsc2U7Cn0="
                                },
                                "id": "Wine",
                                "initial_value": {
                                    "grape": null,
                                    "harvest": 0,
                                    "organic_certified": null,
                                    "origin": "",
                                    "temperature_control": {
                                        "last_check": 0,
                                        "temperature_ok": true
                                    }
                                },
                                "schema": {
                                    "additionalProperties": false,
                                    "description": "Representationofabottleofwine",
                                    "properties": {
                                        "grape": {
                                            "description": "Typeofgrape",
                                            "enum": [
                                                "CabernetSauvignon",
                                                "Chardonnay",
                                                "PinotNoir",
                                                null
                                            ],
                                            "type": [
                                                "string",
                                                "null"
                                            ]
                                        },
                                        "harvest": {
                                            "description": "Harvestnumber",
                                            "type": "integer"
                                        },
                                        "organic_certified": {
                                            "description": "Certificateauthenticatingwhetheritisorganicornot",
                                            "type": [
                                                "boolean",
                                                "null"
                                            ]
                                        },
                                        "origin": {
                                            "description": "Originofthegrape",
                                            "type": "string"
                                        },
                                        "temperature_control": {
                                            "additionalProperties": false,
                                            "description": "Valuestobechangedinthetemperaturecontrolevent",
                                            "properties": {
                                                "last_check": {
                                                    "description": "Timestampoflastcheck",
                                                    "type": "integer"
                                                },
                                                "temperature_ok": {
                                                    "description": "Valuethatcorroborateswhetherthewinecoldchainhasbeencompliedwith",
                                                    "type": "boolean"
                                                }
                                            },
                                            "required": [
                                                "last_check",
                                                "temperature_ok"
                                            ],
                                            "type": "object"
                                        }
                                    },
                                    "required": [
                                        "harvest",
                                        "grape",
                                        "origin",
                                        "organic_certified",
                                        "temperature_control"
                                    ],
                                    "type": "object"
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
}'
```
{{< /alert-details >}}

Una vez emitido el evento, necesitamos obtener la nueva solicitud de actualización. Para ello ejecutamos lo siguiente:

```bash 
curl --request GET 'http://localhost:3000/approval-requests?status=Pending'
```

Copiamos el valor del campo `id` y aceptamos la solicitud de actualización de gobernanza:

```bash
curl --request PATCH 'http://localhost:3000/approval-requests/{{PREVIUS-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{"state": "RespondedAccepted"}'
```

Finalmente, consultamos la gobernanza para verificar que el cambio se haya aplicado exitosamente. Si todo ha ido según lo planeado, ahora debería tener un `sn` de 2, y la nueva política, esquema, estado inicial para los sujetos *Wine* y el contrato deberían estar presentes:

```bash
curl --request GET 'http://localhost:3000/subjects/{{GOVERNANCE-ID}}'
```



{{< alert-details type="info" title="Gobernanza" summary="Pincha para ver la gobernanza" >}}
```json
{
    "subject_id": "{{GOVERNANCE-ID}}",
    "governance_id": "",
    "sn": 2,
    "public_key": "E8tVWEasubIp7P9fzk_HttNCsABymV9m9xEPAfr-QV7M",
    "namespace": "",
    "name": "wine_track",
    "schema_id": "governance",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "members": [
        {
            "id": "{{CONTROLLER-ID}}",
            "name": "WPO"
        }
        ],
        "policies": [
        {
            "approve": {
            "quorum": "MAJORITY"
            },
            "evaluate": {
            "quorum": "MAJORITY"
            },
            "id": "governance",
            "validate": {
            "quorum": "MAJORITY"
            }
        },
        {
            "approve": {
            "quorum": "MAJORITY"
            },
            "evaluate": {
            "quorum": "MAJORITY"
            },
            "id": "Wine",
            "validate": {
            "quorum": "MAJORITY"
            }
        }
        ],
        "roles": [
        {
            "namespace": "",
            "role": "WITNESS",
            "schema": {
            "ID": "governance"
            },
            "who": "MEMBERS"
        },
        {
            "namespace": "",
            "role": "APPROVER",
            "schema": {
            "ID": "governance"
            },
            "who": {
            "NAME": "WPO"
            }
        }
        ],
        "schemas": [
        {
            "contract": {
            "raw": "dXNlIHRhcGxlX3NjX3J1c3QgYXMgc2RrOw0KdXNlIHNlcmRlOjp7RGVzZXJpYWxpemUsIFNlcmlhbGl6ZX07DQoNCiNbZGVyaXZlKFNlcmlhbGl6ZSwgRGVzZXJpYWxpemUsIENsb25lLCBQYXJ0aWFsRXEpXSANCmVudW0gR3JhcGUgew0KICAgIENhYmVybmV0U2F1dmlnbm9uLA0KICAgIENoYXJkb25uYXksDQogICAgUGlub3ROb2lyLA0KfQ0KDQojW2Rlcml2ZShTZXJpYWxpemUsIERlc2VyaWFsaXplLCBDbG9uZSldDQpzdHJ1Y3QgVGVtcGVyYXR1cmVDb250cm9sIHsNCiAgICBwdWIgbGFzdF9jaGVjazogdTMyLA0KICAgIHB1YiB0ZW1wZXJhdHVyZV9vazogYm9vbCwNCn0NCg0KI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSwgQ2xvbmUpXQ0Kc3RydWN0IFN0YXRlIHsNCiAgICBwdWIgaGFydmVzdDogdTMyLA0KICAgIHB1YiBncmFwZTogT3B0aW9uPEdyYXBlPiwNCiAgICBwdWIgb3JpZ2luOiBTdHJpbmcsDQogICAgcHViIG9yZ2FuaWNfY2VydGlmaWVkOiBPcHRpb248Ym9vbD4sDQogICAgcHViIHRlbXBlcmF0dXJlX2NvbnRyb2w6IFRlbXBlcmF0dXJlQ29udHJvbCwNCn0NCg0KI1tkZXJpdmUoU2VyaWFsaXplLCBEZXNlcmlhbGl6ZSldDQplbnVtIFN0YXRlRXZlbnQgew0KICAgIEluaXQgew0KICAgICAgICBoYXJ2ZXN0OiB1MzIsDQogICAgICAgIGdyYXBlOiBTdHJpbmcsDQogICAgICAgIG9yaWdpbjogU3RyaW5nLA0KICAgIH0sDQogICAgVGVtcGVyYXR1cmVDb250cm9sIHsNCiAgICAgICAgdGVtcGVyYXR1cmU6IGYzMiwNCiAgICAgICAgdGltZXN0YW1wOiB1MzIsDQogICAgfSwNCiAgICBPcmdhbmljQ2VydGlmaWNhdGlvbiB7DQogICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2w6IGJvb2wsDQogICAgICAgIHBlc3RpY2lkZXNfY29udHJvbDogYm9vbCwNCiAgICAgICAgYW5hbHl0aWNzOiBib29sLA0KICAgICAgICBhZGRpdGlvbmFsX2luZm86IFN0cmluZywNCiAgICB9LA0KfQ0KDQpjb25zdCBURU1QRVJBVFVSRV9SQU5HRTogKGYzMiwgZjMyKSA9ICgxMC4wLCAxNi4wKTsNCg0KI1tub19tYW5nbGVdDQpwdWIgdW5zYWZlIGZuIG1haW5fZnVuY3Rpb24oc3RhdGVfcHRyOiBpMzIsIGV2ZW50X3B0cjogaTMyLCBpc19vd25lcjogaTMyKSAtPiB1MzIgew0KICAgIHNkazo6ZXhlY3V0ZV9jb250cmFjdChzdGF0ZV9wdHIsIGV2ZW50X3B0ciwgaXNfb3duZXIsIGNvbnRyYWN0X2xvZ2ljKQ0KfQ0KDQpmbiBjb250cmFjdF9sb2dpYygNCiAgICBjb250ZXh0OiAmc2RrOjpDb250ZXh0PFN0YXRlLCBTdGF0ZUV2ZW50PiwNCiAgICBjb250cmFjdF9yZXN1bHQ6ICZtdXQgc2RrOjpDb250cmFjdFJlc3VsdDxTdGF0ZT4sDQopIHsNCiAgICBsZXQgc3RhdGUgPSAmbXV0IGNvbnRyYWN0X3Jlc3VsdC5maW5hbF9zdGF0ZTsNCiAgICBtYXRjaCAmY29udGV4dC5ldmVudCB7DQogICAgICAgIFN0YXRlRXZlbnQ6OkluaXQgew0KICAgICAgICAgICAgaGFydmVzdCwNCiAgICAgICAgICAgIGdyYXBlLA0KICAgICAgICAgICAgb3JpZ2luLA0KICAgICAgICB9ID0+IHsNCiAgICAgICAgICAgIGlmIGNvbnRleHQuaXNfb3duZXIgJiYgIWNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7IC8vIFNvbG8gbG8gcHVlZGRlIGhhY2VyIGVsIHByb3BpZXRhcmlvw6cNCiAgICAgICAgICAgICAgICBsZXQgZ3JhcGUgPSBtYXRjaCBncmFwZS5hc19zdHIoKSB7DQogICAgICAgICAgICAgICAgICAgICJDYWJlcm5ldFNhdXZpZ25vbiIgPT4gU29tZShHcmFwZTo6Q2FiZXJuZXRTYXV2aWdub24pLA0KICAgICAgICAgICAgICAgICAgICAiQ2hhcmRvbm5heSIgPT4gU29tZShHcmFwZTo6Q2hhcmRvbm5heSksDQogICAgICAgICAgICAgICAgICAgICJQaW5vdE5vaXIiID0+IFNvbWUoR3JhcGU6OlBpbm90Tm9pciksDQogICAgICAgICAgICAgICAgICAgIF8gPT4gTm9uZSwNCiAgICAgICAgICAgICAgICB9Ow0KICAgICAgICAgICAgICAgIGlmIGdyYXBlLmlzX3NvbWUoKSB7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLmhhcnZlc3QgPSAqaGFydmVzdDsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUuZ3JhcGUgPSBncmFwZTsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JpZ2luID0gb3JpZ2luLnRvX3N0cmluZygpOw0KICAgICAgICAgICAgICAgICAgICBjb250cmFjdF9yZXN1bHQuc3VjY2VzcyA9IHRydWU7DQogICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgICAgIFN0YXRlRXZlbnQ6OlRlbXBlcmF0dXJlQ29udHJvbCB7DQogICAgICAgICAgICB0ZW1wZXJhdHVyZSwNCiAgICAgICAgICAgIHRpbWVzdGFtcCwNCiAgICAgICAgfSA9PiB7DQogICAgICAgICAgICBpZiBjb250ZXh0LmlzX293bmVyICYmIGNoZWNrX3N1YmplY3RfaGFzX2JlZW5faW5pdGlhdGVkKHN0YXRlKSB7DQogICAgICAgICAgICAgICAgaWYgY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UoKnRlbXBlcmF0dXJlKQ0KICAgICAgICAgICAgICAgICAgICAmJiBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLnRlbXBlcmF0dXJlX29rDQogICAgICAgICAgICAgICAgew0KICAgICAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZV9jb250cm9sLmxhc3RfY2hlY2sgPSAqdGltZXN0YW1wOw0KICAgICAgICAgICAgICAgIH0gZWxzZSB7DQogICAgICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlX2NvbnRyb2wudGVtcGVyYXR1cmVfb2sgPSBmYWxzZTsNCiAgICAgICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmVfY29udHJvbC5sYXN0X2NoZWNrID0gKnRpbWVzdGFtcDsNCiAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgY29udHJhY3RfcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgICAgIFN0YXRlRXZlbnQ6Ok9yZ2FuaWNDZXJ0aWZpY2F0aW9uIHsNCiAgICAgICAgICAgIGZlcnRpbGl6ZXJzX2NvbnRyb2wsDQogICAgICAgICAgICBwZXN0aWNpZGVzX2NvbnRyb2wsDQogICAgICAgICAgICBhbmFseXRpY3MsDQogICAgICAgICAgICBhZGRpdGlvbmFsX2luZm8sDQogICAgICAgIH0gPT4gew0KICAgICAgICAgICAgaWYgY2hlY2tfc3ViamVjdF9oYXNfYmVlbl9pbml0aWF0ZWQoc3RhdGUpIHsNCiAgICAgICAgICAgICAgICBtYXRjaCBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCB7DQogICAgICAgICAgICAgICAgICAgIFNvbWUob3JnYW5pY19jZXJpZmllZCkgPT4gew0KICAgICAgICAgICAgICAgICAgICAgICAgaWYgb3JnYW5pY19jZXJpZmllZA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICYmICFjaGVja19pc19vcmdhbmljKA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqZmVydGlsaXplcnNfY29udHJvbCwNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKnBlc3RpY2lkZXNfY29udHJvbCwNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKmFuYWx5dGljcywNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICApDQogICAgICAgICAgICAgICAgICAgICAgICB7DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUub3JnYW5pY19jZXJ0aWZpZWQgPSBTb21lKGZhbHNlKTsNCiAgICAgICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICAgICAgfQ0KICAgICAgICAgICAgICAgICAgICBOb25lID0+IHsNCiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoZWNrX2lzX29yZ2FuaWMoKmZlcnRpbGl6ZXJzX2NvbnRyb2wsICpwZXN0aWNpZGVzX2NvbnRyb2wsICphbmFseXRpY3MpIHsNCiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZS5vcmdhbmljX2NlcnRpZmllZCA9IFNvbWUodHJ1ZSk7DQogICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Ugew0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlLm9yZ2FuaWNfY2VydGlmaWVkID0gU29tZShmYWxzZSk7DQogICAgICAgICAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICB9DQogICAgICAgICAgICAgICAgY29udHJhY3RfcmVzdWx0LnN1Y2Nlc3MgPSB0cnVlOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9DQogICAgfQ0KfQ0KDQpmbiBjaGVja19zdWJqZWN0X2hhc19iZWVuX2luaXRpYXRlZChzdGF0ZTogJlN0YXRlKSAtPiBib29sIHsNCiAgICBsZXQgaW5pdGlhbF9ncmFwZSA9IG1hdGNoIHN0YXRlLmdyYXBlIHsNCiAgICAgICAgU29tZShfKSA9PiBmYWxzZSwNCiAgICAgICAgTm9uZSA9PiB0cnVlLA0KICAgIH07DQogICAgaWYgc3RhdGUuaGFydmVzdCA9PSAwICYmIGluaXRpYWxfZ3JhcGUgJiYgc3RhdGUub3JpZ2luID09IGZvcm1hdCEoIiIpIHsNCiAgICAgICAgcmV0dXJuIGZhbHNlOw0KICAgIH0NCiAgICByZXR1cm4gdHJ1ZTsNCn0NCg0KZm4gY2hlY2tfdGVtcGVyYXR1cmVfaW5fcmFuZ2UodGVtcGVyYXR1cmU6IGYzMikgLT4gYm9vbCB7DQogICAgaWYgdGVtcGVyYXR1cmUgPj0gVEVNUEVSQVRVUkVfUkFOR0UuMCAmJiB0ZW1wZXJhdHVyZSA8PSBURU1QRVJBVFVSRV9SQU5HRS4xIHsNCiAgICAgICAgcmV0dXJuIHRydWU7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0NCg0KZm4gY2hlY2tfaXNfb3JnYW5pYyhmZXJ0aWxpemVyc19jb250cm9sOiBib29sLCBwZXN0aWNpZGVzX2NvbnRyb2w6IGJvb2wsIGFuYWx5dGljczogYm9vbCkgLT4gYm9vbCB7DQogICAgaWYgZmVydGlsaXplcnNfY29udHJvbCAmJiBwZXN0aWNpZGVzX2NvbnRyb2wgJiYgYW5hbHl0aWNzIHsNCiAgICAgICAgcmV0dXJuIHRydWU7DQogICAgfQ0KICAgIHJldHVybiBmYWxzZTsNCn0="
            },
            "id": "Wine",
            "initial_value": {
            "grape": null,
            "harvest": 0,
            "organic_certified": null,
            "origin": "",
            "temperature_control": {
                "last_check": 0,
                "temperature_ok": true
            }
            },
            "schema": {
            "additionalProperties": false,
            "description": "Representation of a bottle of wine",
            "properties": {
                "grape": {
                "description": "Type of grape",
                "enum": [
                    "CabernetSauvignon",
                    "Chardonnay",
                    "PinotNoir",
                    null
                ],
                "type": [
                    "string",
                    "null"
                ]
                },
                "harvest": {
                "description": "Harvest number",
                "type": "integer"
                },
                "organic_certified": {
                "description": "Certificate authenticating whether it is organic or not",
                "type": [
                    "boolean",
                    "null"
                ]
                },
                "origin": {
                "description": "Origin of the grape",
                "type": "string"
                },
                "temperature_control": {
                "additionalProperties": false,
                "description": "Values to be changed in the temperature control event",
                "properties": {
                    "last_check": {
                    "description": "Timestamp of last check",
                    "type": "integer"
                    },
                    "temperature_ok": {
                    "description": "Value that corroborates whether the wine cold chain has been complied with",
                    "type": "boolean"
                    }
                },
                "required": [
                    "last_check",
                    "temperature_ok"
                ],
                "type": "object"
                }
            },
            "required": [
                "harvest",
                "grape",
                "origin",
                "organic_certified",
                "temperature_control"
            ],
            "type": "object"
            }
        }
        ]
    },
    "active": true
}
```
{{< /alert-details >}}