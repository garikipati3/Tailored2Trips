# Core REST API

> All endpoints are prefixed with `/api`. JSON responses include `error` on failure.

## Auth
- **POST** `/api/auth/register` → `{ email, password, fullName }` → `{ userId, role, accessToken, refreshToken }`  
- **POST** `/api/auth/login` → `{ email, password }` → `{ accessToken, refreshToken, role }`  
- **POST** `/api/auth/refresh` → `{ refreshToken }` → `{ accessToken }`  
- **POST** `/api/auth/logout` → clears refresh token (server-side revoke if used).

## Users (Admin)
- **GET** `/api/users` *(Admin)* → list users  
- **PATCH** `/api/users/:id/role` *(Admin)* → `{ role }`

## Trips
- **GET** `/api/trips?visibility=public|mine` *(Guest+)*  
- **POST** `/api/trips` *(Registered)* → create trip  
- **GET** `/api/trips/:id` *(Member or public)*  
- **PATCH** `/api/trips/:id` *(Owner/Editor)*  
- **DELETE** `/api/trips/:id` *(Owner/Admin)*

## Trip Members
- **POST** `/api/trips/:id/members` *(Owner)* → invite/assign role `{ userId, role:'editor|viewer' }`  
- **DELETE** `/api/trips/:id/members/:userId` *(Owner/Admin)*

## Itinerary
- **GET** `/api/trips/:id/itinerary` *(Member or public)*  
- **POST** `/api/trips/:id/days` *(Editor+)* → `{ date | dayNumber }`  
- **POST** `/api/days/:dayId/items` *(Editor+)* → `{ type, title, start_time, end_time, place_id, est_cost_cents }`

## Places & Bookings
- **POST** `/api/places/search` *(Registered)* → `{ query, city }`  
- **POST** `/api/items/:itemId/booking` *(Editor+)* → `{ provider, price_cents, currency }`

### Conventions
- **Auth:** `Authorization: Bearer <accessToken>` on protected routes.  
- **Pagination:** `?page=&limit=20` (JSON: `{data, page, total}`)  
- **Errors:** HTTP status with `{ error: { code, message, details? } }`
