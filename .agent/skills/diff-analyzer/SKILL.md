# Skill: Diff Analyzer (The Auditor)

## Description
This skill enables the Agent to provide insightful, human-readable summaries of changes made to the codebase or documents. Instead of just listing files, it explains the "Why" and the "Impact" of each revision based on the Git history.

## Trigger
- **Manual**: When the user asks "what changed?" or "compare these versions".
- **Verification Phase**: To provide a clear summary of work done in `walkthrough.md`.

## Instructions

### 1. Semantic Analysis
- Read the output of `git diff` or `git show`.
- Categorize changes into: **Features**, **Bug Fixes**, **Optimization**, or **Documentation**.
- Explain the rationale behind significant logic changes.

### 2. Formatting
- Use carousels or diff blocks for code changes.
- Provide a summary table for high-level changes.

---
*Audit with narrative, not just data.*
