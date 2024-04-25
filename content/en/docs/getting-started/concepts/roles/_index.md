---
title: Roles
description: Role description.
---

Each participant in the network interacts with it based on different interests. These interests are represented in Kore as roles

## Owner
Owns the traceability subject and is the node responsible for recording events. They have full control over the subject because they own the cryptographic material with permissions to modify it.

{{< alert type="info" title="Info">}}The ownership of the subject can be obtained by creating it or receiving it from the previous owner.{{< /alert >}}
## Issuer
Application authorized to issue event requests, even if it is not a network node. All it needs to participate in the network is a cryptographic key pair that allows signing events, as well as having the necessary permissions in governance.
## Evaluator
Evaluators assume a crucial role within the governance framework, being responsible for carrying out the evaluation process. This process performs the execution of a **contract**, which generally results in a change in the subject's status.
## Approver
In order for certain event requests to obtain approval and be added to a subject's **microledger**, a number of signatures are required. The acquisition of these signatures depends on the outcome of the evaluation. During the evaluation of a contract, a decision is made on the need for approval, which may be influenced by the roles of the requesting issuer.
## Validator
Node that validates the order of events to guarantee immunity to manipulation. This is achieved by not signing events with the same subject ID and sequence number.
## Witness
Nodes interested in keeping a copy of the log, also providing resilience.