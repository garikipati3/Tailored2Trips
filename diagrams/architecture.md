# System Architecture (Mermaid)

```mermaid
flowchart TB
  User[Browser / Mobile Web] --> React[React SPA]
  React -->|HTTPS JSON (Axios)| ExpressAPI[Node.js Express API]
  ExpressAPI -->|Prisma/pg| Postgres[(PostgreSQL)]
  ExpressAPI -->|OAuth flow| Google[Google OAuth]
  ExpressAPI -->|Maps/Places| GMaps[Google Maps API]
  ExpressAPI -->|Weather| OpenWeather[OpenWeather API]
  ExpressAPI -->|Payments| Stripe[Stripe API]
  subgraph Security
    JWT[JWT Access/Refresh]
    Helmet[Helmet + Rate Limit]
  end
  ExpressAPI --> Security
```
