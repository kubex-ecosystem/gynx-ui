# GNyx-UI

## Sumário

- [Visão Geral](#visão-geral)
- [Escopo Atual do Produto](#escopo-atual-do-produto)
- [Stack Tecnológica](#stack-tecnológica)
- [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Domínios Funcionais](#domínios-funcionais)
- [Modos de Runtime](#modos-de-runtime)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Começar](#como-começar)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Fluxo de Desenvolvimento](#fluxo-de-desenvolvimento)
- [Camadas HTTP e de Serviço](#camadas-http-e-de-serviço)
- [Gerenciamento de Estado](#gerenciamento-de-estado)
- [Estratégia de Mock e Demo](#estratégia-de-mock-e-demo)
- [Limitações Atuais](#limitações-atuais)
- [Notas para Contribuição](#notas-para-contribuição)
- [Mapa de Documentação](#mapa-de-documentação)

## Visão Geral

`GNyx-UI` é a aplicação frontend do workspace GNyx. Trata-se de uma aplicação React 19 + TypeScript + Vite que combina:

- fluxos de autenticação e onboarding
- ferramentas assistidas por IA
- dashboards operacionais
- configuração de providers e fluxos BYOK
- camadas de serviço com consciência offline
- módulos frontend orientados por domínio

Atualmente a aplicação é organizada em torno de um shell baseado em hash, em vez de React Router, e mistura camadas modernizadas (`core/http`, `core/navigation`, `modules/*`, `mocks/*`) com algumas áreas de serviço ainda legadas que estão sendo normalizadas aos poucos.

## Escopo Atual do Produto

No estado atual deste README, o frontend inclui as seguintes áreas visíveis ao usuário:

- `Landing`: página pública inicial
- `Auth`: tela de login
- `Accept Invite`: fluxo público para concluir onboarding
- `Welcome`: página inicial do workspace após login
- `Gateway Dashboard`: métricas e logs operacionais
- `Mail Hub`: inbox inteligente, atualmente sustentado por mocks
- `Data Sync`: integrações e jobs de sincronização
- `Workspace Settings`: configurações de tenant/workspace, atualmente sustentadas por mocks
- `Providers Settings`: administração de providers de IA e roteamento
- `Prompt Crafter`: fluxo de geração estruturada de prompts
- `Agents`: geração e armazenamento de agents
- `Chat`: assistente conversacional
- `Summarizer`: sumarização de conteúdo
- `Code`: geração de código
- `Images`: criação de prompts para imagem
- `Playground`: área de testes com streaming
- `Data Analyzer`: área de análise que ainda exige hardening futuro no backend

## Stack Tecnológica

Stack principal:

- React 19
- TypeScript
- Vite 7
- TailwindCSS
- Framer Motion
- Zustand
- IndexedDB via `idb`
- `js-cookie`
- `lucide-react`

Dependências relacionadas a providers e IA atualmente presentes no frontend:

- SDK da OpenAI
- SDK da Anthropic
- SDK do Google GenAI

## Visão Geral da Arquitetura

O frontend está evoluindo para uma arquitetura em camadas mais explícita.

### Camadas centrais

- `src/core/http/*`
  - cliente HTTP unificado
  - catálogo de endpoints
  - helpers de autenticação e headers
  - tipos de erro normalizados
- `src/core/navigation/*`
  - helpers de navegação hash
  - parsing de rota e regras de navegação protegida
- `src/core/runtime/*`
  - resolução do modo de runtime do frontend
  - flags para comportamento demo/simulado
- `src/core/llm/*`
  - abstrações locais para wrappers de providers

### Módulos de domínio

O projeto vem movendo a lógica de negócio para `src/modules/*`.

Módulos já ativos:

- `src/modules/chat`
- `src/modules/creative`
- `src/modules/mail`
- `src/modules/providers`
- `src/modules/workspace`

### Camadas de serviço

O frontend ainda usa mais de um estilo de serviço porque o código está em migração:

- `core/http` como fundação atual de rede
- `services/api.ts` como camada de compatibilidade
- `services/enhancedAPI.ts` para cache/offline/fila
- serviços de domínio como `unifiedAIService`, `gatewayService`, `syncService`, `inviteService`, `agentsService` e outros

## Estrutura do Repositório

```text
frontend/
├── docs/                     # Documentação específica do frontend
├── public/                   # Assets estáticos
├── src/
│   ├── assets/               # Imagens, lotties e assets de UI
│   ├── components/           # Componentes compartilhados e de feature
│   ├── config/               # Helpers de configuração do frontend
│   ├── constants/            # Constantes e definições estáticas
│   ├── context/              # Contextos React (auth, language)
│   ├── core/                 # Fundação HTTP, runtime, navegação e LLM
│   ├── hooks/                # Hooks reutilizáveis
│   ├── i18n/                 # Suporte a tradução
│   ├── lib/                  # Utilitários e adapters locais
│   ├── mocks/                # Cenários de mock e dados por domínio
│   ├── modules/              # Módulos frontend orientados por domínio
│   ├── pages/                # Páginas e shells de rota
│   ├── screens/              # Estruturas mais antigas baseadas em screen
│   ├── services/             # Integrações e orquestração
│   ├── store/                # Stores Zustand
│   ├── tests/                # Testes e fixtures do frontend
│   ├── types/                # Contratos TypeScript compartilhados
│   └── utils/                # Helpers genéricos
├── package.json
└── README.md
```

## Domínios Funcionais

### Acesso e onboarding

Arquivos principais:

- `src/context/AuthContext.tsx`
- `src/pages/Landing.tsx`
- `src/pages/Auth.tsx`
- `src/pages/AcceptInvite.tsx`
- `src/services/inviteService.ts`

Notas:

- validação de sessão usa o cliente HTTP unificado
- aceite de convite é um fluxo público especial
- auth simulada ainda pode ser habilitada para trabalho frontend-only

### Ferramentas de IA e criação

Arquivos principais:

- `src/modules/chat/*`
- `src/modules/creative/*`
- `src/services/unifiedAIService.ts`
- `src/components/features/*`

Notas:

- `Chat`, `Summarizer`, `Code` e `Images` já estão ligados a fluxos orientados a backend
- disponibilidade de provider é resolvida via configuração e suporte a BYOK

### Operações e administração

Arquivos principais:

- `src/pages/GatewayDashboard.tsx`
- `src/pages/DataSync.tsx`
- `src/pages/MailHub.tsx`
- `src/pages/WorkspaceSettings.tsx`
- `src/pages/ProvidersSettings.tsx`
- `src/modules/mail/*`
- `src/modules/workspace/*`
- `src/modules/providers/*`

Notas:

- `Mail Hub` e `Workspace Settings` agora estão modularizados, mas ainda usam mocks do ponto de vista do backend
- `Providers Settings` agora está modularizado em torno de um módulo dedicado
- gateway e sync seguem híbridos entre real e mock, dependendo do runtime

## Modos de Runtime

O frontend atualmente suporta três modos práticos de execução.

### 1. Modo com backend real

Usado quando o frontend conversa normalmente com o backend.

Características:

- chamadas HTTP reais
- autenticação e sessão reais
- resolução real de config/providers

### 2. Modo demo

Resolvido por flags de runtime e fallbacks de serviço.

Características:

- configuração pode cair para valores voltados a demo
- UX orientada a BYOK continua disponível
- partes da UI ainda podem funcionar como demonstração conectada

### 3. Modo simulado / mock-assisted

Usado para manter o frontend evoluindo sem depender do backend.

Características:

- auth/sessão podem ser simuladas
- branches mock de invite/gateway/sync podem ser usados
- útil para trabalho isolado de UI e interação

## Variáveis de Ambiente

Variáveis atualmente usadas no frontend:

```env
VITE_API_URL=http://localhost:8080
VITE_DEMO_MODE=false
VITE_SIMULATE_AUTH=false
```

Resumo de comportamento:

- `VITE_API_URL`
  - URL base do backend quando necessária no runtime do frontend
- `VITE_DEMO_MODE`
  - habilita comportamento demo no frontend
- `VITE_SIMULATE_AUTH`
  - habilita fluxos simulados para auth e partes mockadas

Os scripts atuais dependem de sourcing POSIX de `.env.local` e `.env.production` quando disponíveis.

## Como Começar

### Pré-requisitos

Recomendado:

- Node.js 20+
- pnpm 10+
- shell compatível com POSIX para os scripts fornecidos

### Instalar dependências

```bash
cd frontend
pnpm install
```

### Iniciar servidor de desenvolvimento

```bash
pnpm dev
```

### Executar preview em modo próximo de produção

```bash
pnpm preview
```

### Rodar checagem de tipos

```bash
pnpm exec tsc --noEmit
```

## Comandos Disponíveis

Comandos atualmente definidos no `package.json`:

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

O que fazem:

- `pnpm dev`
  - inicia o servidor Vite na porta `3000`
- `pnpm dev:full`
  - faz build e depois inicia o servidor de desenvolvimento
- `pnpm dev:preview`
  - faz preview do build atual na porta `3000`
- `pnpm build`
  - gera build usando `.env.local` quando existir
- `pnpm build:prod`
  - gera build em modo produção com `.env.production` quando existir
- `pnpm preview`
  - faz preview do build atual na porta `3000`
- `pnpm prod`
  - faz preview com `NODE_ENV=production`
- `pnpm prod:full`
  - build de produção seguido de preview

## Fluxo de Desenvolvimento

Fluxo recomendado para quem contribuir hoje:

1. começar com `pnpm dev`
2. usar `pnpm exec tsc --noEmit` com frequência
3. colocar lógica de domínio em `src/modules/*` sempre que fizer sentido
4. usar `src/core/http/*` em vez de introduzir novos `fetch` diretos
5. centralizar decisões de mock em vez de ramificar a partir de páginas
6. preferir adaptar consumidores legados a criar novos padrões paralelos

## Camadas HTTP e de Serviço

### Fundação HTTP

Arquivos principais:

- `src/core/http/client.ts`
- `src/core/http/endpoints.ts`
- `src/core/http/auth.ts`
- `src/core/http/errors.ts`
- `src/core/http/types.ts`

Essa é a fundação preferida de rede.

### Normalização de erro

O projeto agora trata normalização de erro como preocupação transversal.

Arquivos relevantes:

- `src/core/http/errors.ts`
- `src/services/api.ts`
- `src/hooks/useGromptAPI.ts`

Direção atual:

- `HttpError` é o erro-base normalizado
- `APIError` continua disponível como adapter de compatibilidade sobre o mesmo shape
- erros desconhecidos devem ser normalizados, e não inventados ad hoc em cada consumer

### Superfícies de serviço mais antigas ainda presentes

Arquivos relevantes:

- `src/services/api.ts`
- `src/services/enhancedAPI.ts`
- `src/services/multiProviderService.ts`

Eles ainda existem porque o frontend está em migração. Funcionam, mas devem ser tratados como camadas de compatibilidade, não como formato ideal de longo prazo.

## Gerenciamento de Estado

O frontend usa uma combinação de:

- estado local React para interação de tela
- React Context para preocupações transversais
- Zustand para estado compartilhado/persistido
- IndexedDB/localStorage/cookies quando apropriado

Principais pontos de estado:

- `AuthContext`
- `LanguageContext`
- `useProvidersStore`
- `useAuthStore`

## Estratégia de Mock e Demo

O comportamento demo/mock está mais explícito do que antes.

Arquivos principais:

- `src/core/runtime/mode.ts`
- `src/mocks/scenarios.ts`
- `src/mocks/domains/*`

Regra atual:

- o modo de runtime decide se a aplicação deve se comportar como real/demo/simulada
- datasets mock devem viver em `src/mocks/*`
- páginas não devem virar fonte de verdade da lógica de simulação

Exemplos de domínios já usando mocks centralizados:

- gateway
- sync
- invite
- mail
- workspace

## Limitações Atuais

Este README reflete o projeto com honestidade, incluindo lacunas atuais.

Limitações conhecidas neste estágio:

- roteamento ainda é baseado em hash, não em router
- `Mail Hub` e `Workspace Settings` ainda usam mocks do ponto de vista de contrato backend
- algumas camadas legadas ainda coexistem com a fundação mais nova
- `Data Analyzer` ainda precisa de um hardening futuro orientado a backend
- o código ainda contém estruturas legadas como `screens/` ao lado da arquitetura nova baseada em `pages/` e `modules/`

## Notas para Contribuição

Se você for adicionar ou refatorar código neste frontend, prefira a seguinte direção:

- adicionar novas chamadas de rede via `core/http`
- extrair lógica de domínio para `src/modules/<domain>`
- centralizar comportamento mock em vez de fazer branching em páginas
- manter decisões de runtime em `src/core/runtime`
- manter comportamento de navegação em `src/core/navigation`
- atualizar este README se a arquitetura mudar de forma relevante

## Mapa de Documentação

Documentação local do frontend:

- English: [../README.md](../README.md)
- Português (Brasil): [README.pt-BR.md](./README.pt-BR.md)

Se a arquitetura mudar materialmente de novo, atualize os dois arquivos em conjunto.
