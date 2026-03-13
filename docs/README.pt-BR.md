# GNyx-UI

English version: [../README.md](../README.md)

## Sumário

- [Visão Geral](#visão-geral)
- [Escopo Atual do Produto](#escopo-atual-do-produto)
- [Stack Tecnológica](#stack-tecnológica)
- [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Domínios Funcionais](#domínios-funcionais)
- [Modelo de Autenticação e Acesso](#modelo-de-autenticação-e-acesso)
- [Runtime de IA e Seleção de Provider](#runtime-de-ia-e-seleção-de-provider)
- [BI Studio](#bi-studio)
- [Modos de Runtime](#modos-de-runtime)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Começar](#como-começar)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Camadas HTTP e de Serviço](#camadas-http-e-de-serviço)
- [Gerenciamento de Estado](#gerenciamento-de-estado)
- [Estratégia de Mock e Demo](#estratégia-de-mock-e-demo)
- [Limitações Atuais](#limitações-atuais)
- [Mapa de Documentação](#mapa-de-documentação)
- [Screenshots](#screenshots)

## Visão Geral

`GNyx-UI` é o frontend embarcado do produto `GNyx`.

Ele é uma aplicação React 19 + TypeScript + Vite que agora combina:

- bootstrap real de autenticação
- navegação tenant-aware e tratamento de acesso
- features de IA sustentadas por providers reais
- superfícies administrativas e operacionais
- MVP de gestão de acesso
- uma primeira frente de BI guiada por metadados

A aplicação ainda usa um shell baseado em hash em vez de React Router, mas o modelo de runtime já está significativamente mais grounded do que estava antes no projeto.

## Escopo Atual do Produto

Áreas visíveis principais atualmente disponíveis:

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

A maturidade atual é propositalmente desigual:

- algumas áreas já consomem estado real do backend e providers reais
- algumas áreas são híbridas
- algumas ainda permanecem mockadas até que outras frentes de backend/dominio avancem

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

Pacotes adicionais relevantes para runtime incluem:

- SDK da OpenAI
- SDK da Anthropic
- SDK do Google GenAI
- `jszip`

## Visão Geral da Arquitetura

O frontend está sendo consolidado em camadas mais claras:

- `src/core/http`: cliente HTTP, endpoints e tratamento de erro
- `src/core/navigation`: hash routing e resolução de guarded sections
- `src/core/runtime`: decisões de modo de runtime
- `src/modules/*`: slices orientadas por domínio
- `src/mocks/*`: mocks centralizados por domínio
- `src/context/AuthContext.tsx`: estado autenticado e materialização de acesso
- `src/pages/*`: composição de telas e fluxos visíveis ao usuário

A direção atual é manter construção de prompt, normalização de API e lógica de domínio fora dos componentes de página sempre que fizer sentido.

## Estrutura do Repositório

```text
src/App.tsx                    shell central e navegação protegida
src/components/                UI reutilizável e componentes de feature
src/context/                   contexto auth/runtime
src/core/http/                 fundação HTTP
src/core/navigation/           modelo de rotas via hash
src/core/access/               helpers de acesso e RBAC MVP
src/modules/                   módulos de domínio para chat, creative, mail, workspace, providers, access, bi
src/mocks/                     cenários e dados mockados centralizados
src/pages/                     páginas do produto
```

## Domínios Funcionais

Os módulos de domínio atuais incluem:

- `chat`
- `creative`
- `mail`
- `workspace`
- `providers`
- `access`
- `bi`

Esses módulos já cobrem uma parcela relevante do comportamento de produto voltado a runtime.

## Modelo de Autenticação e Acesso

O frontend já não trata autenticação como apenas identidade.

Comportamento atual do bootstrap autenticado:

- `/me` e `/auth/me` são consumidos como bootstrap canônico de acesso
- `access_scope` é materializado em estado real de runtime
- `activeTenant`, `activeMembership`, `activeRoleCode` e permissões efetivas são derivados e persistidos
- usuários autenticados sem acesso efetivo ficam retidos em `Welcome`, em vez de navegar cegamente para o workspace
- os helpers de RBAC agora leem o `AuthContext` real, e não a antiga store mockada de auth

A UX atual de acesso inclui:

- header tenant-aware
- troca opcional de tenant quando existem múltiplas memberships
- guards de rota baseados no estado real de acesso
- página `Access Management` para membros, roles, convites e permissões efetivas

## Runtime de IA e Seleção de Provider

As áreas assistidas por IA agora usam o runtime real do backend, e não mais apenas comportamento de UI.

Pontos operacionais relevantes:

- chat, sumarização, geração de código, prompt crafting e image-prompt passam por rotas reais do backend
- a escolha de provider pode ser feita por ferramenta na UI
- o estado do provider é lido do runtime real do backend
- `Providers Settings` reflete disponibilidade, default model e lista de models
- postura prática atual de providers:
  - `Groq`: melhor happy path para a demo de BI
  - `Gemini`: suportado, mas mais lento e mais sujeito a fallback na fidelidade do contrato BI

## BI Studio

`BI Studio` é a primeira prova de conceito visual da geração de boards guiada por metadados.

Seu comportamento é intencionalmente honesto:

- se o catálogo de metadados Sankhya estiver disponível no backend, a tela expõe geração e exportação
- se o catálogo não estiver disponível, a tela muda para um estado de pré-requisito em vez de fingir prontidão

Capacidades atuais do BI Studio:

- selecionar provider
- gerar um board grounded pelo backend
- inspecionar provider, model, generation mode e usage
- inspecionar widgets gerados e SQL
- copiar `dashboard_schema`
- baixar um ZIP com artefatos portáveis

Isso torna a feature demonstrável sem depender de um runtime Sankhya ao vivo.

## Modos de Runtime

O frontend hoje opera com uma mistura de:

- modo real via backend
- comportamento orientado a demo
- mocks centralizados em domínios selecionados
- persistência local em áreas específicas

A política de runtime agora está mais centralizada do que antes, reduzindo comportamento contraditório entre serviços.

## Variáveis de Ambiente

A superfície exata de env pode evoluir, mas o frontend depende principalmente do runtime Vite e da alcançabilidade do backend.

Exemplos relevantes incluem:

- `VITE_SIMULATE_AUTH`
- configuração de base de API consumida pela camada HTTP

O runtime do backend continua sendo a principal fonte de verdade para estado de acesso e providers.

## Como Começar

Instalar dependências:

```bash
pnpm install
```

Rodar o servidor de desenvolvimento:

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

## Comandos Disponíveis

```bash
pnpm dev
pnpm exec tsc --noEmit
pnpm exec vite build
pnpm preview
```

## Camadas HTTP e de Serviço

A fundação HTTP atual é centrada em `src/core/http`.

Traços importantes:

- catálogo de endpoints centralizado
- tratamento normalizado de erros de request/response
- camadas de serviço compondo lógica de feature acima do cliente compartilhado
- a base já foi amplamente refatorada para sair de `fetch` espalhado, exceto no próprio núcleo HTTP

## Gerenciamento de Estado

O estado é tratado por uma combinação de:

- estado local React para interação de página
- `AuthContext` para estado autenticado de runtime
- stores Zustand selecionadas onde ainda fazem sentido
- `localStorage` e IndexedDB para persistência em fluxos específicos

Exemplos recentes:

- persistência do histórico do chat ao navegar
- persistência da preferência de provider por ferramenta
- persistência do tenant ativo

## Estratégia de Mock e Demo

Os mocks agora estão mais centralizados e orientados por domínio do que antes.

Estratégia atual:

- manter datasets mockados em `src/mocks/*`
- permitir demo mode sem espalhar dados fake pelas páginas
- substituir ou reduzir mocks progressivamente conforme slices reais do backend amadurecem

Isso já reduziu o custo de migração em domínios como:

- gateway
- sync
- invite
- mail
- workspace

## Limitações Atuais

Limitações conhecidas hoje:

- nem toda página ainda é 100% sustentada por backend
- o enforcement de permissões ainda é um MVP, não um IAM final
- gating por plano e entitlement ainda não está plenamente operacional
- `Data Analyzer` ainda exige hardening mais profundo no backend
- `Gemini` está mais lento e menos estável que `Groq` para a slice atual de BI
- o build ainda emite um warning já conhecido do `lottie-web` relacionado a `eval`

## Mapa de Documentação

Docs úteis:

- [`../README.md`](../README.md)
- [`docs/README.pt-BR.md`](./README.pt-BR.md)
- [`../.notes/analyzis/global-execution-plan/`](../.notes/analyzis/global-execution-plan)
- [`../.notes/analyzis/gnyx-skw-dynamic-ui/`](../.notes/analyzis/gnyx-skw-dynamic-ui)

## Screenshots

Sugestões de placeholders:

- `[Screenshot Placeholder: Welcome com tenant ativo]`
- `[Screenshot Placeholder: Providers Settings]`
- `[Screenshot Placeholder: Access Management]`
- `[Screenshot Placeholder: BI Studio]`
