---
title: End of life
pagination_next: build/assets-traceability/running-node
date: 2024-05-06
weight: 12
---
To conclude the tutorial, let's set up one last scenario: when bottles do not meet quality standards, they must be withdrawn from the market to prevent distribution.

To address this situation, kore provides a solution: the use of the [**EOL**](../../../docs/getting-started/concepts/events/) event. This event allows us to terminate the lifecycle of a subject in the network, preventing any future events from being issued on it.

To test this, we will apply it to the last bottle we created (the Spanish one). To do this, execute the following command:

```bash title="Node: Premium Wines"
curl --location --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "EOL": {
        "subject_id": {{SUBJECT-ID}}
        }
    }
}'
```

If everything went well, when you request a list of subjects, you should see the bottle with a `sn` value of 3 and the `active` field set to `false`:

```bash title="Node: Premium Wines"
curl --location --request GET 'http://localhost:3001/subjects/{{SUBJECT-ID}}'
```

```json
{
    "subject_id": "{{SUBJECT-ID}}",
    "governance_id": "{{GOVERNANCE-ID}}",
    "sn": 3,
    "public_key": "E5DkRaljajwUZ1HrpgdkIxdTu0fbrg-nqoBJFHqm6GJY",
    "namespace": "Spain",
    "name": "Wine",
    "schema_id": "Wine",
    "owner": "{{CONTROLLER-ID}}",
    "creator": "{{CONTROLLER-ID}}",
    "properties": {
        "grape": "PinotNoir",
        "harvest": 3,
        "organic_certified": false,
        "origin": "spain",
        "temperature_control": {
            "last_check": 0,
            "temperature_ok": true
        }
    },
    "active": false
}
```

Now, if you try to launch a new event on this subject, it will not be allowed. To demonstrate this, let's try to launch an **EOL** event again:

```bash title="Node: Premium Wines"
curl --location --request POST 'http://localhost:3001/event-requests' \
--header 'Content-Type: application/json' \
--data-raw '{
    "request": {
        "EOL": {
        "subject_id": {{SUBJECT-ID}}
        }
    }
}'
```

In this case, it will return a message indicating that an event cannot be launched on a subject that has reached the end of its lifecycle:

```bash
API error: Failed to process request
```