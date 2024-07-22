---
date: 2024-06-19
title: Implementación de Estándares Criptográficos PKCS en Rust 🔒 
linkTitle: PKCS 🔒 
description: >
  Explora la implementación de estándares criptográficos PKCS en Rust, incluyendo ejemplos prácticos de generación y gestión de claves privadas usando algoritmos como Ed25519 y Secp256k1.
resources:
  - src: "**.{png,jpg}"
    title: "Image #:counter"
---
## ¿Qué Son los PKCS?
Los PKCS son un conjunto de estándares desarrollados por [RSA Laboratories](https://es.wikipedia.org/wiki/RSA_Security) para facilitar la implementación de criptografía de clave pública. Estos estándares abordan diferentes aspectos de la criptografía, desde el cifrado y la firma digital hasta la gestión de claves y el intercambio seguro de datos.

### Alguno de los estándares más utilizados:
<table>
  <tr>
    <th>PKCS</th>
    <th>Código</th>
    <th>Extensión</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td>PKCS#1</td>
    <td>RFC 8017</td>
    <td>.pem, .der</td>
    <td>Especifica la sintaxis para RSA encriptación. Define esquemas de cifrado RSA, y formatos de firma digital.</td>
  </tr>
  <tr>
    <td>PKCS#3</td>
    <td>RFC 5246</td>
    <td>.pem, .der</td>
    <td>Protocolo de generación de clave Diffie-Hellman. Utilizado para el intercambio seguro de claves.</td>
  </tr>
  <tr>
    <td>PKCS#5</td>
    <td>RFC 8018</td>
    <td>.pem, .der</td>
    <td>Estándar para cifrar contraseñas. Define métodos para derivar claves a partir de contraseñas.</td>
  </tr>
  <tr>
    <td>PKCS#7</td>
    <td>RFC 5652</td>
    <td>.p7b, .p7c, .p7s</td>
    <td>Formato de mensaje criptográfico. Utilizado para almacenar datos firmados o cifrados.</td>
  </tr>
  <tr>
    <td>PKCS#8</td>
    <td>RFC 5958</td>
    <td>.pem, .der, .p8</td>
    <td>Formato de clave privada. Define la sintaxis para almacenar claves privadas encriptadas y no encriptadas.</td>
  </tr>
  <tr>
    <td>PKCS#10</td>
    <td>RFC 2986</td>
    <td>.csr</td>
    <td>Solicitud de certificado. Utilizado para solicitar la emisión de un certificado por una autoridad de certificación (CA).</td>
  </tr>
  <tr>
    <td>PKCS#11</td>
    <td>OASIS PKCS#11</td>
    <td>N/A</td>
    <td>API para manejar objetos criptográficos en dispositivos de hardware. Utilizado en módulos de seguridad de hardware (HSM).</td>
  </tr>
  <tr>
    <td>PKCS#12</td>
    <td>RFC 7292</td>
    <td>.p12, .pfx</td>
    <td>Contenedor de objetos criptográficos. Utilizado para almacenar claves privadas, certificados, y otros secretos.</td>
  </tr>
  <tr>
    <td>PKCS#13</td>
    <td>ISO/IEC 18033-2</td>
    <td>N/A</td>
    <td>Algoritmos de encriptación de clave pública. Define esquemas para encriptación basada en RSA.</td>
  </tr>
  <tr>
    <td>PKCS#15</td>
    <td>ISO/IEC 7816-15</td>
    <td>N/A</td>
    <td>Armazón de objetos criptográficos en tarjetas inteligentes. Define estructuras para almacenar certificados y claves en tarjetas inteligentes.</td>
  </tr>
</table>

{{< alert type="warning" title="CAUTION">}}
Algunos PKCS tienen "N/A" (No Aplica) en la columna de extensión porque no se asocian directamente con archivos que se guardan o manejan en un formato específico. En vez de especificar un formato de archivo, estos PKCS definen interfaces, APIs, o protocolos
{{< /alert >}}

## Implementación
Haremos uso de una de las librerias más famosas de criptografía en Rust, [Rust Crypto](https://github.com/RustCrypto). Gracias a esta disponemos de una amplia variedad de algoritmos para realizar las pruebas, además de disponer de soporte para diferentes formatos de codificación como `der`(binario) y `pem`(base64).

### Generación de un par de claves
Crearemos una función que nos permita genera un par de claves(privada y publica) en base a un algoritmo. Utilizaremos dos algoritmos de curva elíptica utilizados en criptografía de clave pública:

- [Ed25519](https://es.wikipedia.org/wiki/EdDSA), ampliamente recomendado por su robustez y eficiencia.
- [Secp256k1](https://es.bitcoin.it/wiki/Secp256k1), Aunque no está tan estandarizado como Ed25519, su uso en Bitcoin ha llevado a su implementación en varias bibliotecas de criptografía.

Para ejecutar los ejemplos haremos uso de la libreria `identity`disponible en el repositorio de [kore-ledger](https://github.com/kore-ledger/kore-base) ya que en esta libreria tenemos una estructura para trabajar con estos algoritmos.
```rust
use kore_base::keys::{Ed25519KeyPair, KeyGenerator, KeyMaterial, KeyPair, Secp256k1KeyPair};
enum Algorithm {
    Ed25519,
    Secp256k1,
}
fn generate_keypair(algorithm: Algorithm) -> KeyPair {
    let kp = match algorithm {
        Algorithm::Ed25519 => {
            let keys = Ed25519KeyPair::from_seed(&[])
            KeyPair::Ed25519(keys);
        }
        Algorithm::Secp256k1 => {
            let keys = Secp256k1KeyPair::from_seed(&[])
            KeyPair::Secp256k1(keys);
        }
    };
    kp
}
```
### Escritura en formato der
Generaremos un directorio con las claves en formato der, en este caso guardaremos las claves en `pkcs8` encriptadas con `pkcs5` al igual que las claves que reciben los nodos Kore Ledger.

```rust
fn write_keys(
    secret_key: &[u8],
    public_key: &[u8],
    password: &str,
    path: &str,
    algorithm: Algorithm,
) -> Result<(), Error> {
    // Creamos un directorio
    match fs::create_dir_all(path) {
        Ok(_) => {
            match algorithm {
                Algorithm::Ed25519 => {
                  
                    let mut keypair_bytes: Vec<u8> = Vec::new();
                    keypair_bytes.extend_from_slice(secret_key);
                    keypair_bytes.extend_from_slice(public_key);
                    // Clave privada y pública de 32 bytes
                    let keypair_bytes_array: [u8; 64] = keypair_bytes
                        .try_into()
                        .map_err(|_| "Error al convertir Vec<u8> a [u8; 64]")?;

                    let signing_key = ed25519::KeypairBytes::from_bytes(&keypair_bytes_array);
                    let public_key = signing_key.public_key.unwrap();
                    // Convertimos a pkcs8 en formato der(binario)
                    let der = match signing_key.to_pkcs8_der() {
                        Ok(der) => der,
                        Err(e) => {
                            return Err(format!("Error converting to PKCS8 DER: {}", e));
                        }
                    };

                    let pk_encrypted =
                        encrypt_from_pkcs8_to_pkcs5(der.as_bytes(), password).unwrap();

                    // Private key in pkcs8 encrypted with pkcs5
                    pk_encrypted
                        .write_der_file(format!("{}/private_key.der", path))
                        .map_err(|e| format!("Error writing private key to file: {}", e))?;

                    // Public key in pksc8
                    public_key
                        .write_public_key_der_file(format!("{}/public_key.der", path))
                        .map_err(|e| format!("Error writing public key to file: {}", e))
                        .unwrap();
                }
                Algorithm::Secp256k1 => {
                    let sec1_key: Sec1SecretKey<k256::Secp256k1> =
                        Sec1SecretKey::from_slice(secret_key).unwrap();

                    let sec1_public_key = sec1_key.public_key();
                    let sec1_der = sec1_key
                        .to_pkcs8_der()
                        .map_err(|e| format!("Error converting to PKCS8 DER: {}", e))
                        .unwrap();

                    let pk_encrypted =
                        encrypt_from_pkcs8_to_pkcs5(sec1_der.as_bytes(), password).unwrap();

                    // Private key in pkcs8 encrypted with pkcs5
                    pk_encrypted
                        .write_der_file(format!("{}/private_key.der", path))
                        .map_err(|e| format!("Error writing private key to file: {}", e))
                        .unwrap();

                    // Public key in pksc8
                    sec1_public_key
                        .write_public_key_der_file(format!("{}/public_key.der", path))
                        .map_err(|e| format!("Error writing public key to file: {}", e))
                        .unwrap();
                }
            }
            Ok(())
        }
        Err(e) => Err(format!("Error creating directory: {}", e)),
    }
}
```
### Escriptación de pkcs8 con pksc5
Necesitamos una función que encripte el pkcs8 a pkcs5.

```rust
fn encrypt_from_pkcs8_to_pkcs5(
    sec1_der_bytes: &[u8],
    password: &str,
) -> Result<pkcs8::SecretDocument, String> {
    let pbes2_params = match pkcs5::pbes2::Parameters::pbkdf2_sha256_aes256cbc(
        2048,
        &hex!("79d982e70df91a88"),
        &hex!("b2d02d78b2efd9dff694cf8e0af40925"),
    ) {
        Ok(pbes2_params) => pbes2_params,
        Err(e) => {
            return Err(format!("Error creating PBES2 parameters: {}", e));
        }
    };
    let pk_text = match PrivateKeyInfo::try_from(sec1_der_bytes) {
        Ok(pk_text) => pk_text,
        Err(e) => {
            return Err(format!("Error creating PrivateKeyInfo: {}", e));
        }
    };
    let pk_encrypted = match pk_text.encrypt_with_params(pbes2_params, password) {
        Ok(pk_encrypted) => pk_encrypted,
        Err(e) => {
            return Err(format!("Error encrypting private key: {}", e));
        }
    };
    Ok(pk_encrypted)
}

```
### Lectura de Claves Privadas en Formato DER

Las claves privadas en formato DER pueden ser leídas de dos maneras distintas dependiendo de si están encriptadas o no:

```rust
fn read_der_file(
    path: Option<&str>,
    typefile: Typefile,
    algorithm: Algorithm,
    password: Option<&str>,
) -> Result<KeyPair, String> {
    let path = path.unwrap();
    // Verificamos si existe la ruta
    if fs::metadata(path).is_ok() {
        match typefile {
            // Debemos distinguir los der de claves públicas sin encriptación y los de clave privada
            Typefile::PrivateKey => {
                let document = Document::read_der_file(path)
                    .map_err(|e| format!("Error reading file: {}", e))
                    .unwrap();
                match EncryptedPrivateKeyInfo::try_from(document.as_bytes()) {
                    Ok(enc_pk_info) => {
                        if password.is_none() {
                            return Err("Password is required to decrypt".into());
                        }
                        // Desencriptamos el archivo
                        let der_private_key = enc_pk_info
                            .decrypt(password.unwrap())
                            .map_err(|e| format!("Error decrypting file: {}", e))
                            .unwrap();
                        // Obtenemos nuestro par de claves
                        let decode_private_key: ed25519::KeypairBytes = ed25519::pkcs8::KeypairBytes::from_pkcs8_der(document)
                        .map_err(|e| {
                        format!("Error creating KeypairBytes(ED25519) from PKCS8 DER: {}", e)
                        })
                        .unwrap();
                    }
                    Err(_) => {
                      // Obtenemos nuestro par de claves
                        let decode_private_key: ed25519::KeypairBytes = ed25519::pkcs8::KeypairBytes::from_pkcs8_der(document)
                        .map_err(|e| {
                        format!("Error creating KeypairBytes(ED25519) from PKCS8 DER: {}", e)
                        })
                        .unwrap();
                    }
                }
            }
        }
    } else {
        Err("File not found".into())
    }
}
```
{{< alert type="info" title="INFO">}}
Para acceder a más información sobre esta implementación puede acceder al repositorio de [kore tools](https://github.com/kore-ledger/kore-tools)
{{< /alert >}}
