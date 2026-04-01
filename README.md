# ⚡ Life OS Pessoal

App mobile-first de organização pessoal — tarefas, metas, finanças e rotina em uma única interface.

## Stack

- **Next.js 15** (App Router + Server Actions)
- **TypeScript** — tipagem completa
- **Tailwind CSS** — estilização mobile-first
- **Supabase** — banco de dados PostgreSQL + Auth + RLS
- **Vercel** — deploy

---

## Estrutura do projeto

```
src/
├── app/                        # Rotas Next.js (App Router)
│   ├── layout.tsx              # Layout raiz — BottomNav + FAB
│   ├── page.tsx                # Redirect → /dashboard ou /auth/login
│   ├── globals.css             # Estilos globais + utilitários mobile
│   ├── dashboard/page.tsx      # Dashboard principal
│   ├── tasks/
│   │   ├── page.tsx            # Lista de tarefas com filtros
│   │   └── [id]/page.tsx       # Detalhe da tarefa + subtarefas
│   ├── areas/
│   │   ├── page.tsx            # Grid de áreas da vida
│   │   └── [id]/page.tsx       # Detalhe da área
│   ├── finances/page.tsx       # Finanças — resumo + lançamentos
│   ├── goals/page.tsx          # Metas por prazo
│   └── auth/
│       ├── login/page.tsx      # Login + cadastro
│       └── callback/route.ts   # OAuth callback
│
├── components/
│   ├── layout/
│   │   ├── BottomNav.tsx       # Navegação inferior (5 abas)
│   │   └── QuickAddFAB.tsx     # Botão "+" flutuante — tarefa ou lançamento
│   ├── auth/
│   │   └── LoginForm.tsx       # Formulário login/signup
│   ├── tasks/
│   │   ├── TaskCard.tsx        # Card de tarefa com toggle
│   │   ├── TaskFilters.tsx     # Filtros por status e área
│   │   ├── TaskStatusSelect.tsx # Dropdown de status inline
│   │   ├── NewTaskSheet.tsx    # Sheet/modal de criação de tarefa
│   │   └── SubtaskList.tsx     # Lista editável de subtarefas
│   ├── goals/
│   │   ├── GoalCard.tsx        # Card com slider de progresso
│   │   └── NewGoalSheet.tsx    # Sheet de criação de meta
│   └── finances/
│       ├── FinanceSummary.tsx  # Cards de saldo/receita/despesa
│       ├── FinancesList.tsx    # Lista agrupada por data
│       └── MonthPicker.tsx     # Navegação entre meses
│
├── lib/
│   ├── utils.ts                # cn(), formatCurrency(), formatDate()...
│   ├── supabase/
│   │   ├── client.ts           # Supabase client (browser)
│   │   └── server.ts           # Supabase client (server/SSR)
│   └── actions/
│       ├── tasks.ts            # Server actions — CRUD tarefas
│       ├── finances.ts         # Server actions — CRUD finanças
│       └── goals-areas.ts      # Server actions — goals + áreas
│
├── types/index.ts              # Tipos TypeScript globais
└── middleware.ts               # Proteção de rotas (auth)
```

---

## Setup rápido

### 1. Clonar e instalar

```bash
git clone <seu-repo>
cd life-os
npm install
```

### 2. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Vá em **SQL Editor** e execute o conteúdo de `supabase/schema.sql`
3. Copie as chaves em **Settings → API**

### 3. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
# Edite .env.local com suas chaves do Supabase
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
# Acesse http://localhost:3000
```

### 5. Deploy na Vercel

```bash
npx vercel
# Adicione as variáveis de ambiente no painel da Vercel
```

---

## Banco de dados

O arquivo `supabase/schema.sql` cria todas as tabelas, políticas RLS e um trigger
que gera automaticamente as 6 áreas padrão (Faculdade, Trabalho, Saúde, Pessoal,
Finanças, Metas) quando o usuário se cadastra.

### Tabelas principais

| Tabela              | Descrição                              |
|---------------------|----------------------------------------|
| `life_areas`        | 6 áreas padrão + áreas customizadas    |
| `tasks`             | Tarefas com prioridade, status, prazo  |
| `subtasks`          | Subtarefas vinculadas a tarefas        |
| `goals`             | Metas com progresso e prazo            |
| `financial_entries` | Receitas e despesas por categoria      |
| `pages`             | Páginas livres dentro de cada área     |
| `notes`             | Notas vinculadas a tarefas             |

Toda tabela tem **Row Level Security** ativo — cada usuário vê apenas os próprios dados.

---

## Funcionalidades do MVP

### Dashboard
- Saudação por horário
- Contador de tarefas do dia
- Metas ativas com progresso
- Resumo financeiro (saldo, receitas, despesas)

### Tarefas
- Criar, concluir, excluir
- Filtrar por status e área
- Detalhe com subtarefas editáveis
- Prioridade visual (alta/média/baixa)
- Indicador de prazo vencido

### Áreas da vida
- 6 áreas pré-configuradas (customizáveis no BD)
- Contagem de tarefas e metas por área
- Progresso visual de conclusão
- Página de detalhe com todas as tarefas da área

### Finanças
- Registro rápido via FAB (+)
- Resumo mensal (saldo, receitas, despesas)
- Navegação entre meses
- Lista agrupada por data
- Barra de progresso despesas/receita

### Metas
- Organização por prazo (curto/médio/longo)
- Slider de progresso editável inline
- Vinculação com área da vida
- Data alvo

### FAB global
- Criar tarefa rapidamente (título + prioridade + prazo)
- Registrar lançamento financeiro (tipo + valor + categoria)

---

## Roadmap (Fase 2)

- [ ] Páginas personalizadas dentro de cada área
- [ ] Recorrência de tarefas
- [ ] Notificações push (via Supabase Edge Functions)
- [ ] Hábitos diários com streak
- [ ] Modo offline (PWA com cache)
- [ ] Analytics pessoal (gráficos por semana/mês)
- [ ] Import/export de dados

---

## PWA (opcional)

O app já tem `manifest.json` configurado. Para funcionar como app instalável no celular:

1. Adicione os ícones `/public/icon-192.png` e `/public/icon-512.png`
2. Adicione um Service Worker (ex: via `next-pwa`)
3. No iPhone: Safari → Compartilhar → Adicionar à Tela de Início
