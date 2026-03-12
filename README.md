# Dopely 🚀

Dopely is an AI-powered productivity assistant specifically designed for individuals with ADHD. It helps users overcome task initiation hurdles, executive dysfunction, and overwhelm through AI-driven task breakdowns, focus modes, and gamified rewards.

## 🔗 Live Links
- **Frontend (Dopely App)**: [https://client-surajpandey76s-projects.vercel.app/](https://client-surajpandey76s-projects.vercel.app/)
- **Backend API**: [https://server-steel-eta.vercel.app/](https://server-steel-eta.vercel.app/)

---

## ✨ Features
- **AI Task Breakdown**: Turn overwhelming goals into manageable, step-by-step subtasks.
- **Focus Mode**: Distraction-free timer with XP and Coin rewards to gamify productivity.
- **Panic Mode**: Quick-access tools for when you feel overwhelmed.
- **Gamified Progress**: Level up, earn coins, and maintain streaks.
- **Admin Dashboard**: Real-time monitoring of user activity and engagement.
- **Body Doubling**: Focus rooms for collaborative productivity.

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Framer Motion, Lucide-React, Vanilla CSS.
- **Backend**: Node.js, Express, PostgreSQL (Neon).
- **Authentication**: JWT-based auth with OTP (One-Time Password) verification.
- **Deployment**: Vercel (both Client and Server).
- **Database**: Prisma/Neon Postgres.

---

## 📂 Project Structure
```text
adhd-project/
├── client/             # React frontend (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components (Sidebar, etc.)
│   │   ├── pages/      # Application views (Dashboard, Focus, etc.)
│   │   ├── context/    # Auth and Global state
│   │   └── assets/     # Images and logos
├── server/             # Express backend
│   ├── src/
│   │   ├── routes/     # API endpoints (Auth, Tasks, Focus, etc.)
│   │   ├── middleware/ # Auth & error handling
│   │   ├── utils/      # Mailer, helpers
│   │   └── database.js # Database connection (Prisma/Neon)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Neon.tech recommended)
- Vercel CLI (for deployment)

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd adhd-project
```

### 2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secret_key"
PORT=5000
```
Run the server:
```bash
npm start
```

### 3. Setup Frontend
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL="http://localhost:5000"
```
Run the client:
```bash
npm run dev
```

---

## 📡 API Documentation (Summary)

### Authentication (`/api/auth`)
- `POST /send-otp`: Sends a 6-digit verification code to the user's email.
- `POST /register`: Register a new user with OTP verification.
- `POST /login`: Standard email/password login.
- `GET /me`: Get current authenticated user details.

### Tasks & Goals (`/api/tasks`)
- `GET /`: Fetch all tasks for the current user.
- `POST /`: Create a new main goal.
- `PUT /:id`: Update task status or title.
- `DELETE /:id`: Remove a task.

### AI Engine (`/api/ai`)
- `POST /breakdown`: Uses AI-style templates to break down a goal into subtasks.

### Focus Sessions (`/api/focus`)
- `POST /start`: Start a new focus session.
- `PUT /:id/end`: End session and calculate earned XP/Coins.
- `GET /stats`: Get historical focus data.

### Admin (`/api/admin`)
- `POST /login`: Admin-specific login.
- `GET /users`: Monitor all active users and their current activities.
- `POST /notify`: Send real-time notifications to users.

---

## 📝 License
Built with ❤️ for the ADHD community.
Support: `support.focusflow@gmail.com`
