---
description: Quotation Pipeline
---

# Workflow: Quotation Pipeline
(/create-quotation)

## Purpose
To standardize the process of creating a Quotation or Cost Estimation using the centralized Ratecard Database, ensuring data integrity and downstream compatibility.

## Steps
// turbo-all
1. **Phase 1: Requirements Gathering**:
   - Agent prompts the user for client details and the scope of work.
   - If Project Tracker ID or CRM Account ID is known, link it.
2. **Phase 2: Ratecard Retrieval**:
   - Agent accesses the Ratecard Database to fetch standardized line-item costs for the requested services.
   - Agent ensures no unauthorized markup or discounts are applied without explicit user confirmation.
3. **Phase 3: Document Generation**:
   - Agent generates a markdown or JSON artifact representing the Quotation/Cost Estimation.
   - Output must clearly separate "Direct Costs" from "Gross Margin" to aid P&L calculation.
4. **Phase 4: Sync & Export**:
   - Once approved by the user, the Agent pushes the generated JSON schema to the Finance App / Project Tracker endpoints.
