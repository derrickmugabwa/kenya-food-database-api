# FoodDB-API Implementation Plan

**Project:** Kenya Food Database API  
**Version:** 1.0 (MVP)  
**Start Date:** 2025-11-01  
**Framework:** NestJS (Brocoders Boilerplate)  
**Database:** Neon PostgreSQL (Serverless)

---

## 📊 Project Status

### ✅ Completed
- [x] Boilerplate setup and configuration
- [x] Neon PostgreSQL database connected
- [x] Initial migrations run
- [x] Seed data populated (default users, roles, statuses)
- [x] API running on http://localhost:3000
- [x] Swagger documentation available at http://localhost:3000/docs
- [x] Maildev configured for email testing

### 🎯 Current Phase
**Phase 1: Data Models & Architecture** (Week 1)

---

## 🏗️ System Architecture

### Tech Stack
- **Backend:** NestJS with Hexagonal Architecture
- **Database:** Neon PostgreSQL (Serverless)
- **ORM:** TypeORM
- **Auth:** JWT + API Key (custom)
- **Docs:** Swagger/OpenAPI
- **Cache:** Redis (for rate limiting)
- **File Storage:** Local (MVP) → S3 (Production)
- **Testing:** Jest (unit) + Supertest (e2e)

### Core Modules

```
src/
├── users/              ✅ (Boilerplate)
├── auth/               ✅ (Boilerplate)
├── files/              ✅ (Boilerplate)
├── categories/         🔲 (To build)
├── foods/              🔲 (To build)
├── nutrients/          🔲 (To build)
├── api-keys/           🔲 (To build - Custom)
├── usage-logs/         🔲 (To build - Custom)
└── rate-limiter/       🔲 (To build - Custom)
```

---

## 📐 Data Model

### Entity Relationships

```
users (boilerplate)
  ├── 1:N → api_keys
  └── role (admin/user)

api_keys
  ├── N:1 → users
  └── 1:N → usage_logs

categories
  └── 1:N → foods

foods
  ├── N:1 → categories
  ├── 1:1 → nutrients
  └── 1:1 → files (image)

nutrients
  └── 1:1 → foods

usage_logs
  └── N:1 → api_keys
```

### Database Schema

#### Categories Table
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);
```

#### Foods Table
```sql
CREATE TABLE foods (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  description TEXT,
  image_id INTEGER REFERENCES files(id),
  serving_size VARCHAR(50),
  serving_unit VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_foods_category ON foods(category_id);
CREATE INDEX idx_foods_code ON foods(code);
CREATE INDEX idx_foods_name ON foods(name);
```

#### Nutrients Table
```sql
CREATE TABLE nutrients (
  id SERIAL PRIMARY KEY,
  food_id INTEGER UNIQUE REFERENCES foods(id) ON DELETE CASCADE,
  
  -- Macronutrients (per 100g)
  energy_kcal DECIMAL(10,2),
  protein_g DECIMAL(10,2),
  fat_g DECIMAL(10,2),
  carbohydrates_g DECIMAL(10,2),
  fiber_g DECIMAL(10,2),
  sugar_g DECIMAL(10,2),
  
  -- Micronutrients (optional for MVP)
  calcium_mg DECIMAL(10,2),
  iron_mg DECIMAL(10,2),
  vitamin_a_mcg DECIMAL(10,2),
  vitamin_c_mg DECIMAL(10,2),
  sodium_mg DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_nutrients_food ON nutrients(food_id);
```

#### API Keys Table
```sql
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE,
  key_prefix VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  tier VARCHAR(20) DEFAULT 'free',
  rate_limit INTEGER DEFAULT 1000,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_status ON api_keys(status);
```

#### Usage Logs Table
```sql
CREATE TABLE usage_logs (
  id SERIAL PRIMARY KEY,
  api_key_id INTEGER REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_api_key ON usage_logs(api_key_id);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at);
```

---

## 🚀 Implementation Phases

### Phase 1: Data Models & Core Resources (Week 1)

#### 1.1 Generate Resources
```bash
# Generate core resources using boilerplate CLI
npm run generate:resource:relational -- --name Category
npm run generate:resource:relational -- --name Food
npm run generate:resource:relational -- --name Nutrient
npm run generate:resource:relational -- --name ApiKey
npm run generate:resource:relational -- --name UsageLog
```

#### 1.2 Define Entities
- [ ] Create `Category` entity with validation
- [ ] Create `Food` entity with relations
- [ ] Create `Nutrient` entity with decimal fields
- [ ] Create `ApiKey` entity with security fields
- [ ] Create `UsageLog` entity for tracking

#### 1.3 Generate & Run Migrations
```bash
npm run migration:generate -- src/database/migrations/CreateCategoriesTable
npm run migration:generate -- src/database/migrations/CreateFoodsTable
npm run migration:generate -- src/database/migrations/CreateNutrientsTable
npm run migration:generate -- src/database/migrations/CreateApiKeysTable
npm run migration:generate -- src/database/migrations/CreateUsageLogsTable
npm run migration:run
```

#### 1.4 Create DTOs
- [ ] Category: CreateDto, UpdateDto, FindAllDto
- [ ] Food: CreateDto, UpdateDto, FindAllDto, SearchDto
- [ ] Nutrient: CreateDto, UpdateDto
- [ ] ApiKey: CreateDto, GenerateDto, RevokeDto
- [ ] UsageLog: CreateDto, StatsDto

---

### Phase 2: API Key System (Week 2)

#### 2.1 API Key Service
- [ ] Generate secure API keys (format: `fdb_live_xxxxxxxxxxxxx`)
- [ ] Hash keys before storage (bcrypt)
- [ ] Validate API key format
- [ ] Check key status (active/revoked/expired)
- [ ] Update last_used_at on each request

#### 2.2 API Key Guard
```typescript
@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Extract x-api-key from headers
    // 2. Validate format
    // 3. Verify against database
    // 4. Check status and expiration
    // 5. Attach user to request
    // 6. Log usage
  }
}
```

#### 2.3 Rate Limiting
- [ ] Install `@nestjs/throttler`
- [ ] Configure Redis storage for rate limits
- [ ] Implement per-key rate limiting (1,000/day for free tier)
- [ ] Return rate limit headers in response
- [ ] Handle rate limit exceeded errors

#### 2.4 Usage Tracking Middleware
- [ ] Log all API requests
- [ ] Track response time
- [ ] Store IP address and user agent
- [ ] Batch insert logs (performance optimization)

#### 2.5 API Key Endpoints
```
POST   /api/v1/api-keys              - Generate new API key
GET    /api/v1/api-keys              - List user's API keys
GET    /api/v1/api-keys/:id          - Get API key details
PATCH  /api/v1/api-keys/:id          - Update API key (name)
DELETE /api/v1/api-keys/:id          - Revoke API key
GET    /api/v1/api-keys/:id/usage    - Get usage statistics
```

---

### Phase 3: Food Data Endpoints (Week 3)

#### 3.1 Category Module
**Endpoints:**
```
GET    /api/v1/categories            - List all categories (public)
GET    /api/v1/categories/:id        - Get category details (public)
POST   /api/v1/categories            - Create category (admin)
PATCH  /api/v1/categories/:id        - Update category (admin)
DELETE /api/v1/categories/:id        - Delete category (admin)
```

**Features:**
- [ ] Public endpoints protected by API key
- [ ] Admin endpoints protected by JWT + Admin role
- [ ] Include food count in category response
- [ ] Soft delete support

#### 3.2 Food Module
**Endpoints:**
```
GET    /api/v1/foods                 - List foods (paginated, public)
GET    /api/v1/foods/:id             - Get food details (public)
GET    /api/v1/foods/:id/nutrients   - Get food nutrients (public)
GET    /api/v1/foods/search          - Search foods (public)
POST   /api/v1/foods                 - Create food (admin)
PATCH  /api/v1/foods/:id             - Update food (admin)
DELETE /api/v1/foods/:id             - Delete food (admin)
```

**Features:**
- [ ] Pagination (default: 20 per page, max: 100)
- [ ] Filtering by category
- [ ] Search by name (case-insensitive, partial match)
- [ ] Search by code
- [ ] Include nutrients in food response (optional)
- [ ] Include category in food response
- [ ] Image upload support (use boilerplate file module)
- [ ] Soft delete support

#### 3.3 Search Implementation
```typescript
// Search query parameters
interface SearchFoodsDto {
  query?: string;           // Search in name
  category?: number;        // Filter by category ID
  minProtein?: number;      // Filter by min protein
  maxCalories?: number;     // Filter by max calories
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'calories' | 'protein';
  sortOrder?: 'ASC' | 'DESC';
}
```

#### 3.4 Response Serialization
- [ ] Hide sensitive fields (created_at, updated_at for public endpoints)
- [ ] Use `@Expose()` and `@Exclude()` decorators
- [ ] Create separate response DTOs for public vs admin

---

### Phase 4: Data Import & Seeding (Week 4)

#### 4.1 Prepare Dataset
- [ ] Source Kenyan food data (CSV format)
- [ ] Clean and validate data
- [ ] Ensure 100+ unique food items
- [ ] Verify nutritional data accuracy

#### 4.2 Create Seed Scripts
```bash
npm run seed:create:relational -- CategorySeed
npm run seed:create:relational -- FoodSeed
npm run seed:create:relational -- NutrientSeed
```

#### 4.3 Seed Structure
```typescript
// Category seed (10-15 categories)
- Cereals & Grains
- Vegetables
- Fruits
- Legumes & Pulses
- Meat & Poultry
- Fish & Seafood
- Dairy Products
- Oils & Fats
- Beverages
- Snacks & Sweets
```

#### 4.4 CSV Import Script
- [ ] Parse CSV file
- [ ] Validate each row
- [ ] Transform data to entity format
- [ ] Bulk insert using TypeORM
- [ ] Handle errors and duplicates
- [ ] Log import statistics

#### 4.5 Run Seeds
```bash
npm run seed:run:relational
```

---

### Phase 5: Developer Dashboard (Week 5)

#### 5.1 API Key Management UI
- [ ] Generate new API key form
- [ ] List user's API keys (table view)
- [ ] Show key prefix (hide full key after generation)
- [ ] Revoke key button with confirmation
- [ ] Copy key to clipboard functionality

#### 5.2 Usage Analytics
- [ ] Total requests count
- [ ] Requests per day (chart)
- [ ] Most used endpoints
- [ ] Response time metrics
- [ ] Error rate
- [ ] Rate limit status

#### 5.3 Documentation Page
- [ ] Getting started guide
- [ ] Authentication instructions
- [ ] Example requests (curl, JavaScript, Python)
- [ ] Rate limits explanation
- [ ] Error codes reference
- [ ] Link to Swagger docs

#### 5.4 API Playground
- [ ] Interactive API tester
- [ ] Pre-filled example requests
- [ ] Response viewer
- [ ] Save favorite requests

---

### Phase 6: Testing & Deployment (Week 6)

#### 6.1 Unit Tests
```bash
npm run test
```

**Test Coverage:**
- [ ] Category service (CRUD operations)
- [ ] Food service (CRUD + search)
- [ ] Nutrient service
- [ ] API key service (generation, validation)
- [ ] Usage log service
- [ ] Rate limiter

#### 6.2 E2E Tests
```bash
npm run test:e2e
```

**Test Scenarios:**
- [ ] User registration and login
- [ ] API key generation and usage
- [ ] Public food endpoints with API key
- [ ] Admin food endpoints with JWT
- [ ] Search and filtering
- [ ] Rate limiting behavior
- [ ] Error handling (401, 403, 404, 429)

#### 6.3 Performance Testing
- [ ] Load test with 100 concurrent users
- [ ] Verify response time < 300ms
- [ ] Test rate limiting under load
- [ ] Database query optimization
- [ ] Add indexes where needed

#### 6.4 Security Audit
- [ ] API key storage (hashed)
- [ ] JWT secret strength
- [ ] HTTPS enforcement
- [ ] CORS configuration
- [ ] SQL injection prevention (TypeORM handles this)
- [ ] Rate limiting effectiveness
- [ ] Input validation on all endpoints

#### 6.5 Docker Configuration
```bash
# Build image
docker build -t fooddb-api .

# Run container
docker run -p 3000:3000 --env-file .env fooddb-api
```

#### 6.6 CI/CD Pipeline
- [ ] GitHub Actions workflow
- [ ] Run tests on PR
- [ ] Build Docker image
- [ ] Deploy to staging
- [ ] Deploy to production (manual approval)

#### 6.7 Production Deployment
- [ ] Set up production Neon database
- [ ] Configure environment variables
- [ ] Run migrations on production
- [ ] Run seeds on production
- [ ] Set up monitoring (health checks)
- [ ] Configure logging
- [ ] Set up error tracking (Sentry)

---

## 📝 API Endpoints Summary

### Public Endpoints (Require API Key)
```
GET    /api/v1/categories
GET    /api/v1/categories/:id
GET    /api/v1/foods
GET    /api/v1/foods/:id
GET    /api/v1/foods/:id/nutrients
GET    /api/v1/foods/search
```

### User Endpoints (Require JWT)
```
POST   /api/v1/api-keys
GET    /api/v1/api-keys
GET    /api/v1/api-keys/:id
PATCH  /api/v1/api-keys/:id
DELETE /api/v1/api-keys/:id
GET    /api/v1/api-keys/:id/usage
```

### Admin Endpoints (Require JWT + Admin Role)
```
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
POST   /api/v1/foods
PATCH  /api/v1/foods/:id
DELETE /api/v1/foods/:id
POST   /api/v1/foods/:id/image
```

### System Endpoints
```
GET    /health
GET    /docs (Swagger)
```

---

## 🎯 Success Metrics

### MVP Launch Criteria
- [ ] 100+ unique Kenyan food items in database
- [ ] API key system fully functional
- [ ] Rate limiting working (1,000 requests/day)
- [ ] All public endpoints responding < 300ms
- [ ] Swagger documentation complete
- [ ] 80%+ test coverage
- [ ] Zero critical security vulnerabilities
- [ ] Production deployment successful

### Post-Launch (3 Months)
- [ ] 10+ external developers using the API
- [ ] 99.5% uptime
- [ ] 1,000+ API requests per day
- [ ] Positive developer feedback
- [ ] Zero data breaches

---

## 🔧 Development Commands

### Daily Development
```bash
# Start development server
npm run start:dev

# Run migrations
npm run migration:run

# Run seeds
npm run seed:run:relational

# Generate new resource
npm run generate:resource:relational -- --name ResourceName

# Add property to resource
npm run add:property:to-relational
```

### Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Database
```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Revert migration
npm run migration:revert

# Drop all tables
npm run schema:drop
```

---

## 📚 Resources & Documentation

### Boilerplate Documentation
- [Architecture](./docs/architecture.md)
- [CLI Commands](./docs/cli.md)
- [Database](./docs/database.md)
- [Authentication](./docs/auth.md)
- [File Uploading](./docs/file-uploading.md)
- [Testing](./docs/tests.md)

### External Resources
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Neon PostgreSQL](https://neon.tech/docs)
- [Swagger/OpenAPI](https://swagger.io/specification/)

---

## 🚨 Risks & Mitigations

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data quality issues | High | Medium | Manual audit, validation scripts |
| API key abuse | High | Medium | Rate limiting, monitoring, key revocation |
| Performance bottlenecks | Medium | Low | Caching, indexing, load testing |
| Security vulnerabilities | High | Low | Security audit, HTTPS, input validation |
| Neon database limits | Medium | Low | Monitor usage, upgrade plan if needed |

### Project Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Dataset unavailable | High | Low | Source multiple datasets, manual entry |
| Scope creep | Medium | High | Stick to MVP, defer enhancements |
| Timeline delays | Medium | Medium | Weekly reviews, adjust scope |

---

## 🎉 Future Enhancements (Post-MVP)

### Phase 2 Features
- [ ] Meal recommendation AI endpoints
- [ ] Advanced search (full-text, vector embeddings)
- [ ] Premium API tier (higher rate limits)
- [ ] Webhook support for data updates
- [ ] GraphQL API alongside REST

### Phase 3 Features
- [ ] Multi-region datasets (Uganda, Nigeria, etc.)
- [ ] Recipe database with nutritional calculations
- [ ] Meal planning endpoints
- [ ] Barcode scanning integration
- [ ] Mobile SDK (iOS, Android)

### Infrastructure
- [ ] Multi-region deployment
- [ ] CDN for static assets
- [ ] Advanced caching (Redis)
- [ ] Real-time analytics dashboard
- [ ] Automated data quality checks

---

## 📞 Support & Contact

**Project Owner:** Derrick Mugabwa  
**Repository:** [GitHub Link]  
**Documentation:** http://localhost:3000/docs  
**Status:** In Development (Phase 1)

---

**Last Updated:** 2025-11-01  
**Next Review:** 2025-11-08
