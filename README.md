# GNyx-UI

Portuguese (Brazil) version: [docs/README.pt-BR.md](./docs/README.pt-BR.md)

## Table of Contents

- [Overview](#overview)
- [Current Product Scope](#current-product-scope)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Repository Layout](#repository-layout)
- [Feature Domains](#feature-domains)
- [Runtime Modes](#runtime-modes)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Available Commands](#available-commands)
- [Development Workflow](#development-workflow)
- [HTTP and Service Layers](#http-and-service-layers)
- [State Management](#state-management)
- [Mock and Demo Strategy](#mock-and-demo-strategy)
- [Current Limitations](#current-limitations)
- [Contribution Notes](#contribution-notes)
- [Documentation Map](#documentation-map)

## Overview

`GNyx-UI` is the frontend application for the GNyx workspace. It is a React 19 + TypeScript + Vite application that combines:

- authentication and onboarding flows
- AI-assisted tools
- operational dashboards
- provider configuration and BYOK flows
- offline-aware service layers
- domain-oriented frontend modules

The application is currently organized around a hash-based shell instead of React Router, and it mixes modernized layers (`core/http`, `core/navigation`, `modules/*`, `mocks/*`) with a few still-legacy service areas that are being gradually normalized.

## Current Product Scope

At the time of this README rewrite, the frontend includes the following user-facing areas:

- `Landing`: public entry page
- `Auth`: sign-in screen
- `Accept Invite`: public onboarding completion flow
- `Welcome`: post-login landing workspace
- `Gateway Dashboard`: operational metrics and logs
- `Mail Hub`: smart inbox UI, currently mock-backed
- `Data Sync`: integrations and sync jobs
- `Workspace Settings`: tenant/workspace settings, currently mock-backed
- `Providers Settings`: AI provider and routing administration
- `Prompt Crafter`: structured prompt generation workflow
- `Agents`: AI agent generation and storage workflow
- `Chat`: conversational assistant
- `Summarizer`: content summarization
- `Code`: code generation assistant
- `Images`: image prompt crafting
- `Playground`: streaming-oriented testing area
- `Data Analyzer`: analysis-oriented area that still needs future backend hardening

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

Provider and AI-related dependencies currently present in the frontend:

- OpenAI SDK
- Anthropic SDK
- Google GenAI SDK

## Architecture Overview

The frontend is evolving toward a more explicit layered architecture.

### Core layers

- `src/core/http/*`
  - unified HTTP client
  - endpoint catalog
  - auth header helpers
  - normalized error types
- `src/core/navigation/*`
  - hash routing helpers
  - route parsing and guarded navigation rules
- `src/core/runtime/*`
  - frontend runtime mode resolution
  - demo/simulated behavior flags
- `src/core/llm/*`
  - local provider wrapper abstractions

### Domain modules

The project is progressively moving business logic out of pages/components and into `src/modules/*`.

Current modules already in place:

- `src/modules/chat`
- `src/modules/creative`
- `src/modules/mail`
- `src/modules/providers`
- `src/modules/workspace`

### Service layers

The frontend still uses more than one service style, because the codebase is in migration:

- `core/http` for the current network foundation
- `services/api.ts` as a compatibility-oriented API layer
- `services/enhancedAPI.ts` for offline/cache/queue behavior
- domain services such as `unifiedAIService`, `gatewayService`, `syncService`, `inviteService`, `agentsService`, and others

## Repository Layout

```text
frontend/
├── docs/                     # Frontend-specific documentation
├── public/                   # Static assets
├── src/
│   ├── assets/               # Images, lotties, UI assets
│   ├── components/           # Shared UI and feature components
│   ├── config/               # Frontend configuration helpers
│   ├── constants/            # Constants and static definitions
│   ├── context/              # React contexts (auth, language)
│   ├── core/                 # HTTP, runtime, navigation, LLM foundation
│   ├── hooks/                # Reusable hooks
│   ├── i18n/                 # Translation support
│   ├── lib/                  # Local utilities and adapters
│   ├── mocks/                # Centralized mock scenarios and domain data
│   ├── modules/              # Domain-oriented frontend modules
│   ├── pages/                # Route-level pages and shells
│   ├── screens/              # Older screen-oriented structures
│   ├── services/             # API integrations and orchestration
│   ├── store/                # Zustand stores
│   ├── tests/                # Frontend tests and fixtures
│   ├── types/                # Shared TypeScript contracts
│   └── utils/                # Generic helpers
├── package.json
└── README.md
```

## Feature Domains

### Access and onboarding

Main files:

- `src/context/AuthContext.tsx`
- `src/pages/Landing.tsx`
- `src/pages/Auth.tsx`
- `src/pages/AcceptInvite.tsx`
- `src/services/inviteService.ts`

Notes:

- session validation uses the unified HTTP client
- invite acceptance is a special public flow
- simulated auth can still be enabled for frontend-only usage

### AI and creation tools

Main files:

- `src/modules/chat/*`
- `src/modules/creative/*`
- `src/services/unifiedAIService.ts`
- `src/components/features/*`

Notes:

- `Chat`, `Summarizer`, `Code`, and `Images` are already wired into backend-oriented flows
- provider availability is resolved through configuration and BYOK support

### Operations and administration

Main files:

- `src/pages/GatewayDashboard.tsx`
- `src/pages/DataSync.tsx`
- `src/pages/MailHub.tsx`
- `src/pages/WorkspaceSettings.tsx`
- `src/pages/ProvidersSettings.tsx`
- `src/modules/mail/*`
- `src/modules/workspace/*`
- `src/modules/providers/*`

Notes:

- `Mail Hub` and `Workspace Settings` are now modularized but still mock-backed
- `Providers Settings` is now modularized around a dedicated frontend module
- gateway and sync flows remain hybrid real/mock depending on runtime mode

## Runtime Modes

The frontend currently supports three practical execution modes.

### 1. Real backend mode

Used when frontend talks to the backend normally.

Characteristics:

- real HTTP calls
- real auth/session validation
- real provider/config resolution

### 2. Demo mode

Resolved through runtime flags and service fallbacks.

Characteristics:

- configuration falls back to demo-friendly values
- BYOK-oriented UX stays available
- parts of the UI can still behave as connected demos

### 3. Simulated auth / mock-assisted mode

Used to keep frontend-only work moving without backend dependency.

Characteristics:

- auth/session becomes simulated
- invite/gateway/sync mock branches can be used
- useful for isolated UI and interaction work

## Environment Variables

Current variables used by the frontend include:

```env
VITE_API_URL=http://localhost:8080
VITE_DEMO_MODE=false
VITE_SIMULATE_AUTH=false
```

Behavior summary:

- `VITE_API_URL`
  - backend base URL when needed by the frontend runtime
- `VITE_DEMO_MODE`
  - enables demo-oriented frontend behavior
- `VITE_SIMULATE_AUTH`
  - enables simulated auth/mock-assisted flows for frontend-only work

The current scripts rely on POSIX-style shell sourcing of `.env.local` and `.env.production` when available.

## Getting Started

### Prerequisites

Recommended:

- Node.js 20+
- pnpm 10+
- a POSIX-compatible shell for the provided scripts

### Install dependencies

```bash
cd frontend
pnpm install
```

### Start development server

```bash
pnpm dev
```

### Run a production-like preview

```bash
pnpm preview
```

### Run type checking

```bash
pnpm exec tsc --noEmit
```

## Available Commands

Commands currently defined in `package.json`:

```bash
pnpm dev
pnpm dev:full
pnpm dev:preview
pnpm build
pnpm build:prod
pnpm preview
pnpm prod
pnpm prod:full
```

What they do:

- `pnpm dev`
  - starts the Vite dev server on port `3000`
- `pnpm dev:full`
  - builds first, then starts the dev server
- `pnpm dev:preview`
  - previews the current build on port `3000`
- `pnpm build`
  - builds using `.env.local` when present
- `pnpm build:prod`
  - builds with production mode and `.env.production` when present
- `pnpm preview`
  - previews the current build on port `3000`
- `pnpm prod`
  - previews the app with `NODE_ENV=production`
- `pnpm prod:full`
  - production build followed by preview

## Development Workflow

Recommended workflow for current contributors:

1. start from `pnpm dev`
2. use `pnpm exec tsc --noEmit` frequently
3. keep feature logic inside `src/modules/*` whenever possible
4. use `src/core/http/*` instead of introducing new direct `fetch` calls
5. keep mock decisions centralized instead of scattering environment checks
6. prefer adapting legacy consumers rather than growing parallel patterns

## HTTP and Service Layers

### HTTP foundation

Main files:

- `src/core/http/client.ts`
- `src/core/http/endpoints.ts`
- `src/core/http/auth.ts`
- `src/core/http/errors.ts`
- `src/core/http/types.ts`

This is the preferred network foundation.

### Error normalization

The project now treats error normalization as a cross-cutting concern.

Relevant files:

- `src/core/http/errors.ts`
- `src/services/api.ts`
- `src/hooks/useGromptAPI.ts`

Current direction:

- `HttpError` is the base normalized error
- `APIError` remains available as a compatibility adapter over the same normalized shape
- unknown errors should be normalized instead of invented ad hoc in consumers

### Older service surfaces still present

Relevant files:

- `src/services/api.ts`
- `src/services/enhancedAPI.ts`
- `src/services/multiProviderService.ts`

These still exist because the frontend is mid-migration. They are functional, but they should be treated as compatibility layers rather than the long-term ideal shape.

## State Management

The frontend uses a combination of:

- local React state for screen-level interaction
- React Context for cross-cutting concerns
- Zustand for persisted or shared application state
- IndexedDB/localStorage/cookies where appropriate

Main state holders:

- `AuthContext`
- `LanguageContext`
- `useProvidersStore`
- `useAuthStore`

## Mock and Demo Strategy

Mock and demo behavior is now more explicit than before.

Main files:

- `src/core/runtime/mode.ts`
- `src/mocks/scenarios.ts`
- `src/mocks/domains/*`

Current rule of thumb:

- runtime mode decides whether the app should behave as real/demo/simulated
- mock datasets should live under `src/mocks/*`
- pages should not become the source of truth for simulation logic

Examples of domains already using centralized mock data:

- gateway
- sync
- invite
- mail
- workspace

## Current Limitations

This README reflects the project honestly, including current gaps.

Known limitations at this stage:

- routing is still hash-based instead of router-based
- `Mail Hub` and `Workspace Settings` are still mock-backed from a backend perspective
- some legacy service layers still coexist with the newer foundation
- `Data Analyzer` still requires a future backend-oriented hardening pass
- the codebase still contains legacy structures such as `screens/` alongside the newer page/module architecture

## Contribution Notes

If you are adding or refactoring code in this frontend, prefer the following direction:

- add new network calls through `core/http`
- extract domain logic into `src/modules/<domain>`
- centralize mock behavior instead of branching from pages
- keep runtime mode decisions in `src/core/runtime`
- keep navigation behavior in `src/core/navigation`
- update this README if architectural expectations change materially

## Documentation Map

Frontend-local documentation:

- English: [README.md](./README.md)
- Portuguese (Brazil): [docs/README.pt-BR.md](./docs/README.pt-BR.md)

If the architecture changes materially again, update both files together.
