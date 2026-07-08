# 🏢 Milestone — Full-Stack HR Management Platform

> A modern, enterprise-grade Human Resource Management System built with **Next.js 16**, **PostgreSQL**, and **Prisma 7**. Milestone streamlines every aspect of people operations — from goals and performance tracking to payroll, recruitment, and beyond.

---

## ✨ Features

| Module | Description |
|---|---|
| **📊 Dashboard** | Role-based analytics with KPI cards, charts, and quick actions |
| **🎯 Goals & Performance** | OKR-style goal setting with review cycles, check-ins, weightage scoring, and manager approvals |
| **👥 People Directory** | Searchable employee directory with detailed profiles and department filtering |
| **🏗️ Org Chart** | Interactive organizational hierarchy visualization |
| **🏖️ Leave Management** | Leave requests, approvals, balance tracking, and calendar views |
| **⏰ Attendance** | Clock in/out, daily logs, and time tracking |
| **💰 Payroll & Payslips** | Salary structures, allowances/deductions, payslip generation |
| **📄 Recruitment (ATS)** | Job postings, candidate pipeline tracking (Applied → Screening → Interview → Offer → Hired) |
| **🚀 Onboarding** | Template-based onboarding task checklists for new hires |
| **📁 Documents** | Employee document vault with categorized uploads (ID proof, contracts, certificates) |
| **🔔 Notifications** | Real-time notification system for approvals, status changes, and assignments |
| **📈 Reports** | Comprehensive HR analytics and reporting |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) — App Router, React Server Components, Server Actions |
| **Language** | TypeScript |
| **Database** | PostgreSQL 16 |
| **ORM** | [Prisma 7](https://www.prisma.io) with driver adapters (`@prisma/adapter-pg`) |
| **Authentication** | [Auth.js v5](https://authjs.dev) — Credentials provider, JWT sessions, bcrypt hashing |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) with custom design tokens |
| **UI Components** | [Radix UI](https://www.radix-ui.com) primitives + custom design system |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Charts** | [Recharts](https://recharts.org) |
| **File Storage** | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) (production) / local fallback (dev) |
| **Email** | [Resend](https://resend.com) (production) / console-logged links (dev) |
| **Icons** | [Lucide React](https://lucide.dev) |

---

## 📁 Project Structure

```
milestone/
├── prisma/
│   ├── schema.prisma        # Database schema (14 models)
│   ├── migrations/          # SQL migration history
│   └── seed.ts              # Demo data seeder
├── src/
│   ├── actions/             # Server Actions (auth, CRUD operations)
│   ├── app/
│   │   ├── (auth)/          # Login / auth pages
│   │   ├── (dashboard)/     # Protected dashboard routes
│   │   │   ├── attendance/
│   │   │   ├── dashboard/
│   │   │   ├── directory/
│   │   │   ├── documents/
│   │   │   ├── goals/
│   │   │   ├── leave/
│   │   │   ├── notifications/
│   │   │   ├── onboarding/
│   │   │   ├── org-chart/
│   │   │   ├── payroll/
│   │   │   ├── payslips/
│   │   │   ├── recruitment/
│   │   │   └── reports/
│   │   └── (public)/        # Public-facing pages
│   ├── auth.ts              # Auth.js configuration
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities, Prisma client, validations
│   └── types/               # TypeScript type definitions
├── docker-compose.yml       # PostgreSQL container
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Docker** (for PostgreSQL) or a remote PostgreSQL instance
- **npm** (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/milestone.git
cd milestone
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL 16 on port `5435` with credentials defined in `docker-compose.yml`.

### 3. Configure environment

```bash
cp .env.example .env
```

The defaults work with the Docker Compose setup. Adjust `DATABASE_URL` if using a remote database.

### 4. Install dependencies

```bash
npm install
```

### 5. Generate Prisma Client & run migrations

```bash
npx prisma generate
npx prisma migrate dev
```

### 6. Seed demo data

```bash
npx prisma db seed
```

### 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Demo Accounts

All demo accounts use the password: **`milestone123`**

| Email | Role | Description |
|---|---|---|
| `admin@milestone.app` | **Admin** | Full system access — manage users, payroll, recruitment, reports |
| `taylor@milestone.app` | **Manager** | Team management — approve goals, leave requests, view reports |
| `aditya@milestone.app` | **Employee** | Individual access — set goals, request leave, view payslips |
| `atul@milestone.app` | **Employee** | Individual access — set goals, request leave, view payslips |

---

## 🗄️ Database Schema

The application uses **14 Prisma models** organized into domains:

- **Auth & Identity** — `User`, `PasswordResetToken`
- **Core HR** — `Employee`, `Department`
- **Goals & Performance** — `Goal`, `GoalCheckIn`, `ReviewCycle`
- **Leave** — `LeaveRequest`, `LeaveBalance`, `LeaveType`
- **Attendance** — `AttendanceEntry`
- **Payroll** — `SalaryStructure`, `Payslip`
- **Recruitment** — `JobPosting`, `Candidate`
- **Onboarding** — `OnboardingTemplate`, `OnboardingTaskTemplate`, `OnboardingTaskInstance`
- **Documents** — `Document`
- **Notifications** — `Notification`
- **Audit** — `AuditLog`

---

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to [Vercel](https://vercel.com).
2. Set up a managed PostgreSQL provider (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com)).
3. Add these environment variables in Vercel:

   | Variable | Description |
   |---|---|
   | `DATABASE_URL` | Pooled PostgreSQL connection string |
   | `DIRECT_URL` | Direct connection string (for migrations) |
   | `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
   | `AUTH_URL` | Your deployment URL |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob token |
   | `RESEND_API_KEY` | Resend email API key |

4. Set the build command:
   ```
   prisma generate && prisma migrate deploy && next build
   ```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
