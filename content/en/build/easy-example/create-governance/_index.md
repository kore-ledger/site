---
title: Creating the governance
description: Steps to create governance
weight: 2
date: 2024-06-06
---

Now that we have been able to launch our first node, the first thing we must do for it to be useful is to create a [governance](../../../docs/getting-started/concepts/governance). Governances are special subjects that define the rules of the use case at hand. Without governance, there can be no subjects. Both its [scheme and its contract](../../../docs/learn/governance/schema/) are fixed and defined in kore's code. The same goes for its [structure](../../../docs/learn/governance/structure/).

An interesting aspect of the kore-client API is the different possibilities for using the event request submission endpoint. The most orthodox way would be to include the request and the signature of the request. For this, kore-sign can be used (included in [kore-tools](../../../docs/learn/tools/)) to sign the request. But you can also omit the signature in the body of the request and have the client sign it with our own private key. This obviously cannot be done for external invocations where the signer is not the owner of the node. Another change intended to increase simplicity for Genesis/Creation events is that the public key can be omitted from the body and the client will create one for us. In general, before creating a subject, you should call the cryptographic material creation API to generate a pair of keys **/keys** and the **POST** method. This API returns the value of the public key of the KeyPair to include it in the [Create](../../../docs/getting-started/concepts/events/) and [Transfer](../../../docs/getting-started/concepts/events/) events.

To do this, we must launch an event request using the kore-client API. The endpoint we must use is **/event-requests** and the method is **POST**. This endpoint supports different configurations to make life easier for the user:

So, if we opt for the third way, the body of the post call that creates the governance would end up like:

```json
{
  "request": {
    "Create": {
      "governance_id": "",
      "schema_id": "governance",
      "namespace": "",
      "name": "EasyTutorial"
    }
  }
}
```

```bash
curl --silent --location 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data '{
  "request": {
    "Create": {
      "governance_id": "",
      "schema_id": "governance",
      "namespace": "",
      "name": "EasyTutorial"
    }
  }
}'
```

The response we get when launching the event request is the id of the request itself. If we want to know what ended up being the SubjectId of the governance, we must consult the endpoint **/event-requests/{id}** and the method **GET**. The response to this endpoint returns information about the request that includes the SubjectId of the governance.

```bash
curl --silent 'http://127.0.0.1:3000/event-requests/{request_id}/state'
```

Response:

```json
{
    "id": "Jr4kWJOgdIhdtUMTqyLbu676-k8-eVCd8VQ9ZmLWpSdg",
    "subject_id": "{{GOVERNANCE-ID}}",
    "sn": 0,
    "state": "finished",
    "success": true
}
```

We can also ask for the list of subjects at **/subjects** using the **GET** method. In this case, we will get a list of the subjects we have on the node, in this case, we will only have the governance we just created.

Since we are the owners of the subject, it can be said that we are witnesses of it. The only role that is defined by default in the initial state of the governance is the one that makes all members of the governance witnesses of it, but in the case of the members, it comes empty. In the next step, we will add ourselves as members of the governance. This is because the initial state has no members, and to actively participate in the use case, we must add ourselves as members. Although this step is not mandatory, it depends on the use case.

The endpoint to use is the same as for creation, but the type of event will be [FACT](../../../docs/getting-started/concepts/events/):

We must obtain our controller_id which will allow us to be added as a governance member.
```bash
curl --silent 'http://127.0.0.1:3000/controller-id'
```
```json
{
  "request": {
    "Fact": {
      "subject_id": "{{GOVERNANCE-ID}}",
      "payload": {
          "Patch": {
              "data": [
                {
                    "op": "add",
                    "path": "/members/0",
                    "value": {
                    "id": "{{CONTROLLER-ID}}",
                    "name": "EasyTutorial1"
                    }
                }
            ]
          }
      }
    }
  }
}
```

```bash
curl --silent 'http://localhost:3000/event-requests' \
--header 'Content-Type: application/json' \
--data '{
    "request": {
        "Fact": {
            "subject_id": "{{GOVERNANCE-ID}}",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/0",
                            "value": {
                                "id": "{{CONTROLLER-ID}}",
                                "name": "EasyTutorial1"
                            }
                        }
                    ]
                }
            }
        }
    }
}'
```

Replace  **{{GOVERNANCE-ID}}** with the **SubjectId**  of the governance we have created. The id of our user we get from when we used kore-keygen in the previous step. It is our KeyIdentifier, which identifies our public key. The Patch method is the only one that currently contains the contract of the governance and it simply applies a json-patch to its state. This method requires the [Approval phase](../../../docs/getting-started/advanced/approval/).

As we mentioned earlier, the creator will be the signer in all phases if no one else is defined, so for this event 1 we will be the [Evaluator](../../../docs/getting-started/advanced/evaluation/), [Approver](../../../docs/getting-started/advanced/approval/), and [Validator](../../../docs/getting-started/advanced/validation/). Evaluation and validation work automatically, but the approval part requires user intervention through the API (provided the environment variable that automatically approves is not defined).

For this, we must first ask for pending approvals at **/approval-requests?status=pending** using a **GET**.

```bash
curl --silent 'http://localhost:3000/approval-requests?status=pending'
```


{{< alert-details type="info" title="Response" summary="Click to see the answer" >}}
```json
[
    {
        "id": "JYHOLieD0u6Q-GjURtjZ_JAXDgP6h87fMB9h2FiYk1OQ",
        "request": {
            "event_request": {
                "Fact": {
                    "subject_id": "{{GOVERNANCE-ID}}",
                    "payload": {
                        "Patch": {
                            "data": [
                                {
                                    "op": "add",
                                    "path": "/members/0",
                                    "value": {
                                        "id": "{{CONTROLLER-ID}}",
                                        "name": "EasyTutorial1"
                                    }
                                }
                            ]
                        }
                    }
                },
                "signature": {
                    "signer": "{{CONTROLLER-ID}}",
                    "timestamp": 1689758738346603498,
                    "value": "SEUhyEBzC8cXdmqORBLXtgyYuFh3zXFywBVjRnGvU70nLdjs5blDDUiUla4IaiOWqcBPt5U89vfoDFa-V-5QjDCw"
                }
            },
            "sn": 1,
            "gov_version": 0,
            "patch": [
                {
                    "op": "add",
                    "path": "/members/0",
                    "value": {
                        "id": "{{CONTROLLER-ID}}",
                        "name": "EasyTutorial1"
                    }
                }
            ],
            "state_hash": "J9ZorCKUeboco5eBZeW_NYssO3ZYLu2Ano_tThl8_Fss",
            "hash_prev_event": "Jg-2hzd0QEdqDdtRqe_ITljdbTWKPYSl1hO1XyrgwM8A",
            "signature": {
                "signer": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
                "timestamp": 1689758738381216200,
                "value": "SE1GJs9v-OFtsveJQWi0HYRfkT4LkPCdu_7H_BUaTLg2Dpt5bTTBR8zLt6TiSbohsI0kdyQeOrYMHFxIRbKovYDg"
            }
        },
        "reponse": null,
        "state": "Pending"
    }
]
```
{{< /alert-details >}}
The id of the json response is what we must use to approve it. At **/approval-requests/{id}** using a **PATCH**, we will add the received id to cast the vote. As in our case, we want to approve it, the body should be:

```json
{"state": "RespondedAccepted"}
```

{{< alert-details type="info" title="Response" summary="Click to see the answer" >}}
```json
{
    "id": "JYHOLieD0u6Q-GjURtjZ_JAXDgP6h87fMB9h2FiYk1OQ",
    "request": {
        "event_request": {
            "Fact": {
                "subject_id": "{{GOVERNANCE-ID}}",
                "payload": {
                    "Patch": {
                        "data": [
                            {
                                "op": "add",
                                "path": "/members/0",
                                "value": {
                                    "id": "{{CONTROLLER-ID}}",
                                    "name": "EasyTutorial1"
                                }
                            }
                        ]
                    }
                }
            },
            "signature": {
                "signer": "{{CONTROLLER-ID}}",
                "timestamp": 1689758738346603498,
                "value": "SEUhyEBzC8cXdmqORBLXtgyYuFh3zXFywBVjRnGvU70nLdjs5blDDUiUla4IaiOWqcBPt5U89vfoDFa-V-5QjDCw"
            }
        },
        "sn": 1,
        "gov_version": 0,
        "patch": [
            {
                "op": "add",
                "path": "/members/0",
                "value": {
                    "id": "{{CONTROLLER-ID}}",
                    "name": "EasyTutorial1"
                }
            }
        ],
        "state_hash": "J9ZorCKUeboco5eBZeW_NYssO3ZYLu2Ano_tThl8_Fss",
        "hash_prev_event": "Jg-2hzd0QEdqDdtRqe_ITljdbTWKPYSl1hO1XyrgwM8A",
        "signature": {
            "signer": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
            "timestamp": 1689758738381216200,
            "value": "SE1GJs9v-OFtsveJQWi0HYRfkT4LkPCdu_7H_BUaTLg2Dpt5bTTBR8zLt6TiSbohsI0kdyQeOrYMHFxIRbKovYDg"
        }
    },
    "reponse": {
        "appr_req_hash": "JYHOLieD0u6Q-GjURtjZ_JAXDgP6h87fMB9h2FiYk1OQ",
        "approved": true,
        "signature": {
            "signer": "{{CONTROLLER-ID}}",
            "timestamp": 1689758795610296081,
            "value": "SE34M3kRw9Uj2V_FaDq5Kz4h_8HSbkAiaH40XxpcPleLPJ_CnNbVso6L4GkdNNF2othwlDzTzk3BqyzyKlpIVDCg"
        }
    },
    "state": "Responded"
}
```
{{< /alert-details >}}

We can observe that the state of the response has changed from `null` to `Responded`. This indicates that we have responded to the Fact event in the governance, and if we get the request-id status we will see that the status is `Finished`.