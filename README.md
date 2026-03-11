# GNyx-UI

Portuguese (Brazil) version: [docs/README.pt-BR.md](./docs/README.pt-BR.md)

## Table of Contents

- [Overview](#overview)
- [Current Product Scope](#current-product-scope)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Repository Layout](#repository-layout)
- [Feature Domains](#feature-domains)
- [Authentication and Access Model](#authentication-and-access-model)
- [AI Runtime and Provider Selection](#ai-runtime-and-provider-selection)
- [BI Studio](#bi-studio)
- [Runtime Modes](#runtime-modes)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Commands](#available-commands)
- [HTTP and Service Layers](#http-and-service-layers)
- [State Management](#state-management)
- [Mock and Demo Strategy](#mock-and-demo-strategy)
- [Current Limitations](#current-limitations)
- [Documentation Map](#documentation-map)
- [Screenshots](#screenshots)

## Overview

`GNyx-UI` is the embedded frontend for the `GNyx` product.

It is a React 19 + TypeScript + Vite application that now combines:

- real authentication bootstrap
- tenant-aware navigation and access handling
- provider-backed AI features
- administrative and operational surfaces
- access management MVP
- a first metadata-driven BI demonstration flow

The application still uses a hash-based shell rather than React Router, but the runtime model is significantly more grounded than it was earlier in the project.

## Current Product Scope

Major user-facing areas currently available:

- `Landing`
- `Auth`
- `Accept Invite`
- `Welcome`
- `Gateway Dashboard`
- `Mail Hub`
- `Data Sync`
- `Workspace Settings`
- `Providers Settings`
- `Access Management`
- `Prompt Crafter`
- `Agents`
- `Chat`
- `Summarizer`
- `Code`
- `Images`
- `Playground`
- `BI Studio`
- `Data Analyzer`

Current maturity is uneven by design:

- some areas already consume real backend state and real providers
- some areas are hybrid
- some remain mock-backed until broader backend/domain work catches up

## Technology Stack

Core stack:

- React 19
- TypeScript
- Vite 7
- TailwindCSS
- Framer Motion
- Zustand
- IndexedDB via `idb`
- `js-cookie`
- `lucide-react`

Additional runtime-facing packages include:

- OpenAI SDK
- Anthropic SDK
- Google GenAI SDK
- `jszip`

## Architecture Overview

The frontend is being consolidated around clearer layers:

- `src/core/http`: HTTP client, endpoints, error handling
- `src/core/navigation`: hash routing and guarded-section resolution
- `src/core/runtime`: runtime-mode decisions
- `src/modules/*`: domain-oriented service and hook slices
- `src/mocks/*`: centralized mock data and scenarios
- `src/context/AuthContext.tsx`: authenticated runtime state and access materialization
- `src/pages/*`: page composition and user-facing flows

The direction is to keep prompt construction, API normalization, and domain logic out of raw page components whenever feasible.

## Repository Layout

```text
src/App.tsx                    central shell and guarded navigation
src/components/                reusable UI and feature components
src/context/                   auth/runtime context
src/core/http/                 HTTP foundation
src/core/navigation/           hash route model
src/core/access/               access helpers and RBAC MVP mapping
src/modules/                   domain modules for chat, creative, mail, workspace, providers, access, bi
src/mocks/                     centralized mock domains and scenarios
src/pages/                     routed product pages
```

## Feature Domains

Current domain modules include:

- `chat`
- `creative`
- `mail`
- `workspace`
- `providers`
- `access`
- `bi`

These modules now cover a meaningful portion of the runtime-facing product behavior.

## Authentication and Access Model

The frontend no longer treats authentication as identity only.

Current authenticated bootstrap behavior:

- `/me` and `/auth/me` are consumed as the canonical access bootstrap
- `access_scope` is materialized into real runtime state
- `activeTenant`, `activeMembership`, `activeRoleCode`, and effective permissions are derived and persisted
- authenticated users without effective access are held in `Welcome` instead of navigating blindly into the workspace
- RBAC helpers now read the real `AuthContext`, not the old mock auth store

Current access UX includes:

- tenant-aware shell header
- optional tenant switching when multiple memberships exist
- route guarding by authenticated access state
- `Access Management` page for members, roles, invites, and effective permissions

## AI Runtime and Provider Selection

AI-assisted product areas now use the real backend runtime instead of UI-only behavior.

Operationally relevant points:

- chat, summarization, code generation, prompt crafting, and image-prompt flows are wired through backend routes
- provider choice can be set per tool in the UI
- provider state is read from backend runtime status
- `Providers Settings` reflects runtime provider availability, default model, and model lists
- current practical provider posture is:
  - `Groq`: strongest happy path for BI demo generation
  - `Gemini`: supported, but slower and more likely to fall back for BI contract fidelity

## BI Studio

`BI Studio` is the first visible proof-of-concept page for metadata-driven board generation.

Its behavior is intentionally honest:

- if the Sankhya metadata catalog is available in the backend, the page exposes generation and export
- if the catalog is not available, the page pivots into a prerequisite screen instead of pretending the feature is ready

Current BI Studio capabilities:

- select provider
- generate a grounded board from the backend
- inspect provider, model, generation mode, and usage
- inspect generated widgets and SQL
- copy `dashboard_schema`
- download a ZIP bundle containing portable artifacts

This makes the feature demonstrable without depending on a live Sankhya runtime.

## Runtime Modes

The frontend currently operates with a mix of:

- real backend mode
- demo-aware behavior
- centralized mocks for selected domains
- offline-friendly local persistence in some areas

The runtime-mode policy is now more centralized than before, which reduced contradictory feature behavior across services.

## Environment Variables

The exact env surface can evolve, but the frontend relies primarily on the Vite runtime and backend reachability.

Relevant examples include:

- `VITE_SIMULATE_AUTH`
- API base configuration consumed by the HTTP layer

The backend runtime remains the main source of truth for provider and access state.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm dev
```

Type-check:

```bash
pnpm exec tsc --noEmit
```

Build:

```bash
pnpm exec vite build
```

## Available Commands

```bash
pnpm dev
pnpm exec tsc --noEmit
pnpm exec vite build
pnpm preview
```

## HTTP and Service Layers

The current HTTP foundation is centered on `src/core/http`.

Important traits:

- endpoint catalog is centralized
- request/response error handling is normalized
- service layers compose feature logic above the shared client
- the codebase has already been refactored away from scattered direct `fetch` usage, except for the HTTP core itself

## State Management

State is handled through a combination of:

- React local state for page interaction
- `AuthContext` for authenticated runtime state
- selected Zustand stores where they still make sense
- `localStorage` and IndexedDB for persistence in specific flows

Recent examples:

- chat history persistence across navigation
- per-tool provider preference persistence
- active tenant persistence

## Mock and Demo Strategy

Mocks are now more centralized and domain-oriented than before.

Current strategy:

- keep mock datasets under `src/mocks/*`
- allow demo mode without scattering fake data across pages
- progressively replace or narrow mocks as real backend slices mature

This has already reduced migration cost for domains such as:

- gateway
- sync
- invite
- mail
- workspace

## Current Limitations

Current known limitations include:

- not every page is fully backend-backed yet
- permission enforcement is still an MVP layer, not a final IAM system
- plan and entitlement gating are not fully operational
- `Data Analyzer` still needs deeper backend hardening
- `Gemini` is slower and less stable than `Groq` for the current BI generation slice
- the build still emits an existing `lottie-web` warning related to `eval`

## Documentation Map

Useful docs:

- [`../README.md`](../README.md)
- [`docs/README.pt-BR.md`](./docs/README.pt-BR.md)
- [`../.notes/analyzis/global-execution-plan/`](../.notes/analyzis/global-execution-plan)
- [`../.notes/analyzis/gnyx-skw-dynamic-ui/`](../.notes/analyzis/gnyx-skw-dynamic-ui)

## Screenshots

Placeholder suggestions:

- `[Screenshot Placeholder: Welcome with active tenant]`
- `[Screenshot Placeholder: Providers Settings]`
- `[Screenshot Placeholder: Access Management]`
- `[Screenshot Placeholder: BI Studio]`
