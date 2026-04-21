# Skill: Architecture Visualizer (Blueprint Artist)

## Description
This skill enables the Agent to generate visual representations of the project's structure, workflows, and logical flows using Mermaid syntax. It helps in making complex systems easy to understand for both humans and other agents.

## Trigger
- **Phase 4 (Technical Architecture)**: To generate the initial project blueprint.
- **On Demand**: When the user asks for a visual representation of a specific system or workflow.

## Instructions

### 1. Diagram Selection
- **Folder Structure**: Use `graph TD` to visualize directory hierarchies.
- **Workflows**: Use `sequenceDiagram` or `flowchart` to show step-by-step processes.
- **State Management**: Use `stateDiagram-v2` for complex logic states.

### 2. Mermaid Standard (safe-mode)
- Quote node labels containing special characters: `id["Label (info)"]`.
- Avoid HTML tags in labels.
- Keep diagrams clean and modular; split large diagrams into multiple sub-diagrams.

### 3. Output Placement
- Embed diagrams directly into `walkthrough.md` or dedicated `architecture-blueprint.md` files.

---
*A picture is worth a thousand lines of README.*
