# Tailored2Trips — System Architecture & API Design

**Team:** Dhyani Patel · Rohith Reddy Tripuravaram · Dinakara Sai Garikipati  
**Architecture Style:** 3‑tier SPA (React) → REST API (Node/Express) → PostgreSQL  
**Goal:** Technical blueprint that links UI, API, DB, auth, and third‑party services before coding.

---

## 1) System Architecture Overview

### Responsibilities
- **Front‑end (React SPA):** Routing, forms, token storage (access token only), API calls via Axios, interactive maps.
- **Back‑end (Node.js/Express):** Auth (JWT + optional Google OAuth), role checks (RBAC middleware), input validation, business logic, integration with external APIs.
- **Database (PostgreSQL):** Users, roles, trips, itinerary days/items, places, bookings, reviews; indices for lookups.
- **Third‑Party APIs:** Google Maps (Places/Geocoding), OpenWeather, Stripe (optional), Google OAuth.

### System Architecture Diagram (Mermaid)
> This GitHub‑renders directly.

```mermaid
flowchart LR
  subgraph Client[Front-end (React SPA)]
    A[Pages/Components]
    B[Auth Context]
    C[Axios Fetch]
  end

  subgraph API[Node.js / Express API]
    M[Controllers]
    N[Auth & RBAC Middleware]
    O[Services]
    P[Validation (Zod/Joi)]
  end

  subgraph DB[(PostgreSQL)]
    U[(users, roles)]
    V[(trips, trip_members)]
    W[(itinerary_day, item, place, booking)]
  end

  subgraph ThirdParty[3rd‑Party Providers]
    G[Google Maps/Places]
    Wthr[OpenWeather]
    Pay[Stripe]
    OA[Google OAuth]
  end

  A-->C-->API
  B-->API
  API-->DB
  API--calls-->ThirdParty
```

---

## 2) Technology Stack

- **Front‑end:** React 18, React Router, Axios, (State: Context or Redux Toolkit), Map SDK (Google Maps JS).
- **Back‑end:** Node 20, Express, Zod or Joi validation, jsonwebtoken, bcrypt, multer (uploads).
- **Database:** PostgreSQL 15 (pg/Prisma/Knex — choose one; examples assume Prisma).
- **Auth:** JWT (access+refresh), Passport.js (google-oauth20) optional.
- **Ops:** Docker, GitHub Actions CI, Render/Heroku/AWS for deployment, Jest + Supertest for API tests.

---

## 3) Authentication & RBAC

### Roles
- **Admin** — manage users/roles, moderate content, full audit.
- **Registered** — create/join trips, create itinerary, write reviews.
- **Guest** — browse public content, register, login.

### Permissions (high‑level)
| Action | Guest | Registered | Admin |
|---|---:|---:|---:|
| View public trips | ✅ | ✅ | ✅ |
| Create trip | ❌ | ✅ | ✅ |
| Edit/delete own trip | ❌ | ✅ (owner/editor) | ✅ |
| Invite member to trip | ❌ | ✅ (owner) | ✅ |
| Manage users/roles | ❌ | ❌ | ✅ |

**Enforcement:** `authenticateJWT` → `requireRole([...])` and resource‑level checks (e.g., owner/editor via `trip_members`).  
**Session:** Access token (short TTL) + refresh token rotation. Tokens in HTTP‑only cookies or Authorization header.

---

## 4) UML & Architecture Diagrams

- **Use Case:** see `docs/diagrams/use_case.md`  
- **Sequence:** see `docs/diagrams/sequence.md`  
- **System Architecture:** above (Mermaid)

---

## 5) Core REST API (excerpt)

| Method | Path | Role | Request (JSON) | Response (JSON) |
|---|---|---|---|---|
| POST | /api/auth/register | Guest | { email, password, fullName } | { userId, role, accessToken, refreshToken } |
| POST | /api/auth/login | Guest | { email, password } | { accessToken, refreshToken, role } |
| POST | /api/auth/refresh | Guest | { refreshToken } | { accessToken } |
| GET | /api/users | Admin | — | [{ id, email, role }] |
| GET | /api/trips | Guest+ | ?visibility=public|mine | [{ tripId, title, ownerId, visibility }] |
| POST | /api/trips | Registered | { title, startDate, endDate, originCity, destinationCity, visibility } | { tripId, ... } |
| PATCH | /api/trips/:id | Owner/Editor | { ...fields } | { ...updated } |
| POST | /api/trips/:id/members | Owner | { userId, role } | { tripId, userId, role } |
| GET | /api/trips/:id/itinerary | Member or public | — | [{ dayNumber, items: [...] }] |
| POST | /api/places/search | Registered | { query, city } | [{ placeId, name, lat, lng }] |

**Errors:** JSON `{ error: { code, message, details? } }` with proper HTTP status.  
**Pagination:** `?page=&limit=`; **Filtering:** query params; **Sorting:** `?sort=-startDate`.

---

## 6) Security & Performance

**Security**
1. Password hashing with **bcrypt**; lockout & rate limiting on auth.  
2. **Input validation** (Zod/Joi) + centralized error handler; parameterized queries to prevent SQLi.  
3. **JWT best practices:** short‑lived access tokens, refresh rotation, token revocation list; CORS allow‑list; `helmet` for headers; HTTPS everywhere.

**Performance**
1. **DB indexes** on `users.email`, `trips.owner_id`, `trip_members.trip_id,user_id`, `itinerary_item.day_id`.  
2. **Pagination & caching** (HTTP cache + in‑memory/Redis for hot lists).

---

## 7) Implementation Plan & Ownership

- **Frontend:** auth views, protected routes, trip CRUD, itinerary editor with map.
- **Backend:** auth/authz controllers, RBAC middleware, trips/itinerary endpoints, 3rd‑party clients.
- **DB:** Prisma schema/migrations based on ERD; seed scripts.
- **Testing:** Jest + Supertest; Postman collection.

---

## 8) Team & Collaboration

- **Teammates:**  
  - Dhyani Patel — Frontend owner, diagrams lead (sequence/architecture)  
  - Rohith Reddy Tripuravaram — Backend owner (auth, RBAC, trips API)  
  - Dinakara Sai Garikipati — DB owner (schema, migrations, performance)

See `docs/contributions_plan.md` for division of work and suggested commit messages.
