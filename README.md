# 💻 Dupply Frontend — Interface Web de Antecipação de Recebíveis

O **Dupply Frontend** é a aplicação web Single Page Application (SPA) da plataforma **Dupply**, desenvolvida com **React 19**, **Vite 7**, **TailwindCSS v4** e **Shadcn UI / Radix UI**.

A plataforma oferece uma experiência de usuário (UX) fluida, responsiva e de alto padrão visual, permitindo que **Cedentes** enviem duplicatas, **Analistas de Risco** tomem decisões fundamentadas por **Agentes de IA**, **Administradores** acompanhem o mercado e **Investidores** financiem títulos líquidos.

---

## 📑 Sumário

- [Visão Geral & Proposta de Valor](#-visão-geral--proposta-de-valor)
- [Destaques de Arquitetura de UI/UX](#-destaques-de-arquitetura-de-uiux)
- [Painel de Análise do Agente de IA](#-painel-de-análise-do-agente-de-ia)
- [Perfis de Acesso & Fluxos de Tela](#-perfis-de-acesso--fluxos-de-tela)
- [Estrutura de Diretórios](#-estrutura-de-diretórios)
- [Arquitetura de Estado e Contextos](#-arquitetura-de-estado-e-contextos)
- [Guia de Instalação e Execução](#-guia-de-instalação-e-execução)
- [Integração com a API Backend](#-integração-com-a-api-backend)
- [Scripts Disponíveis](#-scripts-disponíveis)

---

## 🌐 Visão Geral & Proposta de Valor

O frontend da Dupply foi construído para eliminar a complexidade da análise tradicional de crédito. Em vez de telas administrativas densas e confusas, o sistema oferece:

1. **Clareza de Informações**: Visualização rápida de valores, vencimentos, status de aceite do sacado e certidões fiscais.
2. **Inteligência Assistida por IA**: Exibição dos laudos automatizados do Agente de IA diretamente ao lado dos dados da duplicata.
3. **Fluxos Operacionais Responsivos**: Layouts otimizados para desktops, notebooks e dispositivos móveis sem perda de contexto ou quebra de componentes.

---

## 🎨 Destaques de Arquitetura de UI/UX

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ Topbar Header (HeaderContext): [← Voltar] DUP-2026 [Serviço] Análise: Pend.│
├──────────────┬─────────────────────────────────────────────────────────────┤
│ Sidebar      │ Conteúdo da Página                                          │
│              │                                                             │
│ [Dupply]     │ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│              │ │ Card Valores e Datas    │ │ AnalystAiReport             │ │
│ [|] Recolher │ ├─────────────────────────┤ │ (Agente de IA)              │ │
│ Painel       │ │ Card Sacado             │ │                             │ │
│ Cedentes     │ ├─────────────────────────┤ │ [Visão] [SWOT] [DRE] [PDF]  │ │
│ Duplicatas   │ │ Card Documentação       │ │                             │ │
│              │ └─────────────────────────┘ └─────────────────────────────┘ │
│ [Avatar]     │                                                             │
│ Analyst      │                                                             │
└──────────────┴─────────────────────────────────────────────────────────────┘
```

### 1. Sidebar Integradora Dinâmica (`AppSidebar`)
- **Visualização por Perfil**: O menu altera automaticamente as opções exibidas conforme o perfil logado (`seller`, `riskAnalyst`, `admin`, `investor`).
- **Botão de Alternância Integrado (`[|]`)**: Localizado como a **primeira opção** da lista de navegação (logo acima do "Painel"), permitindo expandir ou recolher o menu lateral com um único clique.
- **Rodapé do Usuário (`SidebarFooter`)**: Exibe o avatar do usuário, seu nome, badge estilizado do perfil selecionado e um botão de logout seguro.

### 2. Navegação Superior Contextual (`HeaderContext`)
- **Zero Desperdício Vertical**: As telas podem injetar o cabeçalho dinâmico (ex: botão de retorno `← Voltar`, número da duplicata, tipo fiscal e badges de análise) direto no topbar global.
- **Transição Suave**: O contexto é limpo e atualizado automaticamente na montagem/desmontagem das rotas via React Context API (`useHeader`).

---

## 🤖 Painel de Análise do Agente de IA (`AnalystAiReport`)

O componente `AnalystAiReport` é o coração da esteira de análise de risco no frontend. Ele recebe o payload do backend contendo os campos `aiReport` (JSON) e `aiReportPdfUrl` (PDF) e os apresenta em uma interface altamente estilizada:

- **Aba "Visão Geral"**:
  - Resumo executivo da empresa emitido pela IA.
  - Informações de fundação, estrutura societária (sócios e percentuais) e portfólio comercial de clientes e fornecedores.
- **Aba "Análise SWOT"**:
  - Matriz visual em 4 quadros: **Forças** (verde), **Fraquezas** (vermelho), **Oportunidades** (azul) e **Ameaças** (amarelo).
- **Aba "Financeiro & Score"**:
  - Demonstrativo DRE detalhado (Faturamento bruto, custo operacional, EBITDA, margem líquida).
  - Indicadores financeiros chave (Liquidez corrente, endividamento, cobertura de juros).
  - Badges de pontuação e rating de crédito.
- **Ação "Relatório PDF"**:
  - Botão com ícone para visualização e download em tempo real do PDF oficial timbrado da Dupply.

---

## 👥 Perfis de Acesso & Fluxos de Tela

A aplicação conta com 4 jornadas principais de uso:

### 1. Cedente (`/seller`)
- **Painel (`SellerDashboardPage`)**: Visão consolidada de recebíveis emitidos, limites de antecipação e saldo disponível.
- **Minhas Duplicatas (`SellerDuplicatasPage`)**: Tabela interativa com filtros por status de análise e aceite do sacado.
- **Nova Duplicata (`NewDuplicataPage`)**: Formulário em etapas para cadastro da nota fiscal, dados do sacado e anexos de comprovantes.
- **Detalhes da Duplicata (`SellerDuplicataDetailPage`)**: Visualização da proposta de antecipação e botão de aceite de taxa pelo cedente.

### 2. Analista de Risco (`/analyst`)
- **Painel (`AnalystDashboardPage`)**: Métricas de recebíveis pendentes, volume financeiro sob análise e tempo médio de resposta.
- **Cedentes (`AnalystSellersPage`)**: Lista de empresas cadastradas e acompanhamento da validação cadastral.
- **Fila de Duplicatas (`AnalystDuplicatasPage`)**: Tabela de títulos aguardando verificação de risco.
- **Detalhes & Parecer (`AnalystDuplicataDetailPage`)**: Tela dividida com dados fiscais/sacado à esquerda e o **Agente de IA** à direita, integrada ao Wizard de Precificação (`AnalystDuplicataApprovalWizardDialog`).

### 3. Administrador (`/admin`)
- **Gestão do Ecossistema (`AdminDashboardPage`)**: Monitoramento global de operações e saldo da plataforma.
- **Ofertas Prontas (`AdminOffersReadyPage`)**: Mapeamento de duplicatas aprovadas pelo risco e prontas para estruturação de oferta.
- **Investimentos & Transações (`AdminInvestmentsPage`, `AdminTransactionsPage`)**: Auditoria de movimentações e liquidações.

### 4. Investidor (`/investor`)
- **Vitrine de Oportunidades (`InvestorOpportunitiesPage`)**: Catálogo de recebíveis disponíveis para aporte com rentabilidade (CDI + taxa) e prazo.
- **Minha Carteira (`InvestorInvestmentsPage`)**: Acompanhamento de cotas adquiridas e histórico de recebimentos.

---

## 📁 Estrutura de Diretórios

```text
dupply-frontend/
├── src/
│   ├── components/
│   │   ├── analyst/                 # Componentes de risco (AnalystAiReport, ApprovalWizard)
│   │   ├── duplicata/               # Componentes visuais de duplicatas (Badges, Status)
│   │   ├── forms/                   # Formulários de cadastro e upload de notas
│   │   ├── investor/                # Componentes de oferta e investimento
│   │   ├── layout/                  # AppShell, AppSidebar, Header, Topbar
│   │   └── ui/                      # Biblioteca de componentes base Shadcn UI
│   ├── contexts/                    # Contextos globais (AuthContext, HeaderContext)
│   ├── domain/                      # Interfaces TypeScript (duplicata, auth, seller)
│   ├── lib/                         # Utilitários (formatters, routes, api-client)
│   ├── pages/                       # Componentes de página divididos por perfil
│   │   ├── admin/
│   │   ├── analyst/
│   │   ├── investor/
│   │   └── seller/
│   ├── routes/                      # Route guards (ProtectedRoute, GuestRoute)
│   ├── services/                    # Integração com as APIs HTTP do backend
│   ├── App.tsx                      # Configuração de rotas React Router
│   └── main.tsx                     # Entrypoint do React
├── public/                          # Ativos estáticos (Logos, PDFs de exemplo)
├── package.json
└── README.md
```

---

## 🧠 Arquitetura de Estado e Contextos

- **`AuthContext`**: Gerencia a sessão ativa do usuário, token JWT, dados do perfil selecionado e métodos de login/logout.
- **`HeaderContext`**: Permite que páginas filhas registrem dinamicamente elementos React para serem renderizados no `Header` global sem prop-drilling.
- **`SidebarContext` (Shadcn UI)**: Controla o estado de recolhimento (`expanded` / `collapsed`) e o comportamento responsivo em telas de dispositivos móveis.

---

## 🚦 Guia de Instalação e Execução

### 1. Pré-requisitos
- **Node.js**: v20.0.0 ou v22.0.0+
- **npm**: v10.0.0+

### 2. Instalação e Execução

```bash
# Entrar no diretório do frontend
cd Repos/Frontend/dupply-frontend

# Instalar todas as dependências
npm install

# Iniciar o servidor de desenvolvimento Vite
npm run dev
```

A aplicação estará acessível em: `http://localhost:5173`.

---

## 🔗 Integração com a API Backend

O aplicativo realiza requisições HTTP para a API Fastify configurada no backend (por padrão em `http://localhost:8080`).

Os serviços localizados em `src/services/` (`duplicata.service.ts`, `auth.service.ts`, `seller-review.service.ts`) utilizam o cliente HTTP unificado (`src/lib/api-client.ts`), com tratamento automático de erros e envio do token JWT via cabeçalho `Authorization: Bearer`.

---

## 🧪 Scripts Disponíveis

- **`npm run dev`**: Inicia o servidor local de desenvolvimento Vite com Hot Module Replacement (HMR).
- **`npm run typecheck`**: Executa a checagem rigorosa de tipos com o compilador TypeScript (`tsc -b`, nos projetos `tsconfig.app.json` e `tsconfig.node.json`).
- **`npm run build`**: Gera a compilação otimizada para produção no diretório `dist/`.
- **`npm run preview`**: Inicia um servidor local para visualizar a build de produção gerada.

---

<p align="center">
  <strong>Dupply Frontend</strong> — Experiência fluida para operações de crédito transparentes.
</p>
