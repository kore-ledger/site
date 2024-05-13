---
title: Adding members
description: Adding members to governance
weight: 3
date: 2024-05-02
---
{{ partial "page-meta-lastmod.html" .}}
## Second node
To add a second member, we can repeat the previous step but slightly change the body of the request. To do this, I will first run kore-keygen again to create a second cryptographic material that identifies the second member:

```bash
PRIVATE KEY ED25519 (HEX): 388e07385cfd8871f990fe05f82610af1989f7abf5d4e42884c8337498086ba0
CONTROLLER ID ED25519: E6AL_cLzXRIAnc3Hy2oX5K8CgnzPXPmyL1KyDo36DNdM
PeerID: 12D3KooWRS3QVwqBtNp7rUCG4SF3nBrinQqJYC1N5qc1Wdr4jrze
```

The new request would be:

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
                    "path": "/members/1",
                    "value": {
                    "id": "E6AL_cLzXRIAnc3Hy2oX5K8CgnzPXPmyL1KyDo36DNdM",
                    "name": "Node2"
                    }
                }
            ]
          }
      }
    }
  }
}
```

{{< alert-details type="info" title="Request" summary="Click to see the request" >}}
```bash
curl --silent 'http://localhost:3000/api/event-requests' \
--header 'Content-Type: application/json' \
--data '{
    "request": {
        "Fact": {
            "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/1",
                            "value": {
                                "id": "E6AL_cLzXRIAnc3Hy2oX5K8CgnzPXPmyL1KyDo36DNdM",
                                "name": "Node2"
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

We must again approve the new request as in the previous case.

### Raise the second node

The first node is going to be sending the events of the governance subject to the controller **E6AL_cLzXRIAnc3Hy2oX5K8CgnzPXPmyL1KyDo36DNdM**, whose PeerId (identification in LibP2P, the communication library) is **12D3KooWRS3QVwqBtNp7rUCG4SF3nBrinQqJYC1N5qc1Wdr4jrze**. Unfortunately, it will not find it on its network because they are not connected, so we will proceed to raise the second node and connect it to the first:

```bash
docker run -p 3001:3000 -p 50001:50000 \
-e KORE_ID_PRIVATE_KEY=388e07385cfd8871f990fe05f82610af1989f7abf5d4e42884c8337498086ba0 \
-e KORE_HTTP=true \
-e KORE_NETWORK_KNOWN_NODE=/ip4/172.17.0.1/tcp/50000/p2p/12D3KooWLXexpg81PjdjnrhmHUxN7U5EtfXJgr9cahei1SJ9Ub3B \
-e KORE_NETWORK_LISTEN_ADDR=/ip4/0.0.0.0/tcp/50000 \
kore-ledger/kore-client:0.3
```

{{< alert type="warning" title="CAUTION">}}
Pay attention to the IP address specified in `KORE_NETWORK_KNOWN_NODE` as it may be different in your case. You should specify an IP that allows the second container to communicate with the first one.
{{< /alert >}}

Now that it is up and finds the others from a bootstrap on **kore_NETWORK_KNOWN_NODE**. Events from the governance will begin to arrive at the second node, although they will not yet be saved in its database. This is because governances always have to be pre-authorized to allow the reception of their events. For this, the endpoint **/api/allowed-subjects/{{GOVERNANCE-ID}}** and the **PUT** method are used. Remember that in this case it must be launched on the second node, which, due to the configuration we have set, will be listening on port 3001 of localhost. The second node will now correctly update with the governance subject.

```bash
curl --silent --request PUT 'http://localhost:3001/api/allowed-subjects/Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M' \
--header 'Content-Type: application/json' \
--data '{
    "providers": []
}'
```

Response:

```json
{"providers":[]}
```

### Modify the governance

As we have seen previously, the governance contract currently only has one method to modify its state, the Patch method. This method includes an object with a data attribute which in turn is an array representing a json-patch. This patch will be applied to the current state of the governance to modify it. Also when making the modification it is checked that the obtained state is valid for a governance, not only by performing the validation with the governance schema itself but also by performing exhaustive checks, such as that there are no repeated members, each defined schema in turn has some policies...

To facilitate obtaining the result we want and generate the specific json-patch we can use the kore-patch tool, included among the [kore-tools](../../../docs/learn/tools)x. This executable is passed the current state and the desired state and generates the corresponding patch after whose application one passes from one to another.

and send the request, make the approval etc...

For an example, we will make all the members of the governance approvers, for this we must add the role:

```json
{
    "namespace": "",
    "role": "APPROVER",
    "schema": {
        "ID": "governance"
    },
    "who": "MEMBERS"
}
```

So the json patch that we have to apply will be:

```json
[
  {
    "op": "add",
    "path": "/roles/1",
    "value": {
        "namespace": "",
        "role": "APPROVER",
        "schema": {
            "ID": "governance"
        },
        "who": "MEMBERS"
    }
  }
]
```

So the body of the request will be:

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
                  "path": "/roles/1",
                  "value": {
                      "namespace": "",
                      "role": "APPROVER",
                      "schema": {
                          "ID": "governance"
                      },
                      "who": "MEMBERS"
                  }
                }
              ]
          }
      }
    }
  }
}
```

{{< alert-details type="info" title="Request" summary="Click to see the request" >}}
```bash
curl --silent 'http://localhost:3000/api/event-requests' \
--header 'Content-Type: application/json' \
--data '{
    "request": {
        "Fact": {
            "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/roles/1",
                            "value": {
                                "namespace": "",
                                "role": "APPROVER",
                                "schema": {
                                    "ID": "governance"
                                },
                                "who": "MEMBERS"
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

Even though the following state says that both are approvers, to calculate the signatories of the different phases the current state of the subject is used, prior to applying the change in the state of this new event that we are creating, so the only approver right now will continue to be the first node for being the owner of the governance, so we must repeat the previous authorization step.

## Third node
### Launching the third node

To add a third member we repeat the previous steps, the first thing is to create the cryptographic material with kore-keygen:

```bash
PRIVATE KEY ED25519 (HEX): 984af9a964bd6534418696814fa96244e7d719d51877e8e449514e941ff0c7d6
CONTROLLER ID ED25519: E8WyEDqEvAZUOlZzydwtr1bYZHQ25gtNR2617PezbgoE
PeerID: 12D3KooWS4nPvBjbftvVQa4one9dQbneK66wVSLpZNSoTopxuNr4
```

To launch the docker:

```bash
docker run -p 3002:3000 -p 50002:50000 \
-e KORE_ID_PRIVATE_KEY=984af9a964bd6534418696814fa96244e7d719d51877e8e449514e941ff0c7d6 \
-e KORE_HTTP=true \
-e KORE_NETWORK_KNOWN_NODE=/ip4/172.17.0.1/tcp/50000/p2p/12D3KooWLXexpg81PjdjnrhmHUxN7U5EtfXJgr9cahei1SJ9Ub3B \
-e KORE_NETWORK_LISTEN_ADDR=/ip4/0.0.0.0/tcp/50000 \
kore-ledger/kore-client:0.3
```

### Modify the governance

Now we will launch the event that adds the third member to the governance, but to check the operation of the approvals we will vote `yes` with one node and `no` with the other, which will leave the event as rejected by the [approval phase](../../../docs/getting-started/advanced/approval). It will still be added to the subject's chain, but it will not modify its state.

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
                    "path": "/members/2",
                    "value": {
                    "id": "E8WyEDqEvAZUOlZzydwtr1bYZHQ25gtNR2617PezbgoE",
                    "name": "Node3"
                    }
                }
            ]
          }
      }
    }
  }
}
```

{{< alert-details type="info" title="Request" summary="Click to see the request" >}}
```bash
curl --silent 'http://localhost:3000/api/event-requests' \
--header 'Content-Type: application/json' \
--data '{
    "request": {
        "Fact": {
            "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/2",
                            "value": {
                                "id": "E8WyEDqEvAZUOlZzydwtr1bYZHQ25gtNR2617PezbgoE",
                                "name": "Node3"
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

We must first ask for pending approvals at **/api/approval-requests?status=pending** using a **GET**. The id of the response json is what we must use to approve it. At **/api/approval-requests/{id}** using a **PATCH** we will add the received id to cast the vote.

```bash
curl --silent 'http://localhost:3000/api/approval-requests?status=pending'
```

{{< alert-details type="info" title="Response" summary="Click to see the response" >}}
```json
[
    {
        "id": "J8NvGJ6XzV3ThfWdDN4epwXDFTY9hB2NKcyGEPbVViO4",
        "request": {
            "event_request": {
                "Fact": {
                    "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
                    "payload": {
                        "Patch": {
                            "data": [
                                {
                                    "op": "add",
                                    "path": "/members/2",
                                    "value": {
                                        "id": "E8WyEDqEvAZUOlZzydwtr1bYZHQ25gtNR2617PezbgoE",
                                        "name": "Node3"
                                    }
                                }
                            ]
                        }
                    }
                },
                "signature": {
                    "signer": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                    "timestamp": 1689759413015509263,
                    "value": "SE1YEBQE1PdzwbtCnydZ1GnEw03Z8XkTZtXguYoCs3JqzuG5RIP00KxL_QIMCItUQsSip22mnZfmNScVpxAtyYCA"
                }
            },
            "sn": 4,
            "gov_version": 3,
            "patch": [
                {
                    "op": "add",
                    "path": "/members/2",
                    "value": {
                        "id": "E8WyEDqEvAZUOlZzydwtr1bYZHQ25gtNR2617PezbgoE",
                        "name": "Node3"
                    }
                }
            ],
            "state_hash": "Jv3BSUFzl7zq2cFldSbl0YjpZ1JEqCVzGG0plg6OT4GA",
            "hash_prev_event": "JZt9JQi5x5-nmkwacYO3H6qjvCg8dgOOVyDCPNuQlpFY",
            "signature": {
                "signer": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
                "timestamp": 1689759413045110844,
                "value": "SEu793Au3GbvoNUw8CEfAJBZj5RlspzpJdk3eJzB16u0Q7jLB04JN5WykLusqQzOyjDNquPMrs0HE5qCVEACJTBA"
            }
        },
        "reponse": null,
        "state": "Pending"
    }
]
```
{{< /alert-details >}}

In node 1 we will approve it but in node 2 we will reject it. As the quorum is Majority, this means that both must approve it for it to be approved. So if one of the two rejects it, it will be rejected because the quorum for acceptance cannot be reached.

Node 1:

```json
{"state": "RespondedAccepted"}
```

```bash
curl --silent --request PATCH 'http://localhost:3000/api/approval-requests/J8NvGJ6XzV3ThfWdDN4epwXDFTY9hB2NKcyGEPbVViO4' \
--header 'Content-Type: application/json' \
--data '{"state": "RespondedAccepted"}'
```

Node 2:

```json
{"state": "RespondedRejected"}
```

```bash
curl --silent --request PATCH 'http://localhost:3001/api/approval-requests/J8NvGJ6XzV3ThfWdDN4epwXDFTY9hB2NKcyGEPbVViO4' \
--header 'Content-Type: application/json' \
--data '{"state": "RespondedRejected"}'
```

We verify that the state has not been modified by looking for our subjects, however, the sn of the subject will have increased by 1:

{{< alert-details type="info" title="Response" summary="Click to see the response" >}}
```json
[
    {
        "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
        "governance_id": "",
        "sn": 4,
        "public_key": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
        "namespace": "",
        "name": "tutorial",
        "schema_id": "governance",
        "owner": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
        "creator": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
        "properties": {
            "members": [
                {
                    "id": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
                    "name": "Nodo1"
                },
                {
                    "id": "E6AL_cLzXRIAnc3Hy2oX5K8CgnzPXPmyL1KyDo36DNdM",
                    "name": "Nodo2"
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
                    "who": "MEMBERS"
                }
            ],
            "schemas": []
        },
        "active": true
    }
]
```
{{< /alert-details >}}

We can also search for a specific event with the event api: **/api/subjects/{id}/events/{sn}** whose id is the SubjectId of the subject, the sn is the specific event that we are going to search for (if nothing is added it will return all the events of the subject) and the request is of type **GET**.

```bash
curl --silent 'http://localhost:3000/api/subjects/Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M/events/4' \
```


{{< alert-details type="info" title="Respuerta" summary="Click to see the response" >}}
```json
{
    "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
    "event_request": {
        "Fact": {
            "subject_id": "Jz6RNP5F7wNoSeCH65MXYuNVInyuhLvjKb5IpRiH_J6M",
            "payload": {
                "Patch": {
                    "data": [
                        {
                            "op": "add",
                            "path": "/members/2",
                            "value": {
                                "id": "E8WyEDqEvAZUOlZzydwtr1bYZHQ25gtNR2617PezbgoE",
                                "name": "Node3"
                            }
                        }
                    ]
                }
            }
        },
        "signature": {
            "signer": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
            "timestamp": 1689759413015509263,
            "value": "SE1YEBQE1PdzwbtCnydZ1GnEw03Z8XkTZtXguYoCs3JqzuG5RIP00KxL_QIMCItUQsSip22mnZfmNScVpxAtyYCA"
        }
    },
    "sn": 4,
    "gov_version": 3,
    "patch": [
        {
            "op": "add",
            "path": "/members/2",
            "value": {
                "id": "E8WyEDqEvAZUOlZzydwtr1bYZHQ25gtNR2617PezbgoE",
                "name": "Node3"
            }
        }
    ],
    "state_hash": "Jv3BSUFzl7zq2cFldSbl0YjpZ1JEqCVzGG0plg6OT4GA",
    "eval_success": true,
    "appr_required": true,
    "approved": false,
    "hash_prev_event": "JZt9JQi5x5-nmkwacYO3H6qjvCg8dgOOVyDCPNuQlpFY",
    "evaluators": [
        {
            "signer": "EnyisBz0lX9sRvvV0H-BXTrVtARjUa0YDHzaxFHWH-N4",
            "timestamp": 1689759413042189699,
            "value": "SE__Vz_7yc3L0qJRXTnWzGRq0FsT3EGhe67WWLHkHcF7kqWKg6nldkWnx9od7byTTV_dNG_dwW26ShFbrLu1fLAg"
        }
    ],
    "approvers": [
        {
            "signer": "E6AL_cLzXRIAnc3Hy2oX5K8CgnzPXPmyL1KyDo36DNdM",
            "timestamp": 1689759533754268083,
            "value": "SEeUWADKs25krS0mxYuqLBQe8umbs39Fs5Nbp85_7X_Sa959mBmZFDFZ5FGgJu3EPK1Pm3KgDp0vmLpq0aZ7S5DQ"
        }
    ],
    "signature": {
        "signer": "EZalVAn6l5irr7gnYnVmfHOsPk8i2u4AJ0WDKZTmzt9U",
        "timestamp": 1689759533772217255,
        "value": "SEpn7Y28DrVFNKpk8qJB4_U2MQrQeJFa4UscRTg_Y1HVBrdjO-sy7J0f6-pGkLguKu2XdlQvXpNHOTeas1wkAICQ"
    }
}
```
{{< /alert-details >}}

Now we will repeat the same request but we will vote yes with both nodes, which will approve the request and modify the state of the subject. We approve the governance in the third node and we will see how it will be updated in a short period of time.