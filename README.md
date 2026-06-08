# Corte Brabo — Frontend

Painel web para o sistema de gestão da barbearia **Corte Brabo**. Funcionários (ADM/BARBER) logam pra cadastrar clientes, marcar agendamentos, gerenciar preços e equipe.

> **Backend (API)**: [corte-brabo-backend](https://github.com/SEU-USUARIO/corte-brabo-backend) *(ajustar URL)*

---

## Stack

| Tecnologia | Uso |
|---|---|
| **React 18** | UI library |
| **Vite 5** | Build tool + dev server |
| **TypeScript** | Tipagem estática |
| **TailwindCSS 3** | Estilização utility-first |
| **React Router 6** | Roteamento client-side |
| **Axios** | HTTP client |

Sem outras dependências — ícones são SVG inline, toasts e modais são caseiros.

---

## Estrutura

```
src/
├── api/                    # Funções de chamada HTTP por recurso
│   ├── auth.ts
│   ├── client.ts           # axios + interceptors (JWT, 401 → logout)
│   ├── schedules.ts
│   ├── services.ts
│   └── users.ts
├── components/             # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Icons.tsx           # 22 ícones SVG inline
│   ├── Layout.tsx          # sidebar + outlet
│   ├── Modal.tsx
│   ├── MultiSelect.tsx     # dropdown com chips
│   ├── PageHeader.tsx
│   ├── ProtectedRoute.tsx
│   ├── Toast.tsx           # provider + useToast()
│   └── UserMenu.tsx
├── context/
│   └── AuthContext.tsx     # estado de auth + login/logout
├── pages/                  # Páginas (uma por rota)
│   ├── DashboardPage.tsx
│   ├── LoginPage.tsx
│   ├── SchedulesPage.tsx
│   ├── ServicesPage.tsx
│   └── UsersPage.tsx
├── types/
│   └── api.ts              # interfaces espelhando os DTOs do back
├── App.tsx                 # definição de rotas
├── main.tsx                # entrypoint + providers
└── index.css               # Tailwind + estilos globais
```

---

## Como rodar

### Pré-requisitos

- **Node.js 18+** (`node --version`)
- Backend rodando em **http://localhost:8080**

### Setup

```bash
npm install
npm run dev
```

Abre em **http://localhost:5173**.

### Build de produção

```bash
npm run build
npm run preview   # serve o build localmente pra testar
```

Os arquivos otimizados ficam em `dist/`.

---

## Rotas

| Rota | Quem acessa | Componente |
|---|---|---|
| `/login` | público | `LoginPage` |
| `/` | autenticado | `DashboardPage` |
| `/schedules` | autenticado | `SchedulesPage` |
| `/users` | autenticado | `UsersPage` (tabs: Clientes / Funcionários) |
| `/services` | autenticado | `ServicesPage` |

Rotas autenticadas são protegidas por `<ProtectedRoute>`. Se token expira ou está ausente, redireciona pra `/login`.

---

## Autenticação

- Login retorna JWT que vai pro `localStorage`
- Axios interceptor anexa `Authorization: Bearer <token>` em toda request
- Resposta `401` em qualquer endpoint dispara logout automático

Cliente não loga — apenas funcionários (ADM/BARBER) têm acesso ao painel.

---

## Configuração de API

Em desenvolvimento, o Vite faz proxy de `/api/*` → `http://localhost:8080` (config em `vite.config.ts`).

Em produção, ajuste o `baseURL` em `src/api/client.ts` ou use uma variável de ambiente `VITE_API_URL`.

---

## Design

- **Tema dark** com acento vermelho (`brand` color no Tailwind config)
- **Sidebar fixa** com navegação por ícones
- **Toasts** no canto superior direito pra feedback de ações
- **Modais** centralizados com backdrop blur
- **Status badges** coloridos pra agendamentos (pendente/confirmado/concluído/cancelado)
- **Loading skeletons** durante fetch
- **Empty states** ilustrados com ícone

---

## Licença

Projeto pessoal. Use à vontade.
