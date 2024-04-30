---
title: Identidad
description: Descipción de la identidad en Kore Ledger.
weight: 6
---

Cada participante de una red Kore Ledger tiene un identificador único y una clave privada que le permite firmar las transacciones realizadas. Además, dependiendo de su interés en cada sujeto y su nivel de implicación con la red, cada participante tendrá uno o varios roles diferentes.

Dada la fuerte influencia de KERI[^29] en nuestro proyecto,la reflexión sobre el modelo de referencia para establecer los identificadores en nuestro protocolo parte del triángulo de Zooko[^38]. Se trata de un trilema que define tres propiedades deseables deseables en los identificadores de un protocolo de red, de las cuales sólo dos pueden estar simultáneamente. Estas propiedades son:

- Con sentido humano: Nombres significativos y memorables (de baja entropía) a los usuarios.
- Seguro: La cantidad de daño que una entidad maliciosa puede infligir al sistema debe ser lo más bajo posible.
- Descentralizado: Los nombres se resuelven correctamente a sus respectivas entidades sin utilizar una autoridad o servicio central.

Aunque ya se han propuesto varias soluciones al trilema, hemos priorizado la descentralización y la seguridad para aplicar en breve un diseño equivalente al [Ethereum Name Service](https://ens.domains/es/) . En concreto, en nuestro enfoque hemos considerado tres tipos de identificadores, que a su vez representan tres tipos de material criptográfico:

- Clave pública, el identificador de los roles participantes en la red.
- Resumen de mensajes, el identificador del contenido de los mensajes resultantes de aplicar una función hash a este contenido.
- Firma criptográfica, identificador de las firmas realizadas por los roles en los mensajes, que sirve como prueba verificable.

Este material criptográfico son grandes números binarios, lo que representa un desafío cuando se utilizan como identificadores. La mejor manera de manejar identificadores es a través de una cadena de caracteres y, para la conversión, hemos adoptado la codificación Base64 , que codifica cada 3 bytes de un número binario en 4 caracteres ASCII. Como el material criptográfico que se gestiona no es múltiplo de 3 (32 bytes y 64 bytes), se rellena con un carácter adicional (32 bytes) o dos (64 bytes). Al igual que en KERI, hemos aprovechado estos caracteres adicionales para establecer un código de derivación para determinar el tipo de material, colocando el o los caracteres de derivación al principio.

La siguiente tabla detalla los códigos de derivación admitidos actualmente :

| Código | Tipo de Identificador         |
|--------|-------------------------------|
| E      | Clave Pública Ed25519         |
| S      | Clave Pública Secp256k1       |
| J      | Digest Blake3 (256 bits)      |
| OJ     | Digest Blake3 (512 bits)      |
| L      | Digest SHA2 (256 bits)        |
| OL     | Digest SHA2 (512 bits)        |
| M      | Digest SHA3 (256 bits)        |
| OM     | Digest SHA3 (512 bits)        |


Ya se han incorporado nuevos tipos de material criptográfico en la hoja de ruta, pensando en dispositivos limitados a operaciones con RSA[^27] o P256[^1], y la criptografía post-cuántica, como Crystal-Dilithium[^11]. En el caso de RSA o Crystal-Dilithium, estamos tratando con un tamaño binario del material criptográfico que es demasiado grande para ser representado como identificadores, por lo que tendremos que incorporar un mecanismo de derivación diferente.


## Referencias
[^1]: [NIST](https://csrc.nist.gov/csrc/media/events/workshop-on-elliptic-curve-cryptography-standards/documents/papers/session6-adalier-mehmet.pdf) - Mehmet Adalier y Antara Teknik (2015) "Efficient and Secure Elliptic Curve Cryptography Implementation of Curve P-256."
[^11]: [CRYSTALS-Dilithium](https://csrc.nist.gov/publications/detail/sp/800-208/final) - Léo Ducas et al. (2021) "CRYSTALS-Dilithium – Algorithm Specifications and Supporting Documentation (Version 3.1)."
[^27]: [RSA](https://dl.acm.org/doi/10.1145/359340.359342) - Rivest, Shamir y Adleman (1978) "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems."
[^29]: [KERI White Paper](https://arxiv.org/abs/1907.02143) - Samuel L. Smith (2021) "Key Event Receipt Infrastructure (KERI)."
[^38]: [Zooko's Triangle](https://en.wikipedia.org/wiki/Zooko%27s_triangle) - Wikipedia (2022).
