# Smart Hire Database Design Document

## Overview

Smart Hire uses PostgreSQL hosted on Supabase as the primary database.

The backend uses:

* FastAPI
* SQLAlchemy ORM
* Alembic Migrations

Database design follows normalization principles and uses foreign-key relationships to maintain data integrity.

---

# Database Technology

| Component      | Technology |
| -------------- | ---------- |
| Database       | PostgreSQL |
| Hosting        | Supabase   |
| ORM            | SQLAlchemy |
| Migration Tool | Alembic    |
| Validation     | Pydantic   |

---

# Entity Relationship Overview

```text
User
│
├── ProviderProfile
│
├── Booking
│
├── Review
│
├── Notification
│
└── AIConversation

ServiceCategory
│
└── Service
        │
        ├── ServiceImage
        ├── ServiceArea
        ├── Favorite
        ├── Booking
        └── ServiceEmbedding
```

---

# Database Tables

## users

Stores all platform users.

### Attributes

| Column         | Type      | Description                          |
| -------------- | --------- | ------------------------------------ |
| id             | UUID      | Primary Key                          |
| email          | VARCHAR   | Unique Email                         |
| password_hash  | VARCHAR   | Encrypted Password                   |
| full_name      | VARCHAR   | User Name                            |
| phone          | VARCHAR   | Contact Number                       |
| role           | ENUM      | customer/provider/admin              |
| status         | ENUM      | pending/active/suspended/deactivated |
| email_verified | BOOLEAN   | Verification Status                  |
| created_at     | TIMESTAMP | Creation Time                        |
| updated_at     | TIMESTAMP | Last Update                          |

### Relationships

* One User → One Provider Profile
* One User → Many Bookings
* One User → Many Reviews
* One User → Many Notifications

---

## provider_profiles

Stores additional information for providers.

### Attributes

| Column              | Type         |
| ------------------- | ------------ |
| user_id             | UUID (PK/FK) |
| bio                 | TEXT         |
| years_experience    | INTEGER      |
| verification_status | ENUM         |
| avg_rating          | NUMERIC      |
| total_reviews       | INTEGER      |
| created_at          | TIMESTAMP    |
| updated_at          | TIMESTAMP    |

### Relationship

```text
users
 1
 |
 |
 1
provider_profiles
```

Implemented as a one-to-one relationship using a foreign key and unique association. SQLAlchemy models this with `relationship()` and a scalar association.

---

## service_categories

Stores service categories.

Examples:

* Plumbing
* Electrical
* Cleaning
* Tutoring

### Attributes

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| name        | VARCHAR   |
| description | TEXT      |
| created_at  | TIMESTAMP |

---

## services

Provider service listings.

### Attributes

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| provider_id | UUID      |
| category_id | UUID      |
| title       | VARCHAR   |
| description | TEXT      |
| price       | DECIMAL   |
| status      | VARCHAR   |
| created_at  | TIMESTAMP |

### Relationships

```text
Provider
 1
 |
 |
 *
Services
```

```text
Category
 1
 |
 |
 *
Services
```

---

## service_images

Stores images for services.

### Attributes

| Column     | Type |
| ---------- | ---- |
| id         | UUID |
| service_id | UUID |
| image_url  | TEXT |

---

## service_areas

Stores provider coverage areas.

### Attributes

| Column     | Type    |
| ---------- | ------- |
| id         | UUID    |
| service_id | UUID    |
| district   | VARCHAR |
| city       | VARCHAR |

---

## favorites

Stores customer favorite services.

### Attributes

| Column     | Type |
| ---------- | ---- |
| id         | UUID |
| user_id    | UUID |
| service_id | UUID |

---

## bookings

Stores customer bookings.

### Attributes

| Column       | Type      |
| ------------ | --------- |
| id           | UUID      |
| customer_id  | UUID      |
| provider_id  | UUID      |
| service_id   | UUID      |
| booking_date | TIMESTAMP |
| status       | ENUM      |
| notes        | TEXT      |
| created_at   | TIMESTAMP |

### Status Values

```text
pending
accepted
rejected
in_progress
completed
cancelled
```

---

## provider_availability

Provider working schedule.

### Attributes

| Column      | Type    |
| ----------- | ------- |
| id          | UUID    |
| provider_id | UUID    |
| day_of_week | INTEGER |
| start_time  | TIME    |
| end_time    | TIME    |

---

## notifications

Stores system notifications.

### Attributes

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| title      | VARCHAR   |
| message    | TEXT      |
| is_read    | BOOLEAN   |
| created_at | TIMESTAMP |

---

## reviews

Customer reviews.

### Attributes

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| booking_id  | UUID      |
| customer_id | UUID      |
| provider_id | UUID      |
| rating      | INTEGER   |
| comment     | TEXT      |
| created_at  | TIMESTAMP |

---

## payments

Payment records.

### Attributes

| Column         | Type      |
| -------------- | --------- |
| id             | UUID      |
| booking_id     | UUID      |
| amount         | DECIMAL   |
| payment_method | VARCHAR   |
| payment_status | VARCHAR   |
| created_at     | TIMESTAMP |

---

## ai_conversations

Stores AI sessions.

### Attributes

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| user_id    | UUID      |
| created_at | TIMESTAMP |

---

## ai_messages

Stores AI chat messages.

### Attributes

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| conversation_id | UUID      |
| role            | VARCHAR   |
| content         | TEXT      |
| created_at      | TIMESTAMP |

---

## review_summaries

AI-generated review summaries.

### Attributes

| Column      | Type      |
| ----------- | --------- |
| id          | UUID      |
| provider_id | UUID      |
| summary     | TEXT      |
| created_at  | TIMESTAMP |

---

## service_embeddings

Stores vector embeddings for AI search.

### Attributes

| Column     | Type   |
| ---------- | ------ |
| id         | UUID   |
| service_id | UUID   |
| embedding  | VECTOR |

---

# SQLAlchemy Implementation Strategy

Each table should have:

```python
class TableName(Base):
    __tablename__ = "table_name"
```

Primary keys:

```python
id = Column(UUID(as_uuid=True), primary_key=True)
```

Foreign keys:

```python
provider_id = Column(
    UUID(as_uuid=True),
    ForeignKey("users.id")
)
```

Relationships:

```python
provider = relationship(
    "User",
    back_populates="services"
)
```

SQLAlchemy relationships are implemented using foreign keys and `relationship()` mappings between ORM models. Bidirectional relationships commonly use `back_populates`.

---

# Alembic Migration Workflow

Generate migration:

```bash
alembic revision --autogenerate -m "create smart hire schema"
```

Apply migration:

```bash
alembic upgrade head
```

Verify:

```bash
alembic current
```

---

# Module Ownership

| Member   | Tables                                                                 |
| -------- | ---------------------------------------------------------------------- |
| Member 1 | users, provider_profiles                                               |
| Member 2 | service_categories, services, service_images, service_areas, favorites |
| Member 3 | bookings, provider_availability, notifications                         |
| Member 4 | reviews, payments                                                      |
| Member 5 | ai_conversations, ai_messages, review_summaries, service_embeddings    |

---

# Database Development Order

1. users
2. provider_profiles
3. service_categories
4. services
5. bookings
6. reviews
7. notifications
8. payments
9. AI tables

This order minimizes foreign-key dependency issues and allows modules to be integrated incrementally.
