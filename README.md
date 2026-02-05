# Experiences Marketplace Backend

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-unknown-lightgrey)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![Express](https://img.shields.io/badge/express-4.x-black)
![PostgreSQL](https://img.shields.io/badge/postgresql-15.x-blue)
![PG](https://img.shields.io/badge/pg-8.x-blue)
![JWT](https://img.shields.io/badge/jwt-9.x-blue)
![bcrypt](https://img.shields.io/badge/bcrypt-5.x-orange)
![express-validator](https://img.shields.io/badge/express--validator-7.x-brightgreen)
![dotenv](https://img.shields.io/badge/dotenv-16.x-yellowgreen)

## Table of Contents
- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Seeding](#seeding)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [cURL Examples](#curl-examples)
- [RBAC Rules](#rbac-rules)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)
- [Health Check](#health-check)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Contact](#contact)

## Project Overview
This REST API powers an Experiences Marketplace with secure authentication, host-managed experiences, public browsing, bookings, and admin moderation.

Key features:
- JWT-based authentication
- Role-based access control (user, host, admin)
- Experience creation, publishing, and moderation
- Public experience listing with filters
- Booking workflow with duplicate prevention
- Validation and consistent error handling

## Architecture
Folder structure:
```
src/
├── app.ts
├── server.ts
├── routes/
├── controllers/
├── services/
├── middlewares/
├── validators/
├── db/
├── utils/
└── types/
```

Design decisions:
- Raw SQL via `pg` for clarity and performance
- Layered structure for separation of concerns
- Validation middleware to keep controllers clean

## Tech Stack
- Node.js (>= 18)
- TypeScript (strict mode)
- Express.js
- PostgreSQL
- jsonwebtoken
- bcrypt
- express-validator
- dotenv

## Prerequisites
- Node.js 18+
- PostgreSQL 13+

## Installation
1. Clone the repo:
   ```bash
   git clone https://github.com/Arbab-ofc/experiences-marketplace-backend.git
   cd experiences-marketplace-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a database:
   ```sql
   CREATE DATABASE experiences_db;
   ```
4. Configure environment variables (see below)
5. Run migrations:
   ```bash
   npm run migrate
   ```
6. Start the server:
   ```bash
   npm run dev
   ```

## Seeding
Populate the database with sample users and experiences:
```bash
npm run seed
```
Seeded accounts (password: `Test1234`):
- admin@test.com (admin)
- host@test.com (host)
- user@test.com (user)

## Environment Variables
Create a `.env` file:
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/experiences_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

## Database Schema
Tables:
- users
- experiences
- bookings

Relationships (Mermaid):
```mermaid
erDiagram
  USERS ||--o{ EXPERIENCES : hosts
  USERS ||--o{ BOOKINGS : books
  EXPERIENCES ||--o{ BOOKINGS : includes
```

Constraints and indexes are defined in `src/db/schema.sql`.

## API Documentation

### POST /auth/signup
Create a new user account.

Auth required: No

Request Body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "user"
}
```

Success Response (201):
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

Error Response (400):
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "status": 400
  }
}
```

cURL:
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","role":"user"}'
```

### POST /auth/login
Authenticate a user.

Auth required: No

Request Body:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

Success Response (200):
```json
{
  "success": true,
  "data": {
    "token": "<jwt>",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

Error Response (401):
```json
{
  "success": false,
  "error": {
    "message": "Invalid credentials",
    "status": 401
  }
}
```

cURL:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

### GET /auth/me
Get the current authenticated user.

Auth required: Yes
Role required: any

Success Response (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

Error Response (401):
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "status": 401
  }
}
```

cURL:
```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <token>"
```

### GET /health
Health check.

Auth required: No

Success Response (200):
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": 1700000000000
}
```

Error Response (503):
```json
{
  "status": "error",
  "database": "disconnected"
}
```

cURL:
```bash
curl http://localhost:3000/health
```

### POST /experiences
Create an experience.

Auth required: Yes
Role required: host

Request Body:
```json
{
  "title": "Cooking Class",
  "description": "Learn Italian cooking",
  "location": "Rome",
  "price": 50,
  "start_time": "2026-03-01T10:00:00Z",
  "end_time": "2026-03-01T13:00:00Z"
}
```

Success Response (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "host_id": 1,
    "title": "Cooking Class",
    "description": "Learn Italian cooking",
    "location": "Rome",
    "price": "50.00",
    "start_time": "2026-03-01T10:00:00.000Z",
    "end_time": "2026-03-01T13:00:00.000Z",
    "status": "draft"
  }
}
```

Error Response (403):
```json
{
  "success": false,
  "error": {
    "message": "Forbidden",
    "status": 403
  }
}
```

cURL:
```bash
curl -X POST http://localhost:3000/experiences \
  -H "Authorization: Bearer <host_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Cooking Class","description":"Learn Italian cooking","location":"Rome","price":50,"start_time":"2026-03-01T10:00:00Z","end_time":"2026-03-01T13:00:00Z"}'
```

### PATCH /experiences/:id/publish
Publish an experience.

Auth required: Yes
Role required: host (owner)

Success Response (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "published"
  }
}
```

Error Response (409):
```json
{
  "success": false,
  "error": {
    "message": "Only draft experiences can be published",
    "status": 409
  }
}
```

cURL:
```bash
curl -X PATCH http://localhost:3000/experiences/1/publish \
  -H "Authorization: Bearer <host_token>"
```

### PATCH /experiences/:id/block
Block an experience.

Auth required: Yes
Role required: admin

Success Response (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "blocked"
  }
}
```

Error Response (404):
```json
{
  "success": false,
  "error": {
    "message": "Experience not found",
    "status": 404
  }
}
```

cURL:
```bash
curl -X PATCH http://localhost:3000/experiences/1/block \
  -H "Authorization: Bearer <admin_token>"
```

### GET /experiences
List published experiences.

Auth required: No

Query params:
- location
- start_date
- end_date
- page
- limit
- sort (start_time or -start_time)

Success Response (200):
```json
{
  "success": true,
  "data": {
    "experiences": [],
    "pagination": { "page": 1, "limit": 10, "total": 0 }
  }
}
```

Error Response (400):
```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "status": 400
  }
}
```

cURL:
```bash
curl "http://localhost:3000/experiences?location=Rome&sort=-start_time"
```

### POST /experiences/:id/book
Book an experience.

Auth required: Yes
Role required: user

Success Response (201):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 2,
    "experience_id": 5,
    "status": "confirmed"
  }
}
```

Error Response (409):
```json
{
  "success": false,
  "error": {
    "message": "Booking already exists",
    "status": 409
  }
}
```

cURL:
```bash
curl -X POST http://localhost:3000/experiences/1/book \
  -H "Authorization: Bearer <user_token>"
```

### GET /bookings
List current user bookings.

Auth required: Yes
Role required: any

Success Response (200):
```json
{
  "success": true,
  "data": []
}
```

Error Response (401):
```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "status": 401
  }
}
```

cURL:
```bash
curl http://localhost:3000/bookings \
  -H "Authorization: Bearer <user_token>"
```

### GET /test/admin-only
Test admin access.

Auth required: Yes
Role required: admin

Success Response (200):
```json
{
  "success": true,
  "data": { "message": "admin access granted" }
}
```

Error Response (403):
```json
{
  "success": false,
  "error": {
    "message": "Forbidden",
    "status": 403
  }
}
```

cURL:
```bash
curl http://localhost:3000/test/admin-only \
  -H "Authorization: Bearer <admin_token>"
```

## cURL Examples
Full set of endpoint cURL commands (copy-paste ready):
```bash
# Health
curl http://localhost:3000/health

# Signup
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!","role":"user"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# Auth me
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer <token>"

# Create experience (host)
curl -X POST http://localhost:3000/experiences \
  -H "Authorization: Bearer <host_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Cooking Class","description":"Learn Italian cooking","location":"Rome","price":50,"start_time":"2026-03-01T10:00:00Z","end_time":"2026-03-01T13:00:00Z"}'

# Publish experience
curl -X PATCH http://localhost:3000/experiences/1/publish \
  -H "Authorization: Bearer <host_token>"

# Block experience (admin)
curl -X PATCH http://localhost:3000/experiences/1/block \
  -H "Authorization: Bearer <admin_token>"

# List experiences (public)
curl "http://localhost:3000/experiences?location=Rome&start_date=2026-03-01&end_date=2026-03-31&page=1&limit=10&sort=-start_time"

# Book experience (user)
curl -X POST http://localhost:3000/experiences/1/book \
  -H "Authorization: Bearer <user_token>"

# User bookings
curl http://localhost:3000/bookings \
  -H "Authorization: Bearer <user_token>"

# Admin-only test route
curl http://localhost:3000/test/admin-only \
  -H "Authorization: Bearer <admin_token>"
```

## RBAC Rules
Role hierarchy:
- admin
- host
- user

Permissions matrix:
| Action | user | host | admin |
| --- | --- | --- | --- |
| Signup/login | yes | yes | yes |
| Create experience | no | yes | yes |
| Publish experience | no | owner | yes |
| Block experience | no | no | yes |
| Book experience | yes | no | yes |

## Error Handling
Error response format:
```json
{
  "success": false,
  "error": {
    "message": "...",
    "status": 400
  }
}
```

Common codes:
- 400 validation and bad input
- 401 unauthorized
- 403 forbidden
- 404 not found
- 409 conflict
- 500 server error

## Testing
Run tests:
```bash
npm test
```

## Deployment
Production considerations:
- Set strong `JWT_SECRET`
- Use SSL for database connections
- Run migrations before starting the app

## Health Check
Endpoint:
- `GET /health`

Monitors:
- Database connectivity
- Server uptime (timestamp)

## Troubleshooting
- If `npm run dev` fails with DB errors, confirm `DATABASE_URL` and that Postgres is running.
- If JWT errors occur, confirm `JWT_SECRET` matches the issuing environment.
- For migration errors, ensure the database exists and the user has permissions.

## Contributing
- Commit messages follow Conventional Commits
- One step per commit per roadmap

## Contact
- GitHub: https://github.com/Arbab-ofc
- Website: https://www.arbabofc.me
- Email: mailto:arbabprvt@gmail.com
