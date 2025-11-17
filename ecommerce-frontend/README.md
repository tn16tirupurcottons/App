# TN16 Tirupur Cotton – Frontend

Vite + React + Tailwind storefront inspired by LimeRoad, featuring hero banners, curated decor grid, product discovery and secure checkout that talks to the Node/Express API.

## Getting Started

```bash
cd ecommerce-frontend
npm install
cp env.example .env    # fill API + Stripe keys
npm run dev
```

Key scripts:

- `npm run dev` – local dev with Vite
- `npm run build` – production bundle
- `npm run preview` – preview build locally
- `npm run lint` – ESLint + React rules
- `npm run test` – Vitest + Testing Library smoke tests

The app expects `VITE_API_BASE_URL` (default `http://localhost:5000/api`) and `VITE_STRIPE_PUBLIC_KEY` for checkout. Update `src/api/axiosClient.js` if you deploy the backend to a different domain.
