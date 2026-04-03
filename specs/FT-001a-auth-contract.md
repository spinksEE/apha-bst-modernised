# FT-001a: Auth Contract Decisions (POC)

## Purpose

Document the agreed authentication and session contract for FT-001a so backend and frontend align on credential validation, token shape, authorization outcomes, and logging requirements.

## Decision Summary

### 1) Credential source and verification

- **Source:** `user` table in the BST database (POC).
- **Fields required:**
  - `user.user_name` (unique, case-insensitive)
  - `user.password_hash` (bcrypt; no plaintext storage)
  - `user.is_active` (boolean)
  - `user.role` (enum)
  - `user.location_id` (FK to `apha_location`)
- **Verification:**
  - Normalize username to lowercase, match on `user_name`.
  - Compare password using bcrypt against `password_hash`.
  - If user exists but `is_active=false`, treat as **unauthorized** (not invalid credentials).

### 2) Authentication vs authorization outcomes

- **Authentication failure:** invalid username/password.
  - API response: `401` with `{ message: "Invalid username or password" }`.
- **Authorization failure:** authenticated but not permitted (inactive, missing role, missing location).
  - API response: `403` with `{ message: "Access denied", referenceId }`.

### 3) JWT token shape

- **Algorithm:** HS256.
- **Expiry:** 8 hours (business day window).
- **Claims:**
  - `sub`: user ID
  - `name`: display name
  - `role`: `Supervisor` | `DataEntry` | `ReadOnly` | `SystemAdministrator`
  - `locationId`: location FK
  - `locationName`: denormalized for UI convenience (optional)
  - `sessionId`: UUID for audit correlation
  - `iat`, `exp`, `iss`, `aud`

### 4) Session model

- **POC model:** JWT is the session token (no server-side session store).
- **Session lifecycle logging:** use `sessionId` to correlate login/logout/timeout events.
- **Last activity:** update `user.last_activity_at` (or later session table) per authenticated request via guard/interceptor.

### 5) API endpoints (contract)

- `POST /api/auth/login`
  - Body: `{ username: string, password: string }`
  - `200`: `{ accessToken, userContext }`
  - `401`: `{ message: "Invalid username or password" }`
  - `403`: `{ message: "Access denied", referenceId }`
- `POST /api/auth/logout`
  - Requires auth.
  - `204` no content. Logs session end.
- `GET /api/auth/session`
  - Requires auth.
  - `200`: `{ userContext }` derived from token.

### 6) Audit logging requirements

- Log **all** auth attempts and access denials.
- Event types:
  - `AUTH_LOGIN_SUCCESS`
  - `AUTH_LOGIN_FAILURE`
  - `AUTH_LOGOUT`
  - `ACCESS_DENIED`
  - `SESSION_TIMEOUT` (optional)
- Fields: `userId`, `timestamp`, `ipAddress`, `sessionId`, `eventType`, `details`, `severity`.
- **NFR-007:** access denial must be logged within 2 seconds (log synchronously on deny).

### 7) Environment/config

Use `ConfigModule` for all configuration.

Required env vars:
- `JWT_SECRET`
- `JWT_ISSUER`
- `JWT_AUDIENCE`
- `JWT_EXPIRES_IN` (default `8h`)
- `BCRYPT_SALT_ROUNDS` (default `12`)

Optional env vars:
- `AUTH_COOKIE_NAME` (if moving to cookies)
- `AUTH_TOKEN_HEADER` (default `Authorization`)

### 8) Frontend contract

- Store `accessToken` in memory + secure storage (POC: `localStorage` acceptable).
- Attach `Authorization: Bearer <token>` to all API calls.
- On `401`: redirect to login.
- On `403` with `referenceId`: show Access Denied page and render reference ID.

## Notes

- This is a POC contract; production would use enterprise SSO.
- Roles are defined in the FT-001a spec and will be centralized in `packages/shared`.
