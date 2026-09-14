# CampusPay — Administration & School Dashboard

A dedicated, isolated administrative and institutional management frontend for CampusPay.

## Core Features
1. **Platform Administrator Portal (`/dashboard/admin`)**:
   - Executive liquidity and volume overview (`GET /analytics/system/dashboard`)
   - Complete university management: add, edit, delete, and view accredited schools (`GET/POST/PUT/DELETE /School`)
   - Staff administration: create and revoke school administrators (`POST /Admin/Create-SchoolAdmin`, `DELETE /Admin/delete/{id}`)
   - Wallet audit: lookup wallet balances and toggle freeze/lock state (`POST /Wallet/Search/WalletNumber`, `POST /Wallet/lockOrUnlock`)
   - Global transaction ledger with status/type filtering and slide-over drawers (`GET /Transaction/history`)
   - Financial statement generation with custom date range and amount filters (`GET /Wallet/Statement`)
   - Infrastructure telemetry and CBN bank directory (`GET /Admin/banks`)

2. **School Administrator Portal (`/dashboard/school`)**:
   - Institutional dashboard with campus-level metrics (`GET /analytics/school/dashboard`)
   - Student directory: enrolled students mapped by matriculation numbers and wallets (`GET /SchoolAdmin/students`)
   - Merchant compliance: review, verify, approve, and reject campus businesses (`GET /SchoolAdmin/merchants`, `POST /SchoolAdmin/ApproveMerchant`, `POST /SchoolAdmin/RejectMerchant`)
   - Add campus staff members (`POST /SchoolAdmin/Create-SchoolAdmin`)
   - Institutional wallet treasury: view live reserve and ledger settlement balance (`GET /Wallet/Wallet`)
   - Campus transaction log (`GET /Transaction/history`)
   - Institutional financial statements and print-ready reports (`GET /Wallet/Statement`)
   - Profile and password management (`POST /Account/change_password`)

## Strict Isolation Guarantee
- **Protected Wallet Surface**: The existing digital wallet user frontend (`src/App.tsx`, `src/lib/api.ts`, student and merchant views) is completely untouched and continues to run independently on `/` and `/app/*`.
- **Session Separation**: Dashboard authentication tokens are stored in `cp_dash_token` and `cp_dash_user`, avoiding any collision with the wallet's `cp-token`.

## Environment Variables
The dashboard is pre-configured to communicate with the live production backend on Render. You can customize the backend URL via `.env`:

```bash
# Target backend API base URL (Default: https://campus-pay-na3y.onrender.com)
VITE_API_BASE_URL=https://campus-pay-na3y.onrender.com
```

## Running the Application

### Development Mode
```bash
npm run dev
```

- Wallet App: `http://localhost:5173/`
- Platform Admin Login: `http://localhost:5173/dashboard/admin/login`
- School Admin Login: `http://localhost:5173/dashboard/school/login`

### Production Build
```bash
npm run build
```

The build compiles both the existing wallet and the new dashboard into the `dist/` directory with zero errors.

## Documentation References
- [API Integration Map](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/API_MAP.md)
- [Stitch Design Implementation](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/STITCH_IMPLEMENTATION.md)
- [OpenAPI Swagger Spec](https://campus-pay-na3y.onrender.com/swagger/index.html)
