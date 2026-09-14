# Google Stitch Design → Code Implementation Mapping

This document maps the visual design elements and user flows from the [Google Stitch Project (3169918157371306198)](https://stitch.withgoogle.com/projects/3169918157371306198?pli=1) to the concrete React components, routes, API services, and live Swagger endpoints in CampusPay.

---

## Visual Design System Translations

| Design Token / Element | Stitch Specification | Dashboard Implementation |
|---|---|---|
| **Primary Color** | Deep Forest Green (`#102b29`, `#123b36`, `#1a4441`) | Background of Sidebar, active brand pills, header badges |
| **Accent / Highlight** | Mint / Electric Lime (`#dfffbb`, `#22c55e`, `#10b981`) | Primary action buttons, positive trends, active nav item indicators |
| **Neutral Canvas** | Soft Slate & Crisp White (`#f8fafc`, `#ffffff`, `#f1f5f9`) | Page backgrounds, card containers, table headers |
| **Typography** | Modern geometric sans for headers + clean body typeface | Google Fonts `Manrope` (Headings, KPIs) + `DM Sans` (UI labels, body) |
| **Status Badges** | Soft tinted rounded pills with matching icons | `StatusBadge.tsx`: Emerald for Successful, Amber for Pending, Rose for Failed, Purple for Reversed, Red for Locked |
| **Navigation Shell** | Fixed Left Sidebar with role badges + Sticky Topbar | `Sidebar.tsx` (collapsible on mobile) + `Topbar.tsx` + `DashboardLayout.tsx` |
| **Detail Views** | Slide-over right drawer with backdrop blur and ESC dismiss | `DetailDrawer.tsx`: Full attribute audit without navigating away |
| **Destructive Actions** | Focused confirmation modal with explicit warnings | `Modal.tsx`: Approve / Reject Merchant, Delete School, Lock/Unlock Wallet |
| **Data Tables** | Responsive, paginated, sortable, with inline search | `DataTable.tsx`: Auto-truncation, responsive horizontal scrolling, column sorting |

---

## Screen-to-Code Mapping Flow

### 1. Platform Admin Sign In
- **Stitch Screen**: Admin Authentication & Security Clearance
- **Dashboard Route**: `/dashboard/admin/login`
- **React Component**: [`AdminLogin.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/auth/AdminLogin.tsx)
- **API Service**: `authApi.adminLogin(payload)`
- **Swagger Endpoint**: `POST /api/v1.0/Admin/login`

---

### 2. School Administrator Sign In
- **Stitch Screen**: Institutional Access & Campus Clearance
- **Dashboard Route**: `/dashboard/school/login`
- **React Component**: [`SchoolLogin.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/auth/SchoolLogin.tsx)
- **API Service**: `authApi.schoolAdminLogin(payload)`
- **Swagger Endpoint**: `POST /api/v1.0/SchoolAdmin/login`

---

### 3. Platform Admin Overview
- **Stitch Screen**: Ecosystem Executive Dashboard & System Liquidity
- **Dashboard Route**: `/dashboard/admin`
- **React Component**: [`AdminDashboard.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/admin/AdminDashboard.tsx)
- **API Service**: `analyticsApi.getSystemDashboard()`, `schoolApi.getAllSchools()`, `transactionApi.getTransactionHistory()`
- **Swagger Endpoint**: `GET /api/v1.0/analytics/system/dashboard`, `GET /api/v1.0/School`, `GET /api/v1.0/Transaction/history`

---

### 4. Institution Directory & Management
- **Stitch Screen**: Partner Universities & Campus Code Management
- **Dashboard Route**: `/dashboard/admin/schools`
- **React Component**: [`SchoolsPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/admin/SchoolsPage.tsx)
- **API Service**: `schoolApi.getAllSchools()`, `schoolApi.createSchool()`, `schoolApi.updateSchool()`, `schoolApi.deleteSchool()`
- **Swagger Endpoint**: `GET /api/v1.0/School`, `POST /api/v1.0/School/Add`, `PUT /api/v1.0/School/Update/{schoolId}`, `DELETE /api/v1.0/School/Delete/{schoolId}`

---

### 5. Staff & Campus Officers Management
- **Stitch Screen**: Administrative Team Directory & Privilege Provisioning
- **Dashboard Route**: `/dashboard/admin/users`
- **React Component**: [`UsersPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/admin/UsersPage.tsx)
- **API Service**: `schoolApi.getSchoolUsers()`, `adminApi.createSchoolAdmin()`, `adminApi.deleteAdmin()`
- **Swagger Endpoint**: `GET /api/v1.0/School/Users`, `POST /api/v1.0/Admin/Create-SchoolAdmin`, `DELETE /api/v1.0/Admin/delete/{id}`

---

### 6. Wallet Audit & Operations
- **Stitch Screen**: Account Security, Ledger Lookup & Restriction Toggles
- **Dashboard Route**: `/dashboard/admin/wallets`
- **React Component**: [`WalletsPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/admin/WalletsPage.tsx)
- **API Service**: `walletApi.searchWalletNumber()`, `walletApi.lockOrUnlockWallet()`, `walletApi.getWallet()`
- **Swagger Endpoint**: `POST /api/v1.0/Wallet/Search/WalletNumber`, `POST /api/v1.0/Wallet/lockOrUnlock`, `GET /api/v1.0/Wallet/Wallet`

---

### 7. Ecosystem Transactions
- **Stitch Screen**: Money In / Money Out Transaction Ledger
- **Dashboard Route**: `/dashboard/admin/transactions`
- **React Component**: [`TransactionsPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/admin/TransactionsPage.tsx)
- **API Service**: `transactionApi.getTransactionHistory()`
- **Swagger Endpoint**: `GET /api/v1.0/Transaction/history`

---

### 8. Financial Statements & Ledger Reports
- **Stitch Screen**: Regulatory Statement Generator & Settlement Filter
- **Dashboard Route**: `/dashboard/admin/reports`
- **React Component**: [`ReportsPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/admin/ReportsPage.tsx)
- **API Service**: `transactionApi.getWalletStatement(query)`
- **Swagger Endpoint**: `GET /api/v1.0/Wallet/Statement`

---

### 9. Infrastructure Health & Settlement Banks
- **Stitch Screen**: Connected Clearing Banks & Host Telemetry
- **Dashboard Route**: `/dashboard/admin/system`
- **React Component**: [`SystemPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/admin/SystemPage.tsx)
- **API Service**: `adminApi.getBanks()`
- **Swagger Endpoint**: `GET /api/v1.0/Admin/banks`

---

### 10. School Administrator Overview
- **Stitch Screen**: Campus Operational Hub & Action Center
- **Dashboard Route**: `/dashboard/school`
- **React Component**: [`SchoolDashboard.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/school/SchoolDashboard.tsx)
- **API Service**: `analyticsApi.getSchoolDashboard()`, `schoolAdminApi.getStudents()`, `schoolAdminApi.getMerchants()`
- **Swagger Endpoint**: `GET /api/v1.0/analytics/school/dashboard`, `GET /api/v1.0/SchoolAdmin/students`, `GET /api/v1.0/SchoolAdmin/merchants`

---

### 11. Campus Students Directory
- **Stitch Screen**: Enrolled Students & Matriculation Mapping
- **Dashboard Route**: `/dashboard/school/students`
- **React Component**: [`StudentsPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/school/StudentsPage.tsx)
- **API Service**: `schoolAdminApi.getStudents()`
- **Swagger Endpoint**: `GET /api/v1.0/SchoolAdmin/students`

---

### 12. Campus Merchant Verification & Approval
- **Stitch Screen**: Merchant Onboarding Review & Compliance Actions
- **Dashboard Route**: `/dashboard/school/merchants`
- **React Component**: [`MerchantsPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/school/MerchantsPage.tsx)
- **API Service**: `schoolAdminApi.getMerchants()`, `schoolAdminApi.approveMerchant()`, `schoolAdminApi.rejectMerchant()`
- **Swagger Endpoint**: `GET /api/v1.0/SchoolAdmin/merchants`, `POST /api/v1.0/SchoolAdmin/ApproveMerchant`, `POST /api/v1.0/SchoolAdmin/RejectMerchant`

---

### 13. Institutional Wallet Position
- **Stitch Screen**: School Treasury, Inflows, and Disbursal Records
- **Dashboard Route**: `/dashboard/school/wallets`
- **React Component**: [`SchoolWalletPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/school/SchoolWalletPage.tsx)
- **API Service**: `walletApi.getWallet()`, `transactionApi.getWalletTransactions()`
- **Swagger Endpoint**: `GET /api/v1.0/Wallet/Wallet`, `GET /api/v1.0/Wallet/Transactions`

---

### 14. Institutional Security & Profile
- **Stitch Screen**: Account Credentials & Security
- **Dashboard Route**: `/dashboard/school/settings`
- **React Component**: [`SchoolSettingsPage.tsx`](file:///c:/Users/DELL/Downloads/wallet_frontend/src/dashboard/school/SchoolSettingsPage.tsx)
- **API Service**: `authApi.changePassword()`
- **Swagger Endpoint**: `POST /api/v1.0/Account/change_password`
