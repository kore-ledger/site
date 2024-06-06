---
title: Transferencia
pagination_next: build/assets-traceability/running-node
date: 2024-05-06
weight: 9
---
En este apartado abordaremos la transferencia de propiedad de un sujeto de tipo *Vino* a un **ciudadano** interesado en adquirirlo.

Cualquier sujeto que no haya completado su ciclo de vida en kore puede ser transferido a un nuevo propietario, independientemente de si el nuevo propietario forma parte de la gobernanza o no.

Para llevar a cabo esta transferencia, necesitamos configurar un nuevo nodo que actuará como nuevo propietario externo fuera de la gobernanza. Seguiremos estos pasos:

```bash
docker run -p 3004:3000 -p 50004:50000 -e KORE_PASSWORD=polopo -e KORE_FILE_PATH=./config.json -v ./config2.json:/config.json koreadmin/kore-http:arm64-sqlite
```

Hasta este momento al crear el sujeto no hemos tenido que declarar su clave pública, aunque siempre tuvimos la posibilidad de hacerlo. Sin embargo, en este caso es diferente porque, durante la transferencia, el nuevo propietario debe generar una clave pública con la que quiere gestionar el sujeto que se le transfiere. Para ello deberán ejecutar lo siguiente:

```bash
curl --request 'http://localhost:3004/generate-keys
```

Esto generará una `clave_pública`, que debe copiarse y guardarse para su uso posterior.

A continuación activaremos la preautorización de la gobernanza desde la que queremos transferir el sujeto. Dentro de los `proveedores`, especificaremos el nodo al que pertenece. Al no ser miembros de la gobernanza nadie nos lo enviará automáticamente, por lo que debemos autorizarlo e informar a nuestro nodo de sus posibles proveedores. En este caso solicitaremos la gobernanza al nodo **WPO**, ya que es el propietario:

```bash
curl --request PUT 'http://localhost:3004/allowed-subjects/{{GOVERNANCE-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "providers": ["{{CONTROLLER-ID}}"]
}'
```

Además de lo anterior, también será necesario preautorizar el sujeto que queremos recibir ya que no somos testigos ni de la gobernanza ni de los sujetos de tipo *Vino*:

```bash
curl --request PUT 'http://localhost:3004/allowed-subjects/{{SUBJECT-ID}}' \
--header 'Content-Type: application/json' \
--data-raw '{
    "providers": []
}'
```

Ahora necesitamos firmar la solicitud de transferencia con el material del nuevo nodo. Para hacer esto, usaremos nuestra [herramienta kore-Sign](../../../docs/learn/tools/) y ejecutaremos el siguiente comando:

```bash
kore-sign '2a71a0aff12c2de9e21d76e0538741aa9ac6da9ff7f467cf8b7211bd008a3198' '{"Transfer":{"subject_id":"{{SUBJECT-ID}}","public_key":"{{PUBLIC-KEY}}"}}'
```

El resultado de esta ejecución se incluirá en la siguiente solicitud:

```bash
curl --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw {{SIGN-RESULT}}
```

Esto generará un resultado similar al siguiente:

```bash
curl --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "Transfer": {
        "subject_id": "{{SUBJECT-ID}}",
        "public_key": "{{PUBLIC-KEY}}"
        }
    },
    "signature": {
        "signer": "EtbFWPL6eVOkvMMiAYV8qio291zd3viCMepUL6sY7RjA",
        "timestamp": 1689854029987763078,
        "value": "SEoXC-I8aNu1P6cS7SwDj9J6SrSDNdCnLdqj5o2Pb4nEqcQR5FHooO5qHwuQUd9FQPLWmHZ_3D2uNEzxRMSGYlCQ"
    }
}'
```

Una vez que se completen los pasos anteriores, el nuevo nodo debería poder ver este sujeto y la identidad del propietario debería corresponder al nodo **Ciudadano**:

```bash
curl --request GET 'http://localhost:3004/subjects/{{SUBJECT-ID}}'
```

```json
{
    "subject_id": "{{SUBJECT-ID}}",
    "governance_id": "{{GOVERNANCE-ID}}",
    "sn": 4,
    "public_key": "{{PUBLIC-KEY}}",
    "namespace": "",
    "name": "Wine",
    "schema_id": "Wine",
    "owner": "EtbFWPL6eVOkvMMiAYV8qio291zd3viCMepUL6sY7RjA",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "grape": "CabernetSauvignon",
        "harvest": 1,
        "organic_certified": true,
        "origin": "spain",
        "temperature_control": {
            "last_check": 0,
            "temperature_ok": true
        }
    },
    "active": true
}
```