# Authentication & RBAC

## Tokens
- **Access token:** short TTL (e.g., 15m)
- **Refresh token:** long TTL (e.g., 7d) with rotation; store in HTTP‑only cookie or secure storage; maintain revoke list.

## Middleware (Express)
```ts
// authenticateJWT.ts
export function authenticateJWT(req, res, next) { /* verify access token, set req.user */ }

// requireRole.ts
export function requireRole(roles: string[]) {
  return (req,res,next) => roles.includes(req.user.role) ? next() : res.status(403).json({error:{code:'FORBIDDEN'}});
}

// resource check example
export async function requireTripRole(roles: string[]) { /* ensure user is owner/editor for trip */ }
```
## Roles & Permissions
- **Admin:** manage users/roles, delete any trip, audit logs.
- **Registered:** create trips, edit own trips, invite members, review places.
- **Guest:** browse public content, register/login.
