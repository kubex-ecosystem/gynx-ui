# GNyx Frontend Reconnaissance & ROI Planning Prompt

## Role

You are operating as an **engineering copilot** inside the **GNyx frontend repository**.

Your objective is to **deeply understand the current frontend architecture** and produce a **practical engineering roadmap** to prepare the frontend for backend integration.

This is **not a theoretical analysis**.
The result must be an **actionable plan that will guide real implementation work**.

---

## Project Context

GNyx is a **modular engineering workspace** composed of several operational domains.

### Operation & Data

* Gateway
* Mail Hub
* Sync

### Intelligence & Analysis

* Playground
* Analyzer
* Prompt Crafter
* Agents
* Chat

### Creative Lab

* Summarizer
* Code
* Images

### Administration

* Workspace
* Providers

---

## Current Frontend State

The frontend is already functional and modular.

Key characteristics:

* Vite build system
* OAuth authentication
* JWT persistence
* SIP mode (limited access without authentication)
* Modular UI domains
* Multiple UI modules already implemented
* Partial mocking of backend interactions

The backend services are **not yet fully implemented**, so some parts of the frontend still rely on **mock data or temporary logic**.

The next phase of the project is to **progressively remove mocks and prepare the frontend for real backend communication**.

---

## Mission

Your task is to analyze the entire frontend codebase and generate a **high-quality engineering roadmap** focused on **high-ROI structural improvements**.

---

## Step 1 — Repository Analysis

Perform a complete analysis of the repository.

Identify:

* project structure
* module organization
* component architecture
* state management patterns
* service/API abstractions
* routing structure
* authentication flow
* cross-module dependencies
* shared UI primitives
* locations where mocks are used
* existing backend communication patterns

---

## Step 2 — Module Domain Map

Build a **domain map of the frontend**.

For each module identify:

* module name
* responsibilities
* main components
* state usage
* services used
* backend capabilities implied by the UI

---

## Step 3 — Mock / Backend Gap Analysis

Identify all areas where the frontend currently relies on:

* mocked data
* temporary logic
* missing backend integration
* component-level data logic that should be moved into service layers

List all locations where **backend integration will eventually be required**.

---

## Step 4 — Frontend Architecture Health

Evaluate the architecture and identify:

* structural strengths
* architectural risks
* missing abstraction layers
* potential technical debt

---

## Step 5 — ROI Priority Analysis

Produce a **prioritized list of areas where development effort will produce the highest ROI**.

Consider:

* architectural impact
* backend readiness
* code reuse potential
* reduction of future refactors
* improvement of developer velocity

Rank items as:

### HIGH ROI

### MEDIUM ROI

### LOW ROI

Each item must include:

* module or layer
* problem description
* improvement opportunity
* expected impact

---

## Step 6 — Implementation Strategy

For the **HIGH ROI items**, produce a concrete plan including:

* which files or layers should be created or refactored
* recommended architecture pattern
* service layer structure
* API abstraction strategy
* state management approach
* module boundaries

Focus on **practical implementation steps**.

---

## Step 7 — Output Document

Create a document inside the repository:

```txt
/docs/frontend-integration-roadmap.md
```

The document must include:

1. Frontend architecture overview
2. Module domain map
3. Backend integration gap analysis
4. ROI priority list
5. Implementation strategy for top priorities

This document will become the **working roadmap for frontend consolidation**.

---

## Final Step

When the document is finished, stop and report:

```txt
FRONTEND ANALYSIS AND ROI ROADMAP COMPLETE — READY FOR ARCHITECT REVIEW
```

Do **not** start implementing changes yet.
Wait for further instructions.
