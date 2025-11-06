# Food Database API PRD  
**Project Name:** FoodDB-API  
**Version:** 1.0 (MVP)  
**Date:** YYYY-MM-DD  
**Prepared by:** [Your Name]

---

## 1. Purpose & Scope  
This API provides structured access to food and nutrition data (focusing initially on Kenyan foods) and will support internal use by your meal-recommendation app as well as external developer consumption (via API keys).  
Scope includes:  
- CRUD access to foods, categories, nutrients  
- Search and filter endpoints  
- Developer API key management & usage tracking  
- Public documentation (Swagger / OpenAPI)  
Excludes initially: full meal-recommendation AI engine (will be handled in separate service/app).

---

## 2. Objectives & Success Criteria  
- **Objective:** Launch a public API endpoint platform where developers can search and retrieve Kenyan food data via REST endpoints.  
- **Success Criteria:**  
  - API has at least **100 unique food items** imported with full nutrient info.  
  - API key system working (users can register, generate key, make requests).  
  - Average response time < 300 ms for typical GET requests.  
  - External developers use it (≥ 10 successful integrations in first 3 months).  
  - 99.5% uptime in production.

---

## 3. Stakeholders  
- Product Owner: [Your Name]  
- Backend Developer(s): [List names]  
- Data Engineer: [Name]  
- DevOps / Infrastructure: [Name]  
- External Developers / Consumers (future)  

---

## 4. Functional Requirements  

### 4.1 Auth & API Key Management  
- Users can register (email/password) and login.  
- Users can generate, view, and revoke API keys.  
- API keys included in request header `x-api-key` to access protected endpoints.  
- Usage tracking per API key (requests count, timestamp, endpoint).  
- Rate limiting: Free tier (e.g., 1,000 requests/day), Pro tier later.  
- Roles: `user`, `admin`.

### 4.2 Food Data Management  
- **Categories**: CRUD for food categories (e.g., “Cereals”, “Vegetables”).  
- **Foods**: CRUD for food items: fields include `id`, `code`, `name`, `category_id`, `description`, `image_url`.  
- **Nutrients**: Associate nutrient profile with each food: `energy_kcal`, `protein_g`, `fat_g`, `carbs_g`, `fibre_g`, optional micronutrients.  
- Import mechanism (seed script) to bulk-load dataset from cleaned CSV.

### 4.3 Public Data Endpoints  
- `GET /categories` — list categories.  
- `GET /foods` — list foods (with pagination).  
- `GET /foods/:id` — fetch food detail.  
- `GET /foods/search?query=…&category=…` — search/filter foods.  
- `GET /foods/:id/nutrients` — get nutrient profile for a food.  
- `POST /foods` / `PUT /foods/:id` / `DELETE /foods/:id` — (protected for admins).

### 4.4 Documentation & Dev Experience  
- Swagger / OpenAPI auto-generated docs accessible at `/docs`.  
- Example usage section for external developers (how to include `x-api-key`, rate limits).  
- Developer dashboard UI where user can view API usage, manage keys.

### 4.5 Administration & Monitoring  
- Admin dashboard (reuse boilerplate’s user/role management).  
- Endpoint logging and analytics: track overall API usage, errors.  
- Health-check endpoint `/health`.

---

## 5. Non-Functional Requirements  
- **Performance:** API responses for simple GETs < 300 ms.  
- **Scalability:** System should support scaling horizontally (stateless backend).  
- **Security:**  
  - Store API keys securely.  
  - Protect endpoints via guards.  
  - Use HTTPS.  
  - Implement rate limiting.  
- **Reliability:** 99.5% uptime.  
- **Maintainability:** Code uses NestJS & the Brocoders boilerplate; modular and well-tested.  
- **Extensibility:** Easy to add more nutrient fields, search filters, later AI endpoints.  
- **Documentation:** Clear and up-to-date docs for both backend and external devs.

---

## 6. Technical Architecture  

### 6.1 Stack  
- Backend: NestJS (using the Brocoders boilerplate)  
- Database: **Neon (Serverless PostgreSQL)** — autoscaling, branching support.  
- Auth & API Key Management: Built-in via boilerplate + custom module  
- Deployment: Docker + CI/CD (GitHub Actions)  
- Documentation: Swagger (supported by boilerplate)  

### 6.2 System Diagram  
```
[External Developer] → [API Gateway / NestJS Backend] → [Neon PostgreSQL DB]
                                   ↳ Logs & Usage Tracking
```

### 6.3 Data Model (simplified)  
- `users` (id, email, password_hash, role)  
- `api_keys` (id, user_id, key, status, created_at, last_used)  
- `categories` (id, name)  
- `foods` (id, code, name, category_id, description, image_url, created_at)  
- `nutrients` (id, food_id, energy_kcal, protein_g, fat_g, carbs_g, fibre_g, …)  
- `usage_logs` (id, api_key_id, endpoint, timestamp, success)  

---

## 7. Milestones & Timeline  
| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Setup & Boilerplate Integration | 1 week | Clone boilerplate, configure DB (Neon), deploy skeleton app |
| Module Development | 2 weeks | Users/auth module, API key module, category module |
| Data Import & Modeling | 1 week | Schema for foods/nutrients, import initial dataset (~100 items) |
| Public Endpoints & Docs | 1 week | Implementation of GET endpoints, Swagger docs |
| Admin Dashboard & Usage Tracking | 1 week | UI for API key management, usage logging backend |
| Testing, Deployment & Launch | 1 week | Automated tests (unit/e2e), Docker config, deploy to staging/production |
Total MVP: ~6 weeks  

---

## 8. Risks & Mitigations  
- **Risk:** Data quality issues in initial dataset may cause inaccurate nutrition data.  
  - *Mitigation:* Manual audit of dataset, validation scripts.  
- **Risk:** API key abuse or high usage spikes.  
  - *Mitigation:* Implement rate limiting, usage caps from day one.  
- **Risk:** Performance bottlenecks at scale.  
  - *Mitigation:* Monitor metrics, use caching (Redis) for frequent queries.  
- **Risk:** Security vulnerabilities (exposed endpoints or keys).  
  - *Mitigation:* Use HTTPS, guard endpoints, review dependencies.  

---

## 9. Future Enhancements (Post-MVP)  
- Meal-recommendation AI endpoints (separate microservice)  
- Advanced search (vector embeddings, full-text)  
- Premium tier with higher rate limits  
- Multi-region food datasets (Uganda, Nigeria etc)  
- Developer portal with analytics & billing  

---

## 10. Approval  
Approved by: _____________________  
Date: _____________________________  
