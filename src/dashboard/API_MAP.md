# CampusPay Dashboard — API Integration Map

This document details the exact Swagger / OpenAPI contract mapping implemented in the CampusPay Administration and School Management Dashboard. Every endpoint listed below exists in the live backend specification at [https://campus-pay-na3y.onrender.com/swagger/v1/swagger.json](https://campus-pay-na3y.onrender.com/swagger/v1/swagger.json).

---

## Central API Configuration
- **Base URL Variable**: `VITE_API_BASE_URL` (Defaults to `https://campus-pay-na3y.onrender.com`)
- **API Version Route**: `/api/v1.0`
- **Central Client**: `src/dashboard/api/client.ts`
- **Session Header**: `Authorization: Bearer <token>`
- **Token Key**: `sessionStorage.getItem('cp_dash_token')`

---

## Complete API Feature Mapping Table

| Feature | HTTP Method & Endpoint | Auth Required | Request Payload / Params | Response Schema | Frontend Service | Dashboard Screen |
|---|---|---|---|---|---|---|
| **Admin Sign In** | `POST /api/v1.0/Admin/login` | No | `AdminLoginRequestDto`:<br>`{ email: string, password: string }` | `{ token: string, firstname?: string, lastname?: string, ... }` | `authApi.adminLogin()` | Admin Login (`/dashboard/admin/login`) |
| **School Admin Sign In** | `POST /api/v1.0/SchoolAdmin/login` | No | `AdminLoginRequestDto`:<br>`{ email: string, password: string }` | `{ token: string, schoolCode?: string, ... }` | `authApi.schoolAdminLogin()` | School Login (`/dashboard/school/login`) |
| **Admin Profile** | `GET /api/v1.0/Admin/profile` | Yes (Admin) | None | `{ id, email, firstname, lastname, role, walletNumber }` | `authApi.getAdminProfile()` | Topbar & Admin Layout |
| **School Admin Profile** | `GET /api/v1.0/SchoolAdmin/profile` | Yes (SchoolAdmin) | None | `{ id, email, firstname, lastname, schoolCode, schoolName }` | `authApi.getSchoolAdminProfile()` | Topbar & School Layout |
| **Change Password** | `POST /api/v1.0/Account/change_password` | Yes | `ChangePasswordDto`:<br>`{ currentPassword: string, newPassword: string }` | Status 200 OK | `authApi.changePassword()` | School Settings (`/dashboard/school/settings`) |
| **Logout** | `POST /api/v1.0/Account/logout` | Yes | None | Status 200 OK | `authApi.logout()` | Topbar / Sidebar Profile Actions |
| **System Dashboard Analytics** | `GET /api/v1.0/analytics/system/dashboard` | Yes (Admin) | None | `SystemDashboardDto` (KPIs, volume, counts) | `analyticsApi.getSystemDashboard()` | Platform Overview (`/dashboard/admin`) |
| **School Dashboard Analytics** | `GET /api/v1.0/analytics/school/dashboard` | Yes (SchoolAdmin) | None | `SchoolDashboardDto` (School balance, counts, pending) | `analyticsApi.getSchoolDashboard()` | School Overview (`/dashboard/school`) |
| **List Partner Institutions** | `GET /api/v1.0/School` | Yes | None | `SchoolDto[]` (`id`, `name`, `code`) | `schoolApi.getAllSchools()` | Schools Page (`/dashboard/admin/schools`) |
| **Register Institution** | `POST /api/v1.0/School/Add` | Yes (Admin) | `SchoolRequestDto`:<br>`{ name: string, code: string }` | `SchoolDto` | `schoolApi.createSchool()` | Add School Modal (`/dashboard/admin/schools`) |
| **Update Institution** | `PUT /api/v1.0/School/Update/{schoolId}` | Yes (Admin) | Path: `schoolId`<br>Body: `SchoolUpdateDto` (`{ name: string }`) | `SchoolDto` | `schoolApi.updateSchool()` | Edit School Modal (`/dashboard/admin/schools`) |
| **Delete Institution** | `DELETE /api/v1.0/School/Delete/{schoolId}` | Yes (Admin) | Path: `schoolId: uuid` | Status 200 OK | `schoolApi.deleteSchool()` | Delete School Modal (`/dashboard/admin/schools`) |
| **Get Institution Users** | `GET /api/v1.0/School/Users` | Yes | None | `SchoolUserDto[]` | `schoolApi.getSchoolUsers()` | Staff Directory (`/dashboard/admin/users`, `/dashboard/school/users`) |
| **Create School Admin (Platform)** | `POST /api/v1.0/Admin/Create-SchoolAdmin` | Yes (Admin) | `CreateSchoolAdminDto`:<br>`{ firstname?, lastname, email, schoolCode, password }` | Status 200 OK | `adminApi.createSchoolAdmin()` | Create School Admin Modal (`/dashboard/admin/users`) |
| **Revoke / Delete Staff** | `DELETE /api/v1.0/Admin/delete/{id}` | Yes (Admin) | Path: `id: string` | Status 200 OK | `adminApi.deleteAdmin()` | Delete Staff Modal (`/dashboard/admin/users`) |
| **Create School Admin (Campus)** | `POST /api/v1.0/SchoolAdmin/Create-SchoolAdmin` | Yes (SchoolAdmin) | `CreateSchoolAdminDto`:<br>`{ firstname?, lastname, email, schoolCode, password }` | Status 200 OK | `schoolAdminApi.createSchoolAdmin()` | Add Staff Modal (`/dashboard/school/users`) |
| **List Campus Merchants** | `GET /api/v1.0/SchoolAdmin/merchants` | Yes (SchoolAdmin) | None | `MerchantDto[]` | `schoolAdminApi.getMerchants()` | Merchants Page (`/dashboard/school/merchants`) |
| **Approve Campus Merchant** | `POST /api/v1.0/SchoolAdmin/ApproveMerchant` | Yes (SchoolAdmin) | Query: `merchantId: string` | Status 200 OK | `schoolAdminApi.approveMerchant()` | Merchant Action (`/dashboard/school/merchants`) |
| **Reject Campus Merchant** | `POST /api/v1.0/SchoolAdmin/RejectMerchant` | Yes (SchoolAdmin) | Query: `merchantId: string` | Status 200 OK | `schoolAdminApi.rejectMerchant()` | Merchant Action (`/dashboard/school/merchants`) |
| **List Campus Students** | `GET /api/v1.0/SchoolAdmin/students` | Yes (SchoolAdmin) | None | `StudentDto[]` | `schoolAdminApi.getStudents()` | Students Page (`/dashboard/school/students`) |
| **Disbursement Banks (Admin)** | `GET /api/v1.0/Admin/banks` | Yes (Admin) | None | `BankDto[]` | `adminApi.getBanks()` | System Page (`/dashboard/admin/system`) |
| **Disbursement Banks (School)** | `GET /api/v1.0/SchoolAdmin/banks` | Yes (SchoolAdmin) | None | `BankDto[]` | `schoolAdminApi.getBanks()` | School Settings / Banks |
| **Platform Transaction History** | `GET /api/v1.0/Transaction/history` | Yes | None | `TransactionDto[]` | `transactionApi.getTransactionHistory()` | Transactions Page (`/dashboard/admin/transactions`, `/dashboard/school/transactions`) |
| **Wallet Transaction Activity** | `GET /api/v1.0/Wallet/Transactions` | Yes | None | `TransactionDto[]` | `transactionApi.getWalletTransactions()` | School Wallet (`/dashboard/school/wallets`) |
| **Financial Ledger Statement** | `GET /api/v1.0/Wallet/Statement` | Yes | Query: `PageNumber`, `PageSize`, `StartDate`, `EndDate`, `Type`, `Status`, `MinAmount`, `MaxAmount`, `Search` | Paginated Statement | `transactionApi.getWalletStatement()` | Reports Page (`/dashboard/admin/reports`, `/dashboard/school/reports`) |
| **Institutional Wallet Reserve** | `GET /api/v1.0/Wallet/Wallet` | Yes | None | `WalletDto` | `walletApi.getWallet()` | School Wallet (`/dashboard/school/wallets`) |
| **Search Wallet by Number** | `POST /api/v1.0/Wallet/Search/WalletNumber` | Yes | Body: `{ walletNumber: string }` | `WalletDto` | `walletApi.searchWalletNumber()` | Wallet Operations (`/dashboard/admin/wallets`) |
| **Lock / Unlock Wallet** | `POST /api/v1.0/Wallet/lockOrUnlock` | Yes | Body: `{ walletNumber: string }` | Status 200 OK | `walletApi.lockOrUnlockWallet()` | Wallet Operations (`/dashboard/admin/wallets`) |

---

## Authentication & Authorization Guarantees
1. No simulated or mock data: If an endpoint returns an empty array `[]`, the UI displays a clean empty state rather than decorative mock rows.
2. If credentials are invalid, the backend's explicit 401 response is rendered directly to the user.
3. Sessions between the existing student/merchant wallet (`sessionStorage.getItem('cp-token')`) and the dashboard (`sessionStorage.getItem('cp_dash_token')`) are isolated to prevent cross-contamination.
