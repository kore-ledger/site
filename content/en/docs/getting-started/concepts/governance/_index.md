---
title: Governance
description: Governance Description.
weight: 1
resources:
- src: "diagram.png"
  params: 
    byline: "*Figure 2: Hierarchy of relationships .*"
- src: "governance.png"
  params: 
    byline: "*Figure 1: Governance components.*"
---

The **governance** is the set of definitions and rules that establish how the different nodes participating in a network relate to the subjects of traceability and interact with each other. The components of **governance** are:

- The participating nodes.
- The schema of the attributes of the subjects.
- The contract to apply the events that modify the state of the subject.
- The permissions of each participant to participate in the network.

{{% imgproc governance Fit "1800x400"  %}}
{{% /imgproc %}}


## Members
These are the persons, entities or organizations that participate in **governance** and therefore may be part of the supported use cases. Each member declares a unique identifier representing the cryptographic material with which it will operate in the network, its [identity](../identifiers/) .
## Schemas
[Schemas](../schema/) are the data structures that model the information stored in the **subjects**. Within a **governance**, different **schemas** can be defined to support different use cases. When a subject is created, it defines which governance it is associated with and which schema it will use. In addition, each schema has an associated **contract** that will allow you to modify the state of the subjects.
## Roles
[Roles](../roles/) represent groups of participants with some kind of common interest in a set of subjects. **Roles** allow us to assign permissions on these groups of subjects more easily than if we had to assign them individually to each member of the government.
## Policies
The **policies** define the specific conditions under which the life cycle of an event is affected, such as the number of signatures required to carry out the evaluation, approval and validation processes. This is called quorum.
The **governance** configuration allows the definition of [different types of quorum] , more or less restrictive, depending on the need of the use case.

{{< alert type="warning" title="CAUTION">}}As we know, the owner of a subject is the only one who can act on it , and therefore has absolute freedom to modify it. Governance cannot prevent malicious owners from trying to perform forbidden actions, but it does define the conditions under which the other participants ignore or penalize these malicious behaviors. {{< /alert >}}

## Governance as a subject
The **governance** is a subject of traceability, since it can evolve and adapt to business needs, and therefore its lifecycle is also determined by a **governance**, which endows our infrastructure with transparency and trust for all participants.

## Hierarchy of relationships
Governance defines the rules to be followed in a use case. However, the owner of a node is not limited to participate in a single use case. Combine this with the governance structure and you get the following hierarchy of relationships:

- One governance:
  - define one or more: members, policies, schemas and roles.
  - A governance: support one or more use cases.
- A participant (person, entity or organization):
  - has an [identity](../identifiers/) , and the identity acts as a member of a governance.
  - runs a node that stores many subjects.
  - Is involved in one or more use cases.
- A subject:
  - depends on a governance.
  - is modeled by a schema.
  - has namespaces.

{{% imgproc diagram Fit "1800x700"  %}}
{{% /imgproc %}}