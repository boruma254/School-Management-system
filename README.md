## TVET ERP System – The Kisii National Polytechnic

Full-stack institutional ERP for managing students, academics, finance, and dashboards.

### Tech Stack
- **Backend**: Node.js, Express, Prisma, PostgreSQL, JWT, bcrypt
- **Frontend**: React (Vite), Tailwind CSS, Axios, React Router, Context API, PWA
- **Architecture**: REST API, clean layered architecture (controllers, services, routes, middleware)

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Run PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL with the default credentials defined in `docker-compose.yml`.

### 2. Backend Setup (`server/`)

```bash
cd server
npm install
npx prisma migrate dev
npm run dev
```

The backend will start on `http://localhost:5000`.

#### Environment

Copy `.env.example` to `.env` in the project root and adjust values as needed:

```bash
cp .env.example .env
```

Key variables:
- `DATABASE_URL` – PostgreSQL connection string
- `JWT_SECRET`, `JWT_REFRESH_SECRET` – secrets for JWT tokens
- `MPESA_*` – M-Pesa Daraja sandbox configuration

#### Seed Default Admin

```bash
cd server
npx prisma db push
npm run seed
```

This creates a default admin user:
- **Email**: `admin@kisitvet.local`
- **Password**: `Admin@12345`

### 3. Frontend Setup (`client/`)

```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` (Vite default).

### 4. Project Structure

- `server/` – Express API, Prisma models, business logic
- `client/` – React SPA, dashboards, and management pages
- `docker-compose.yml` – PostgreSQL service
- `.env.example` – template for environment variables

### 5. Core Features

- **Auth & RBAC**: JWT-based auth, bcrypt hashing, role-based access (ADMIN, LECTURER, STUDENT, FINANCE)
- **Student Management**: student records, programs, departments, enrollments
- **Academic Module**: units, grades, semesters
- **Finance**: fee structures, payments, M-Pesa STK Push integration (sandbox), receipts
- **Admin Dashboard**: statistics endpoints for students and revenue

