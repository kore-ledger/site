---
title: Schema
description: Description of schema.
---

The **schema** is the structure of the state contained in a subject.

The **schemas** are defined within a **governance** and are therefore distributed together with it. Different **governances** may define equivalent **schemas**, however, for all intents and purposes, since they belong to different **governances**, they are considered different **schemas**.

The **schemas** are composed of 2 elements:
- A unique identifier. Each **schema** has an identifier that allows it to be referenced within the **governance** in which it is defined. Different **schemas** can be defined within the same **governance**. In addition, as long as they have different identifiers, you can create **schemas** with the same content.
- A content. It is the data structure used to validate the status of the subjects.

```json
{
    "id": {"type":"string"},       
    "content": {"type": "object"}  
}

```