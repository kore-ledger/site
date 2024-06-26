---
title: Creating a governance
pagination_next: build/assets-traceability/running-node
date: 2024-06-06
weight: 2
---
Once the **WPO** has a node in the kore network, it's time to define the use case, which includes participants, interaction rules, information models, among other aspects. In the kore network, this is accomplished by creating a [governance](../../discover/governance.md), where the specific functionality of the use case is specified.

To create a basic governance, the following steps are required:

* To begin, execute the following command to create a basic version of a governance:

  ```bash
  curl --request POST 'http://localhost:3000/event-requests' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "request": {
      "Create": {
        "governance_id": "",
        "schema_id": "governance",
        "namespace": "",
        "name": "wine_track"
      }
    }
  }'
  ```

* As a result of the previous action, a `request-id` will be returned. Copy and use it in the following command:

  ```bash
  curl --request GET 'http://localhost:3000/event-requests/{{REQUEST-ID}}/state'
  ```

  This last command will provide a response like the following:

  ```json
  {
    "id": "{{REQUEST-ID}}",
    "subject_id": "{{GOVERNANCE-ID}}",
    "sn": 0,
    "state": "finished",
    "success": true
  }
  ```

    {{< alert type="warning" title="PRECAUCIÓN">}}
Save the `subject_id` of the **governance**, as it will be needed in next steps of the tutorial.
    {{< /alert >}}

* We can check the created governance using the following command:

  ```bash
  curl --request GET 'http://localhost:3000/subjects/{{GOVERNANCE-ID}}'
  ```

  The obtained result should be similar to the following:

  ```json
  {
    "subject_id": "{{GOVERNANCE-ID}}",
    "governance_id": "",
    "sn": 0,
    "public_key": "E8tVWEasubIp7P9fzk_HttNCsABymV9m9xEPAfr-QV7M",
    "namespace": "",
    "name": "wine_track",
    "schema_id": "governance",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
      "members": [],
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
        }
      ],
      "schemas": []
    },
    "active": true
  }
  ```