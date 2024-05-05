---
title: Wine traceability
pagination_next: build/assets-traceability/running-node
date: 2024-05-02
description: Apply Kore-ledger technology to trace wine
weight: 2
---
This tutorial will cover a series of advanced kore network concepts, in which we will learn:

1. How to perform external invocations to methods of a contract.
2. How to transfer ownership of a subject to another participant.
3. How works subject segmentation by namespace works.
4. How to modify voting policies on a subject.
5. How to finalize the life cycle tracking of a subject.

## Use Case Description

In this tutorial, we will implement a system for tracking the life cycle of a food product, specifically a premium high-quality wine. The objective is to certify the wine's quality to the end buyers based on certain parameters, such as organic certification and optimal temperature control.

To achieve this goal, the support of different participants will be necessary, each responsible for carrying out various actions required for the proper functioning of this life cycle. Among them, we can distinguish:

* **Wine Producers Organization (WPO)**: Responsible for formalizing the traceability use case.
* **Premium Wines**: Authorized personnel in charge of initiating the tracking of wine bottles.
* **World Food Organization (WFO)**: Administrator of the changes made to the use case and wine-type subjects.
* **Spanish Food Organization (SFO)**: Responsible for validating changes to the wine subject.
* **Citizen**: External entity to whom the ownership of a wine bottle will be transferred.

Throughout this tutorial, detailed instructions and the necessary commands will be provided to carry out each step. Let's begin with the development of this use case for tracking the wine life cycle in Kore!