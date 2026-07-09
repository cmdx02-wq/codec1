# AI LaunchPad - Premium Full-Stack SaaS

AI LaunchPad is a premium startup-style platform designed to help students, freelancers, and small business owners launch and monetize careers utilizing AI automation tools.

---

## 🚀 Tech Stack

### Frontend
- **Next.js 15** (App Router, static imports)
- **React** (Server & client components)
- **Tailwind CSS** (v4 CSS-first design themes)
- **Framer Motion** (hover animations & micro-interactions)
- **Lucide Icons**
- **Canvas-Confetti**

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** database provider
- **Prisma ORM**
- **Bcryptjs** & **JSONWebTokens** (JWT)
- **Multer** (for local avatar storage fallback)

---

## 📂 Project Structure

```
/Users/ayushtrivedi/Desktop/codec/
├── frontend/                  # Next.js 15 Web Application
│   ├── src/
│   │   ├── app/               # App Router pages & assets
│   │   ├── components/        # Shared headers, assistant widget
│   │   ├── context/           # Theme, Auth, and Toast systems
│   │   └── lib/               # HTTP client client
│   └── package.json
│
├── backend/                   # Express API Server
│   ├── src/
│   │   ├── routes/            # CRUD & auth routers
│   │   ├── middleware/        # JWT security checkers
│   │   └── index.ts           # App entry point
│   ├── prisma/
│   │   ├── schema.prisma      # DB Prisma models
│   │   └── seed.ts            # Seeding data
│   └── package.json
│
└── README.md                  # This instructions manual
```

---

## ⚙️ Quick Start Guide

### 1. Prerequisite Database Setup
Ensure you have a running **PostgreSQL** instance. 
Create a database named `ailaunchpad` or modify the connection string.

### 2. Configure Environment Variables
Inside `backend/` create a `.env` file from the example:
```bash
cp backend/.env.example backend/.env
```
Ensure you set your specific `DATABASE_URL` connection credentials, e.g.:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/ailaunchpad?schema=public"
```

### 3. Initialize Database Migrations & Seeds
Inside the `backend` directory, compile the database tables and seed mock data:
```bash
cd backend
# Create migrations and push schema changes to DB
npx prisma db push

# Populate courses, services, and default admin user
npm run db:seed
```

Default developer accounts seeded:
- **Admin**: `admin@ailaunchpad.com` (Password: `password123`)
- **Student**: `student@ailaunchpad.com` (Password: `password123`)

### 4. Running the Development Servers

Run the backend Express service (Port `5001`):
```bash
cd backend
npm run dev
```

Run the frontend Next.js dev compiler (Port `3000`):
```bash
cd frontend
npm run dev
```

---

## 💳 Testing Payments & Sandbox Simulation

If no `STRIPE_SECRET_KEY` or `RAZORPAY_KEY_SECRET` variables are present inside the backend `.env` configuration:
1. When selecting a paid service or course checkout, choose Stripe or Razorpay.
2. The platform will automatically route checkout callbacks to the **Developer gateway simulator**.
3. Click **Authorize Simulated Payment**. This completes the transaction immediately, triggers user enrollments, sends notifications, and generates invoices/certificates.

---

## 📝 Bonus Features Included

- **AI Chat Assistant**: Floating chatbot scout located at bottom-left corner of all pages. Recommends courses based on user prompts.
- **Resume Analyzer**: ATS scorecard rating keyword matches and feedback suggestions.
- **Portfolio Scanner**: Analyzes responsiveness, mobile viewport tags, and loading metrics.
- **Invoice Generator**: Allows compiling dynamic billing templates and printing/saving PDFs.
- **Certificate Exporter**: Generates custom SVG/PDF certificate completion logs once a user completes all course lesson modules.
