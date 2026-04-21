# Skill: Fact Search (The Informant)

## Description
This skill enables the Agent to perform real-time web searches to gather factual, up-to-date, and relevant data. It ensures that the Project Factory output is grounded in current trends, news, or scientific discoveries.

## Trigger
- **Phase 0 (Knowledge Discovery)**: When the `knowledge-base` lacks enough context on a specific topic.
- **Phase 1 (User Profile)**: To validate or expand on the project's vision and mission with market/trend data.
- **On Request**: When the user asks "what's the current state of X?".

## Instructions

### 1. Research Protocol
- **Search Strategy**: Use the `search_web` tool to find multiple sources.
- **Verification**: Prioritize official sites, academic journals, or reputable news outlets.
- **Freshness**: Always check for the date of the articles to ensure "aktual" status.

### 2. Integration
- Synthesize findings into the project's `context-audit` or directly into `personal-context.md`.
- Always cite sources (URLs) for every factual claim.

---
*Stay current, stay grounded.*
