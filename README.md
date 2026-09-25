# Superbdeal Corp — Operations

Calm, role-scoped desktop workstation for the Quezon City tire hub.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Design

- Neutral surface + soft blue accent
- Low visual noise for long shifts
- Role switcher kept for demo (each role only sees its modules)
- Shared `PageHeader` + CSS tokens in `src/index.css`

## Roles

| Role | Home | Access |
|------|------|--------|
| Counter | Sales | Counter + stock lookup |
| Warehouse | Inventory | Inventory + bays |
| Manager | Inventory | Most modules + payments |
| Admin | Payments | All |

## Stack

React 19 · TypeScript · Vite · Tailwind 4 · Zustand · React Router 7
