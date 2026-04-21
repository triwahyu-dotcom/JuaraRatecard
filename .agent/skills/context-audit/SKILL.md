# Skill: Context Audit (Validation Engine)

## Description
This skill empowers the Agent to perform deep validation of generated outputs against the "Source of Truth" (Knowledge Base and User Profile). It identifies contradictions, missing context, or factual inaccuracies (hallucinations).

## Trigger
- **Phase 6/7 (Audit & Export)**: Mandatory cross-check before finalizing project factory outputs.
- **Manual**: When the user requests a verification of the logic/content consistency.

## Instructions

### 1. Verification Protocol
- **Cross-Reference**: Compare every generated rule, workflow, and agent persona with the initial `user-profile.md`.
- **Knowledge Alignment**: Ensure technical decisions (e.g., tech stack, architecture) are supported by documents in `knowledge-base/`.
- **Constraint Check**: Verify that all linguistic constraints from the `writing-style` skill are applied correctly.

### 2. Anomaly Detection
- Flag any "General AI Knowledge" that contradicts the specific instructions in the project rules.
- Identify "Dead Links" or references to files that don't exist in the generated project.

### 3. Feedback Generation
- Produce a "Context Audit Report" (concise) highlighting any areas of concern or potential improvement.

---
*Accuracy is the foundation of trust in the Project Factory.*
