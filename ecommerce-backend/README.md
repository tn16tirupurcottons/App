# TN16 Tirupur Cotton – Backend

Express + Sequelize + PostgreSQL API that powers the storefront, including product catalog, carts, orders, admin CRUD and Stripe checkout.

## Setup

```bash
cd ecommerce-backend
npm install
cp env.example .env    # add Postgres + JWT + Stripe secrets
npm run dev
```

### Environment variables

| key | purpose |
| --- | --- |
| `PG_*` | Postgres connection info |
| `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` | HMAC secrets for tokens |
| `STRIPE_SECRET_KEY` | Stripe test secret |
| `CLIENT_URL` | Allowed CORS/redirect origin |

## Available scripts

- `npm run dev` – nodemon with live reload
- `npm start` – production server
- `npm run test` – Vitest unit tests for helpers

## Database

Sequelize models live under `models/`. On boot, `syncDB()` auto-syncs tables. You can seed demo data via `node scripts/seedProducts.js`.

