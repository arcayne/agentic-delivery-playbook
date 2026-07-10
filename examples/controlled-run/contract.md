# Delivery contract: add a v2 API response version marker

Status: accepted fictional example
Owner: Catalog API team
Approved evidence: Fictional product review, 2026-07-10

## Objective

Add apiVersion with the value 2026-07 to the fictional Acme Catalog API v2 product response so v2 clients can identify the response contract.

## Non-goals

- Do not change v1 response payloads.
- Do not alter product fields other than the v2 response version marker.
- Do not introduce a new endpoint, authentication behavior, or client migration.

## Acceptance criteria

- AC-1: GET /v2/products/{id} returns apiVersion with the string value 2026-07.
- AC-2: GET /v1/products/{id} has no apiVersion field and retains its existing response shape.
- AC-3: The version marker is described in the fictional v2 API reference.

## Risk and authority constraints

- Risk: A public response change can break or confuse client integrations; v1 compatibility must remain intact.
- Authority: The Catalog API team may change the fictional v2 handler, serializer, contract tests, and v2 reference only.
- Stop condition: Stop for a product decision if the version marker changes client migration behavior, requires a v1 change, or expands into endpoint versioning.

## Ownership

| Lane | Exclusive files or system boundary | Output |
| --- | --- | --- |
| implementation | fictional v2 handler, serializer, contract tests, and v2 reference | Tested v2 response marker with v1 compatibility evidence |
| fresh-context review | Approved contract, actual diff, and captured evidence | Acceptance decision and findings |

## Verification plan

| Criterion | Command or check | Required evidence |
| --- | --- | --- |
| AC-1 | npm run test:contract -- api/v2/products | Exit code and contract-test output reference |
| AC-2 | npm run test:contract -- api/v1/products api/v2/products | Exit code and compatibility-test output reference |
| AC-3 | npm run test:docs -- api/v2/products | Exit code and documentation-test output reference |

## Unresolved decisions

- None.

## Approval

- Contract approved by: Fictional Acme Catalog API product owner
- Approved at: 2026-07-10T09:00:00Z
