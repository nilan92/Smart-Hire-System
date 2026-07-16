# Smart Hire

Smart Hire is a centralized digital marketplace that connects customers with trusted service providers such as plumbers, electricians, cleaners, tutors, repair technicians, home-maintenance workers, and technical-support professionals.

The system allows customers to discover and book services, service providers to publish and manage their services, and administrators to manage the overall platform. Smart Hire also includes AI-powered features such as service recommendations, provider matching, customer assistance, and review summarization.

This project is developed as the final group assignment for the **Diploma in Advanced AI & Software Engineering** at **C-Clarke International Institute of Digital Sciences**.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Project Objectives](#project-objectives)
3. [Main User Roles](#main-user-roles)
4. [Core Features](#core-features)
5. [Team and Module Ownership](#team-and-module-ownership)
6. [Technology Stack](#technology-stack)
7. [System Architecture](#system-architecture)
8. [Project Structure](#project-structure)
9. [Backend Structure](#backend-structure)
10. [Frontend Structure](#frontend-structure)
11. [Database Design](#database-design)
12. [API Modules](#api-modules)
13. [Prerequisites](#prerequisites)
14. [Initial Setup](#initial-setup)
15. [Backend Setup](#backend-setup)
16. [Frontend Setup](#frontend-setup)
17. [Database Migrations](#database-migrations)
18. [Git Workflow](#git-workflow)
19. [Development Rules](#development-rules)
20. [Coding Standards](#coding-standards)
21. [Testing](#testing)
22. [Development Phases](#development-phases)
23. [MVP Scope](#mvp-scope)
24. [Security Rules](#security-rules)
25. [Project Status](#project-status)
26. [Assignment Deliverables](#assignment-deliverables)

---

# Project Overview

Smart Hire solves two main problems:

- Customers often struggle to find reliable and skilled service providers.
- Service providers often struggle to promote their services and reach suitable customers.

The platform provides a single web-based system where:

- Customers can search, compare, and book services.
- Providers can publish services and manage bookings.
- Administrators can manage users, providers, categories, and platform activity.
- AI features can assist customers in selecting suitable services and providers.

---

# Project Objectives

The main objectives of Smart Hire are to:

- Create a centralized marketplace for local services.
- Allow customers to find suitable service providers easily.
- Allow providers to advertise and manage their services.
- Support online booking and scheduling.
- Provide role-based access for customers, providers, and administrators.
- Allow customers to submit reviews and ratings.
- Send booking and system notifications.
- Integrate at least one AI-powered feature.
- Apply software engineering, database design, testing, project management, and version-control practices.

---

# Main User Roles

## Customer

Customers can:

- Register and log in.
- Manage personal profile details.
- Browse service categories.
- Search and filter services.
- View service and provider details.
- Save favourite services.
- Create service bookings.
- View booking history.
- Cancel eligible bookings.
- Track booking status.
- Record payment information.
- Submit reviews after completed bookings.
- View notifications.
- Use AI-powered recommendations.

## Service Provider

Service providers can:

- Register as a provider.
- Create and update a provider profile.
- Add professional information and experience.
- Publish services.
- Edit, pause, or remove services.
- Upload service images.
- Configure service areas.
- Configure weekly availability.
- View customer booking requests.
- Accept or reject bookings.
- Update booking progress.
- Mark bookings as completed.
- View customer reviews and ratings.
- View AI-generated review summaries.

## Administrator

Administrators can:

- Manage users.
- Activate, suspend, or deactivate accounts.
- Verify service providers.
- Manage service categories.
- Moderate service listings.
- Monitor bookings and payments.
- Review platform activity.
- View dashboard statistics.
- Remove inappropriate content.
- Manage reports or complaints if implemented.

---

# Core Features

## Authentication and User Management

- Customer registration
- Provider registration
- User login
- JWT authentication
- Password hashing
- Role-based authorization
- Profile management
- Account-status management

## Service Management

- Service-category management
- Provider service creation
- Service editing
- Service deletion or archiving
- Service-image support
- Service-area management
- Provider availability
- Service search and filtering
- Favourite services

## Booking Management

- Booking creation
- Date and time selection
- Customer booking history
- Provider booking requests
- Accept or reject booking
- Cancel booking
- Booking-status tracking
- Mark booking as completed

## Reviews and Ratings

- Submit a review after service completion
- Rate service providers
- View provider reviews
- Calculate average ratings
- Generate AI review summaries

## Notifications

- Booking-created notifications
- Booking-status notifications
- Payment notifications
- Review notifications
- System notifications
- Mark notifications as read

## Administration

- User management
- Provider verification
- Category management
- Service moderation
- Booking monitoring
- Dashboard statistics

## AI Features

The project may include:

- AI service recommendation
- AI provider matching
- AI customer-support assistant
- AI booking assistant
- AI review summarization
- AI conversation history
- Semantic service search using embeddings

At least one AI-powered feature must be fully implemented for the assignment.

---

# Team and Module Ownership

Replace the placeholder names below with the actual team-member names.

| Member | Main Module | Frontend Responsibilities | Backend Responsibilities | Main Database Tables |
|---|---|---|---|---|
| Member 1 – Name | Authentication and User Management | Login, registration, profile pages, guards, interceptors | JWT authentication, user APIs, role validation, provider profile APIs | `users`, `provider_profiles` |
| Member 2 – Name | Services and Categories | Service listing, search, details, provider service forms | Category APIs, service CRUD, search and filtering | `service_categories`, `services`, `service_images`, `service_areas`, `favorites` |
| Member 3 – Name | Bookings and Notifications | Booking form, booking history, provider requests, notifications | Booking lifecycle, availability, notification APIs | `bookings`, `provider_availability`, `notifications` |
| Member 4 – Name | Reviews, Payments and Admin | Review forms, payment status, admin dashboard | Reviews, payment recording, admin-management APIs | `reviews`, `payments` |
| Member 5 – Name | AI Features and Integration | AI assistant, recommendation results, review summaries | OpenAI integration, AI logging, matching and summarization | `ai_conversations`, `ai_messages`, `review_summaries`, `service_embeddings` |

Every member must complete work across:

- Angular frontend
- FastAPI backend
- PostgreSQL database
- API testing
- Unit or integration testing
- Documentation
- Git commits
- Jira or project-management tasks

---

# Module Responsibilities

## Member 1 – Authentication & User Management

### Frontend
- Login page
- Registration page
- Customer profile
- Provider profile
- Customer dashboard layout
- Provider dashboard layout
- Auth Guard
- Role Guard
- JWT Interceptor
- Authentication Service

### Backend
- User authentication
- JWT token generation
- Password hashing
- Registration API
- Login API
- Current user API
- User profile API
- Provider profile API
- Role validation
- Authentication dependencies

### Database
- users
- provider_profiles

---

## Member 2 – Services & Categories

### Frontend
- Service categories page
- Browse services
- Search services
- Service details
- Add/Edit service
- My services
- Favourite services

### Backend
- Category CRUD
- Service CRUD
- Search & filtering
- Favourite APIs
- Service image APIs
- Service area APIs

### Database
- service_categories
- services
- service_images
- service_areas
- favorites

---

## Member 3 – Bookings & Notifications

### Frontend
- Book service
- Booking history
- Booking details
- Provider booking requests
- Availability management
- Notifications page

### Backend
- Booking lifecycle
- Provider availability
- Booking status
- Notification APIs

### Database
- bookings
- provider_availability
- notifications

---

## Member 4 – Reviews, Payments & Administration

### Frontend
- Review form
- My reviews
- Payment status
- Provider reviews
- Admin dashboard
- User management
- Category management
- Provider verification

### Backend
- Review APIs
- Payment APIs
- Admin APIs
- Dashboard statistics
- User management
- Provider verification

### Database
- reviews
- payments

---

## Member 5 – AI Features

### Frontend
- AI Assistant
- Service recommendation page
- AI provider matching
- Review summary page

### Backend
- OpenAI integration
- AI recommendation
- AI chat
- AI review summarization
- AI conversation logging

### Database
- ai_conversations
- ai_messages
- review_summaries
- service_embeddings


# Dashboard Ownership

## Customer Dashboard

| Section | Owner |
|---------|-------|
| Dashboard Layout | Member 1 |
| Profile | Member 1 |
| Browse Services | Member 2 |
| Search Services | Member 2 |
| Favourite Services | Member 2 |
| Bookings | Member 3 |
| Notifications | Member 3 |
| Reviews | Member 4 |
| Payments | Member 4 |
| AI Assistant | Member 5 |

---

## Provider Dashboard

| Section | Owner |
|---------|-------|
| Dashboard Layout | Member 1 |
| Provider Profile | Member 1 |
| My Services | Member 2 |
| Service Areas | Member 2 |
| Booking Requests | Member 3 |
| Availability | Member 3 |
| Notifications | Member 3 |
| Reviews | Member 4 |
| Payments | Member 4 |
| AI Insights | Member 5 |

---

## Admin Dashboard

| Section | Owner |
|---------|-------|
| Admin Dashboard | Member 4 |
| User Management | Member 4 |
| Provider Verification | Member 4 |
| Categories | Member 4 |
| Services | Member 4 |
| Bookings | Member 4 |
| Payments | Member 4 |
| AI Analytics (Optional) | Member 5 |


# Module Development Order

1. Member 1 – Authentication & User Management
2. Member 2 – Services & Categories
3. Member 3 – Bookings & Notifications
4. Member 4 – Reviews, Payments & Administration
5. Member 5 – AI Integration
6. Module Integration
7. Testing & Bug Fixing
8. Final Deployment

---

# Technology Stack

## Frontend

- Angular
- TypeScript
- SCSS
- Angular Router
- Angular HttpClient
- Angular standalone components

## Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- Pydantic
- JWT authentication
- Bcrypt password hashing
- Uvicorn

## Database

- PostgreSQL
- Supabase-hosted PostgreSQL
- SQLAlchemy ORM
- Alembic migrations

## AI

- OpenAI API
- LangChain if required
- pgvector if semantic search is implemented

## Testing and Development Tools

- Pytest
- Angular testing tools
- Postman
- Swagger / OpenAPI
- Git
- GitHub
- Jira or equivalent
- VS Code

---

# System Architecture

Smart Hire follows a modular three-tier architecture.

```text
┌───────────────────────────────┐
│ Angular Frontend              │
│                               │
│ Customer Portal               │
│ Provider Portal               │
│ Admin Portal                  │
│ AI Assistant Interface        │
└───────────────┬───────────────┘
                │
                │ HTTP / JSON / JWT
                ▼
┌───────────────────────────────┐
│ FastAPI Backend               │
│                               │
│ Authentication                │
│ Users and Profiles            │
│ Services and Categories       │
│ Bookings and Notifications    │
│ Reviews and Payments          │
│ Administration                │
│ AI Integration                │
└───────────────┬───────────────┘
                │
                │ SQLAlchemy
                ▼
┌───────────────────────────────┐
│ Supabase PostgreSQL           │
│                               │
│ Relational Tables             │
│ Constraints                   │
│ Indexes                       │
│ Alembic Versioning            │
└───────────────────────────────┘
```

OpenAI communication must occur only through the FastAPI backend. API keys must never be exposed in the Angular frontend.

---

# Project Structure

```text
smart-hire-cclark/
│
├── backend/
├── frontend/
├── database/
├── documentation/
├── postman/
├── docker-compose.yml
├── README.md
└── .gitignore
```

## Root Folder Responsibilities

| Folder | Purpose |
|---|---|
| `backend/` | FastAPI application, database models, routers, services, repositories, migrations, and backend tests |
| `frontend/` | Angular application and frontend tests |
| `database/` | Seed scripts, exported SQL, ER diagrams, and database-related resources |
| `documentation/` | SRS, use cases, API documentation, testing evidence, WBS, deployment guide, and meeting records |
| `postman/` | Postman collections and environment files |
| `docker-compose.yml` | Optional local container configuration |
| `README.md` | Project overview, setup guide, architecture, and team instructions |

---

# Backend Structure

```text
backend/
│
├── alembic/
│   ├── versions/
│   ├── env.py
│   ├── README
│   └── script.py.mako
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── dependencies.py
│   │   └── security.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── provider_profile.py
│   │   ├── service_category.py
│   │   ├── service.py
│   │   ├── service_image.py
│   │   ├── service_area.py
│   │   ├── provider_availability.py
│   │   ├── booking.py
│   │   ├── payment.py
│   │   ├── review.py
│   │   ├── favorite.py
│   │   ├── notification.py
│   │   ├── ai_conversation.py
│   │   ├── ai_message.py
│   │   ├── review_summary.py
│   │   └── service_embedding.py
│   │
│   ├── schemas/
│   │   └── __init__.py
│   │
│   ├── repositories/
│   │   └── __init__.py
│   │
│   ├── services/
│   │   └── __init__.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── services.py
│   │   ├── bookings.py
│   │   ├── reviews.py
│   │   ├── notifications.py
│   │   ├── admin.py
│   │   └── ai.py
│   │
│   ├── tests/
│   │   └── __init__.py
│   │
│   └── utils/
│       ├── __init__.py
│       ├── constants.py
│       ├── exceptions.py
│       ├── helpers.py
│       └── validators.py
│
├── .env
├── .env.example
├── alembic.ini
└── requirements.txt
```

## Backend Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `core/` | Application configuration, database connection, authentication utilities, and shared dependencies |
| `models/` | SQLAlchemy database models |
| `schemas/` | Pydantic request and response schemas |
| `repositories/` | Database-access operations |
| `services/` | Business logic |
| `routers/` | FastAPI endpoints |
| `tests/` | Backend tests |
| `utils/` | Shared constants, validators, helpers, and exceptions |

---

# Frontend Structure

```text
frontend/
│
├── public/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   │
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   ├── layouts/
│   │   │   └── pipes/
│   │   │
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── customer/
│   │   │   ├── provider/
│   │   │   ├── services/
│   │   │   ├── bookings/
│   │   │   ├── reviews/
│   │   │   ├── notifications/
│   │   │   ├── admin/
│   │   │   └── ai/
│   │   │
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.ts
│   │   ├── app.html
│   │   └── app.scss
│   │
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
│
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.spec.json
```

## Frontend Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `core/guards/` | Authentication and role-based route guards |
| `core/interceptors/` | JWT and HTTP interceptors |
| `core/models/` | Shared TypeScript interfaces and types |
| `core/services/` | Application-wide services |
| `shared/components/` | Reusable UI components |
| `shared/layouts/` | Public, customer, provider, and admin layouts |
| `shared/directives/` | Reusable Angular directives |
| `shared/pipes/` | Reusable Angular pipes |
| `features/` | Feature-based customer, provider, admin, booking, service, review, notification, authentication, and AI code |

---

# Database Design

Smart Hire uses PostgreSQL hosted on Supabase.

The database schema is managed through:

- SQLAlchemy models
- Alembic migrations
- PostgreSQL constraints
- Supabase PostgreSQL

## Database Tables

| Area | Table | Purpose |
|---|---|---|
| Identity | `users` | Stores customer, provider, and admin accounts |
| Identity | `provider_profiles` | Stores provider-specific profile information |
| Catalog | `service_categories` | Stores service categories and subcategories |
| Catalog | `services` | Stores services published by providers |
| Catalog | `service_images` | Stores service image URLs |
| Catalog | `service_areas` | Stores provider service locations |
| Catalog | `provider_availability` | Stores provider weekly availability |
| Transactions | `bookings` | Stores service bookings |
| Transactions | `payments` | Stores payment records |
| Transactions | `reviews` | Stores customer ratings and reviews |
| Transactions | `favorites` | Stores customer favourite services |
| Transactions | `notifications` | Stores user notifications |
| AI | `ai_conversations` | Stores AI conversation sessions |
| AI | `ai_messages` | Stores individual chat messages |
| AI | `review_summaries` | Stores AI-generated review summaries |
| AI | `service_embeddings` | Stores service embeddings for semantic search |

## Main Database Relationships

- One user may have one provider profile.
- One provider may publish many services.
- One category may contain many services.
- One service may contain many images.
- One provider may have many service areas.
- One provider may have many availability records.
- One customer may create many bookings.
- One service may receive many bookings.
- One booking may have one payment.
- One completed booking may have one review.
- One customer may save many favourite services.
- One user may receive many notifications.
- One AI conversation may contain many messages.
- One provider may have multiple generated review summaries.
- One service may have one embedding record.

## Database Development Rules

- Do not create application tables manually in Supabase when they are managed by Alembic.
- Model changes must be reviewed before generating migrations.
- Migration files must be committed to Git.
- The initial migration should be generated by one coordinated team member.
- Team members must pull the latest migrations before changing database models.
- Applied migrations must not be deleted without team approval.

---

# API Modules

| Prefix | Purpose |
|---|---|
| `/api/health` | Application and database health checks |
| `/api/auth` | Registration, login, tokens, and authentication |
| `/api/users` | User and provider-profile management |
| `/api/services` | Categories, services, search, and filtering |
| `/api/bookings` | Booking creation and booking-status management |
| `/api/reviews` | Ratings and reviews |
| `/api/notifications` | User notifications |
| `/api/admin` | Administrative operations |
| `/api/ai` | AI recommendations, matching, assistant, and summaries |

## Planned Main Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Users and Providers

```text
GET /api/users/me
PUT /api/users/me
GET /api/users/providers/{provider_id}
PUT /api/users/provider-profile
```

### Services

```text
GET    /api/services
GET    /api/services/{service_id}
POST   /api/services
PUT    /api/services/{service_id}
DELETE /api/services/{service_id}
GET    /api/services/search
```

### Bookings

```text
POST /api/bookings
GET  /api/bookings/customer
GET  /api/bookings/provider
GET  /api/bookings/{booking_id}
PUT  /api/bookings/{booking_id}/status
```

### Reviews

```text
POST /api/reviews
GET  /api/reviews/provider/{provider_id}
```

### Notifications

```text
GET /api/notifications
PUT /api/notifications/{notification_id}/read
```

### Administration

```text
GET /api/admin/dashboard
GET /api/admin/users
PUT /api/admin/users/{user_id}/status
```

### AI

```text
POST /api/ai/recommend
POST /api/ai/provider-match
POST /api/ai/chat
POST /api/ai/reviews/summarize
```

API paths may be refined during implementation, but frontend and backend developers must follow the agreed API contract.

---

# Prerequisites

Install the following before running the project:

- Git
- Python 3.10 or later
- Node.js
- npm
- Angular CLI
- VS Code or another code editor
- Access to the shared Supabase project
- Internet connection that allows PostgreSQL pooler access

Verify installation:

```bash
git --version
python --version
node --version
npm --version
ng version
```

---

# Initial Setup

## Clone the Repository

```bash
git clone <repository-url>
cd smart-hire-cclark
```

Replace `<repository-url>` with the GitHub repository URL.

---

# Backend Setup

Navigate to the backend:

```bash
cd backend
```

## Create a Virtual Environment

```bash
python -m venv venv
```

## Activate the Virtual Environment

### Windows CMD

```cmd
venv\Scripts\activate
```

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

When PowerShell blocks script execution for the current terminal:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Create the Environment File

### Windows CMD

```cmd
copy .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Update `backend/.env` with the required values.

Example:

```env
DATABASE_URL=postgresql+psycopg2://...
SECRET_KEY=replace-with-a-secure-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=
```

The team should normally use the same shared Supabase PostgreSQL project so that all members work with a consistent development database.

Never commit the real `.env` file.

## Run the Backend

```bash
uvicorn app.main:app --reload
```

## Backend URLs

Application:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

Health check:

```text
http://127.0.0.1:8000/api/health
```

Database health check:

```text
http://127.0.0.1:8000/api/health/database
```

Expected database response:

```json
{
  "status": "success",
  "message": "Connected to Supabase PostgreSQL"
}
```

---

# Frontend Setup

From the project root:

```bash
cd frontend
```

## Install Packages

```bash
npm install
```

## Run Angular

```bash
ng serve
```

Open:

```text
http://localhost:4200
```

---

# Database Migrations

Database tables are managed through SQLAlchemy models and Alembic migrations.

Run all Alembic commands from the `backend` directory.

## Check Current Migration

```bash
alembic current
```

## View Migration Heads

```bash
alembic heads
```

## Generate a Migration

Only after approved SQLAlchemy model changes:

```bash
alembic revision --autogenerate -m "describe the database change"
```

Example:

```bash
alembic revision --autogenerate -m "create initial smart hire tables"
```

## Apply Migrations

```bash
alembic upgrade head
```

## Roll Back One Migration

```bash
alembic downgrade -1
```

## Important Migration Rules

- Do not generate an empty migration.
- Review generated migration files before applying them.
- Ensure all model files are imported in `app/models/__init__.py`.
- Ensure Alembic loads `Base.metadata`.
- Only one coordinated initial migration should be created.
- Other members should pull the migration and run `alembic upgrade head`.
- Do not create duplicate migrations for the same schema change.

After the initial migration is applied, the following should appear in Supabase:

```text
users
provider_profiles
service_categories
services
service_images
service_areas
provider_availability
bookings
payments
reviews
favorites
notifications
ai_conversations
ai_messages
review_summaries
service_embeddings
alembic_version
```

---

# Git Workflow

## Main Branches

```text
main
develop
```

### `main`

Contains stable, reviewed, and submission-ready code.

### `develop`

Contains integrated development work before final release.

## Feature Branches

Each module must use a separate feature branch.

Examples:

```text
feature/auth-users
feature/service-catalog
feature/booking-notifications
feature/reviews-payments-admin
feature/ai-assistant
```

## Start New Work

```bash
git checkout develop
git pull origin develop
git checkout -b feature/module-name
```

## Commit Work

```bash
git add .
git commit -m "feat(module): describe completed work"
```

## Push the Branch

```bash
git push -u origin feature/module-name
```

Create a Pull Request from:

```text
feature/module-name → develop
```

After integration testing:

```text
develop → main
```

Never develop directly on `main`.

---

# Development Rules

Every member must:

- Pull the latest code before starting work.
- Work only inside the assigned module.
- Use a feature branch.
- Follow the agreed API paths.
- Follow the approved database design.
- Test frontend and backend changes.
- Add or update relevant tests.
- Update Jira tasks.
- Use meaningful commit messages.
- Submit work through Pull Requests.
- Review at least one other member's Pull Request.
- Resolve merge conflicts before approval.
- Update documentation when APIs or requirements change.

---

# Coding Standards

## Backend Standards

- Follow REST API principles.
- Use FastAPI routers.
- Use SQLAlchemy ORM.
- Use Pydantic schemas for validation.
- Keep business logic in service classes.
- Keep database queries in repositories when applicable.
- Use dependency injection.
- Use type hints.
- Handle errors using controlled exceptions.
- Never return database passwords or internal errors to users.
- Protect private endpoints with JWT authentication.
- Enforce role-based authorization.

Recommended flow:

```text
Router
  ↓
Service
  ↓
Repository
  ↓
SQLAlchemy Model
  ↓
PostgreSQL
```

## Frontend Standards

- Use Angular standalone components.
- Keep features inside their assigned folders.
- Use Angular services for API communication.
- Use route guards for protected pages.
- Use an HTTP interceptor for JWT tokens.
- Use reusable shared components.
- Keep components small and focused.
- Use TypeScript interfaces.
- Validate forms.
- Display clear loading and error states.
- Keep layouts responsive.

## Naming Standards

Backend files:

```text
snake_case.py
```

Python classes:

```text
PascalCase
```

Python variables and functions:

```text
snake_case
```

Angular files:

```text
kebab-case.ts
```

TypeScript classes and interfaces:

```text
PascalCase
```

TypeScript variables and methods:

```text
camelCase
```

---

# Commit Message Format

Use conventional and meaningful commit messages.

Examples:

```text
feat(auth): implement user registration
feat(services): add service search endpoint
feat(bookings): create provider booking requests page
feat(ai): add service recommendation endpoint
fix(reviews): prevent reviews for incomplete bookings
test(auth): add login API tests
docs: update database setup instructions
refactor(services): move queries to repository
chore: update dependencies
```

---

# Testing

## Backend Tests

Run from the backend directory:

```bash
pytest
```

Recommended backend testing areas:

- Authentication
- Role-based authorization
- Service creation and editing
- Booking creation
- Booking-status updates
- Review validation
- Admin authorization
- AI request validation
- Database connection

## Frontend Tests

Run from the frontend directory:

```bash
ng test
```

Recommended frontend testing areas:

- Components
- Forms
- Services
- Guards
- Interceptors
- Route access
- Error handling

## API Testing

Use:

- Swagger UI
- Postman

Postman collections should be stored in:

```text
postman/
```

## Required Testing Evidence

Each module owner should provide:

- Unit-test results
- API test results
- Screenshots or exported evidence
- Integration-test evidence
- Bug reports
- Retest results
- Final acceptance status

## Main Test Types

- Unit testing
- Integration testing
- API testing
- System testing
- Role-based access testing
- Security testing
- AI-response validation
- User acceptance testing
- Regression testing

---

# Development Phases

## Phase 1 – Foundation

- Git repository
- FastAPI setup
- Angular setup
- Supabase connection
- SQLAlchemy configuration
- Alembic configuration
- Health endpoints
- Shared folders
- README and onboarding instructions

## Phase 2 – Core Database

- SQLAlchemy models
- Enumerated types
- Relationships
- Constraints
- Initial Alembic migration
- Seed data
- Database validation

## Phase 3 – Core Modules

- Authentication
- User profiles
- Provider profiles
- Service categories
- Service management
- Service search
- Booking and scheduling

## Phase 4 – Supporting Modules

- Reviews and ratings
- Notifications
- Payment recording
- Admin dashboard
- User management
- Category management
- Service moderation

## Phase 5 – AI Integration

- Service recommendation
- Provider matching
- AI assistant
- AI conversation logging
- Review summarization
- Optional service embeddings

## Phase 6 – Quality and Delivery

- Unit testing
- Integration testing
- System testing
- Bug fixing
- Deployment
- Deployment guide
- API documentation
- Presentation
- Viva preparation
- Final repository review

---

# MVP Scope

The first working release must include:

- Customer registration
- Provider registration
- User login
- JWT authentication
- Role-based access
- User profile management
- Provider profile management
- Service-category listing
- Provider service creation
- Service search and filtering
- Service-detail view
- Booking creation
- Provider booking acceptance or rejection
- Booking-status tracking
- Customer booking cancellation
- Reviews for completed bookings
- Basic notifications
- Basic admin management
- At least one working AI-powered feature

## Optional Enhancements

The following can be implemented after the MVP:

- Multiple service images
- Advanced provider availability validation
- Realtime notifications
- External payment gateway
- Provider-document verification
- Complaint management
- Semantic search using pgvector
- AI review summarization
- Advanced provider matching
- AI chat history

---

# Security Rules

Never commit or expose:

- `backend/.env`
- Supabase database passwords
- Supabase service-role keys
- Database connection strings
- JWT secret keys
- OpenAI API keys
- User passwords
- Production credentials

Passwords must be stored only as secure hashes.

OpenAI requests must be sent from the FastAPI backend, not directly from Angular.

Private APIs must require JWT authentication.

Role-restricted endpoints must verify whether the user is a:

- Customer
- Provider
- Administrator

The `.gitignore` must exclude:

```text
backend/.env
backend/venv/
backend/.venv/
__pycache__/
*.pyc
frontend/node_modules/
frontend/dist/
frontend/.angular/
```

---

# Before Starting Development

Every team member must verify the following after cloning.

## Backend

- Virtual environment can be created.
- Dependencies install successfully.
- FastAPI starts successfully.
- Swagger loads successfully.
- Health endpoint returns success.
- Database health endpoint returns success.
- Alembic connects successfully.

## Frontend

- Packages install successfully.
- Angular starts successfully.
- The application opens at `localhost:4200`.

## Database

- The shared Supabase project is accessible.
- The connection string is configured in `.env`.
- Existing migrations can be applied.

Only after these checks pass should feature development begin.

---

# Project Status

| Area | Status |
|---|---|
| Repository structure | Completed |
| FastAPI setup | Completed |
| Angular setup | Completed |
| Supabase connection | Completed |
| SQLAlchemy setup | Completed |
| Alembic setup | Completed |
| Health endpoints | Completed |
| Feature folders | Completed |
| Router placeholders | Completed |
| SQLAlchemy model implementation | Not started / In progress |
| Initial database migration | Not created |
| Authentication module | Not started |
| Service module | Not started |
| Booking module | Not started |
| Review module | Not started |
| Notification module | Not started |
| Admin module | Not started |
| AI module | Not started |
| Testing | Not started |
| Deployment | Not started |

**Current phase:** Project foundation completed  
**Next phase:** SQLAlchemy model implementation and initial Alembic migration

---

# Assignment Deliverables

## Documentation

- Software Requirements Specification
- Use Case Diagrams
- User Stories
- Work Breakdown Structure
- Database Design
- API Documentation
- Testing Documentation
- Deployment Guide
- User Guide

## Development

- Angular source code
- FastAPI source code
- PostgreSQL database schema
- Alembic migration files
- Seed data
- OpenAI integration
- Git repository
- Postman collection

## Project Management

- Jira board
- Sprint planning
- Task tracking
- WBS
- Risk register
- Meeting records
- Review recordings

## Quality Assurance

- Test plan
- Test cases
- Unit-test evidence
- API-test evidence
- Integration-test evidence
- Bug reports
- Retesting evidence
- Final test summary

## Presentation and Viva

Every member must be able to explain:

- Overall system architecture
- Angular and FastAPI communication
- Database relationships
- Authentication flow
- Their assigned module
- Another team member's module
- Git workflow
- Testing process
- AI integration
- Deployment approach

---

# License

This project is created for academic purposes as part of the Diploma in Advanced AI & Software Engineering.

---

# Institution

**Smart Hire**  
Diploma in Advanced AI & Software Engineering  
C-Clarke International Institute of Digital Sciences  
Batch 25/26