# 🗺️ Tailored2Trips — Database Design Overview

## 👥 Team Members

- [Dhyani Patel](https://github.com/Dhyanipatel0526)  
- [Rohith Reddy Tripuravaram](https://github.com/Rohi0035)  
- [Dinakara Sai Garikipati](https://github.com/garikipati3)

---

### 📂 Folder Contents

- `database_design.sql` — PostgreSQL DDL for all core entities  
- `mermaid_erd.md` — Mermaid ER diagram (paste into GitHub or Mermaid Live)  
- `plantuml_class_diagram.puml` — Class diagram (PlantUML)  
- `plantuml_usecase.puml` — Use case diagram (PlantUML)

---

### 🧩 How to Render Diagrams

**PlantUML:**  
- Use the PlantUML VSCode extension or online server.  
- Command line:
  ```bash
  plantuml plantuml_class_diagram.puml
  plantuml plantuml_usecase.puml
  ```

**Mermaid:**  
- View directly in GitHub or open `mermaid_erd.md` in [Mermaid Live Editor](https://mermaid.live).

---

## 1️⃣ Feature → Data Mapping (Quick Reference)

| Feature                     | Key Tables                                                                 |
|-----------------------------|---------------------------------------------------------------------------|
| Personalized Itinerary       | `trip`, `itinerary_day`, `itinerary_item`, `place`, `booking`, `recommendation_log` |
| Interactive Map / Drag & Drop| `itinerary_day(day_number)`, `itinerary_item.sort_order`                   |
| Budget Optimization          | `trip.total_budget_cents`, `trip_budget_line`, `cost_category`              |
| Multi-API Integration        | `place.external_ref`, `itinerary_item.external_booking`, `booking.provider_ref` |
| Explainable Recommendations  | `itinerary_item.explainability`, `recommendation_log.explanations`         |
| Group Trip Planning          | `trip_member`, `trip_message`, `notification`                              |
| Voice/Chatbot (Future)       | `recommendation_log`                                                       |
| Reviews & Ratings            | `review`                                                                   |
| Profile Management           | `app_user`, `user_preferences`, `favorite`, `trip_history`                 |
| Security & Settings          | `user_security`, `user_session`, `app_user`, `user_preferences`            |
| Achievements & Badges        | `badge`, `user_badge`                                                      |

---

## 2️⃣ Key Entities & Constraints

### Core Entities
- **`app_user`** → PK `user_id`, UNIQUE `email`, `username`, `is_active` flag  
- **`user_security`** → 1:1 with user; 2FA, TOTP secret, backup code hashes  
- **`user_session`** → Tracks sessions (expires_at, ip_addr)  
- **`oauth_account`** → composite UNIQUE `(provider, provider_user_id)`  
- **`trip`** → Owned by `app_user`; includes visibility enum; optional `total_budget_cents`  
- **`trip_member`** → composite PK `(trip_id, user_id)`; `role` enum {owner, editor, viewer}  
- **`itinerary_day`** → UNIQUE `(trip_id, day_number)`  
- **`itinerary_item`** → `type` enum; optional `place_id`; includes `sort_order`, `explainability` JSON  
- **`booking`** → 1:1 with `itinerary_item`, `provider_ref` required  
- **`review`** → `rating` 1–5 CHECK; polymorphic via `(target_type, target_id)` composite index  
- **`favorite`** → composite PK `(user_id, target_type, target_id)`  
- **`notification`** → `unread/read` boolean, `payload` JSON  
- **`badge` / `user_badge`** → composite PK `(user_id, badge_code)`  
- **`recommendation_log`** → captures LLM prompts, outputs, explanations  
- **`audit_log`** → actor, action, target, details

---

## 3️⃣ ER Diagram (Mermaid)

> View the live diagram in `mermaid_erd.md`

---

## 4️⃣ Database Schema (SQL DDL)

All SQL definitions are included in `database_design.sql`, which includes:
- Enums: `trip_visibility`, `trip_role`, `item_type`  
- Indexes (geo, dates, foreign keys)  
- CHECK constraints and composite primary keys  
- Seed data for `cost_category`

---

## 5️⃣ UML Diagrams (PlantUML)

### Class Diagram (`plantuml_class_diagram.puml`)
Depicts:
- `AppUser`, `Trip`, `TripMember`, `ItineraryDay`, `ItineraryItem`, `Place`, `Booking`  
- Cardinalities and associations between them

### Use Case Diagram (`plantuml_usecase.puml`)
Actors:
- `Casual Traveler`, `Adventure/Budget Traveler`, `Business Traveler`, `Collaborator`

Includes:
- `Personalised Itinerary` ↔ `Integrations/Budget/Explainability`  
- `Group Planning` ↔ `Map Reorder`

---

## 🧰 Tools Used

- **Database:** PostgreSQL  
- **Diagramming:** Mermaid, PlantUML  
- **Version Control:** Git + GitHub  
- **Modeling Approach:** Normalised schema with audit & flexibility for LLM-driven recommendations  

---

## 🧾 References

- PostgreSQL Official Documentation  
- Mermaid & PlantUML Syntax Documentation  
- Schema derived from *Tailored2Trips* functional requirements  

---

✅ **Status:**  
Database schema, ERD, UML diagrams completed and versioned in repository.  
Next Phase → Backend API Integration.  


---

## ⚙️ Setup & Installation

### 1. Clone the repository  
```bash
git clone https://github.com/ProjFall2025/Team9
cd rbac

```

###  Backend (Node.js API)
```bash
cd backend
npm install
# Ensure your .env has:
#   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/rbac
#   JWT_SECRET=your_jwt_secret
#   feurl=http://localhost:5173
# (optional) SMTP_USER, SMTP_PASS – if using email verification
# (optional) REDIS_URL=redis://localhost:6379 – for OTP
npx prisma migrate dev --name init
npx prisma generate
npm run dev

```
### Frontend 
```bash

cd ../frontend
npm install
echo 'VITE_API_URL="http://localhost:3000"' > .env
npm run dev


### Database 

cd backend
npx prisma studio

```
