---
title: Identity
description: Identity disciption in Kore Ledger.
---

Each participant in a Kore Ledger network has a unique identifier and a private key that allows him/her to sign the transactions made. In addition, depending on their interest in each subject and their level of involvement with the network, each participant will have one or more different roles.

Given the strong influence of KERI[^29] in our project, the reflection on the reference model to establish the identifiers in our protocol starts from Zooko's triangle[^38]. This is a trilemma that defines three desirable properties desirable in the identifiers of a network protocol, of which only two can be simultaneously. These properties are:

- Human Meaningful: Meaningful and memorable (low entropy) names to users.
- Secure: The amount of damage a malicious entity can inflict on the system should be as low as possible.
- Decentralized: Names are correctly resolved to their respective entities without using a central authority or service.

Although several solutions to the trilemma have already been proposed, we have prioritized decentralization and security to shortly implement a design equivalent to the [Ethereum Name Service](https://ens.domains/es/) . Specifically, in our approach we have considered three types of identifiers, which in turn represent three types of cryptographic material:

- Public key, the identifier of the roles participating in the network.
- Message digest, the identifier of the content of messages resulting from applying a hash function to this content.
- Cryptographic signature, the identifier of the signatures made by the roles on the messages, which serves as verifiable proof.

This cryptographic material is large binary numbers, which presents a challenge when used as identifiers. The best way to handle identifiers is through a string of characters and, for conversion, we have adopted the Base64 encoding, which encodes every 3 bytes of a binary number into 4 ASCII characters. As the cryptographic material to be managed is not a multiple of 3 (32 bytes and 64 bytes), it is filled with an additional character (32 bytes) or two (64 bytes). As in KERI, we have taken advantage of these additional characters to establish a derivation code to determine the type of material by placing the derivation character(s) at the beginning.

The following table details the currently supported derivation codes:

| Code | Type of Identifier |
|--------|-------------------------------|
| E | Public Key Ed25519 |
| S | Public Key Secp256k1 |
| J | Digest Blake3 (256 bits) |
| | OJ | Digest Blake3 (512 bits) |
| L | Digest SHA2 (256 bits) |
| OL | Digest SHA2 (512 bits) | OL | Digest SHA2 (512 bits) | OL | Digest SHA2 (512 bits) |
| M | Digest SHA3 (256 bits) | | OM | Digest SHA3 (256 bits) |
| OM | Digest SHA3 (512 bits) | OM | Digest SHA3 (512 bits) |


New types of cryptographic material have already been incorporated into the roadmap, thinking of devices limited to operations with RSA[^27] or P256[^1], and post-quantum cryptography, such as Crystal-Dilithium[^11]. In the case of RSA or Crystal-Dilithium, we are dealing with a binary size of cryptographic material that is too large to be represented as identifiers, so we will have to incorporate a different derivation mechanism.


## References
[^1]: [NIST](https://csrc.nist.gov/csrc/media/events/workshop-on-elliptic-curve-cryptography-standards/documents/papers/session6-adalier-mehmet.pdf) - Mehmet Adalier y Antara Teknik (2015) "Efficient and Secure Elliptic Curve Cryptography Implementation of Curve P-256."
[^11]: [CRYSTALS-Dilithium](https://csrc.nist.gov/publications/detail/sp/800-208/final) - Léo Ducas et al. (2021) "CRYSTALS-Dilithium – Algorithm Specifications and Supporting Documentation (Version 3.1)."
[^27]: [RSA](https://dl.acm.org/doi/10.1145/359340.359342) - Rivest, Shamir y Adleman (1978) "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems."
[^29]: [KERI White Paper](https://arxiv.org/abs/1907.02143) - Samuel L. Smith (2021) "Key Event Receipt Infrastructure (KERI)."
[^38]: [Zooko's Triangle](https://en.wikipedia.org/wiki/Zooko%27s_triangle) - Wikipedia (2022).
