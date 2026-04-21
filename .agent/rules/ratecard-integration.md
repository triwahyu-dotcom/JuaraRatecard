# Rule: Ratecard Integration

## 1. Absolute Consistency
All financial documents (Quotations, Cost Estimations) MUST directly reference the centralized Ratecard Database. Manual overrides of pricing without proper authorization flags are FORBIDDEN.

## 2. Downstream Compatibility
Generated estimations must map cleanly to the JSON structures required by:
- **Project Tracker**: For establishing baseline budgets.
- **Finance App**: For calculating P&L and managing cash flows.
- **CRM**: For attaching monetary value to pipeline opportunities.

## 3. Workflow Triggers
Whenever a new Quotation is finalized, the system MUST prompt the user to link it to an existing CRM Account or Project ID.
