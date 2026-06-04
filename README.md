<![CDATA[<div align="center">

# 🎓 Apex Test Portal

### A Modern Test Management & Examination Platform

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Apex Test Portal** is a sleek, dark-themed admin dashboard that lets educators create tests, manage question banks, preview exams, and simulate a real student test-taking experience — all from one place.

---

</div>

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🔐 **Secure Login** | Multi-user authentication with role-based profiles |
| 📊 **Dashboard** | Manage all tests in one place — create, edit, delete, go live |
| 📝 **Test Builder** | Configure subjects, topics, marking schemes, difficulty & time limits |
| ❓ **Question Bank** | Bulk-add single/multiple-choice questions with explanations |
| 👁️ **Live Preview** | See exactly how a test looks before publishing |
| 🎯 **Demo Exam Mode** | Take the test as a student would — timer, navigation, and scoring |

---

## 📸 Screenshots

<div align="center">

### 🔐 Login Page
<img src="docs/screenshots/login.png" alt="Login Page" width="720" />

> Glassmorphism login card with animated gradient accents

---

### 📊 Admin Dashboard
<img src="docs/screenshots/dashboard.png" alt="Dashboard" width="720" />

> Full test management table with status badges, quick actions, and real-time controls

---

### 🎯 Demo Exam Interface
<img src="docs/screenshots/exam.png" alt="Exam Interface" width="720" />

> Student-facing CBT interface with countdown timer, question navigator, and instant scoring

</div>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + JSX |
| **Build Tool** | Vite 8 (lightning-fast HMR) |
| **Routing** | React Router DOM v7 |
| **Forms** | React Hook Form v7 |
| **HTTP Client** | Axios (with custom mock adapter) |
| **Styling** | Vanilla CSS (custom design system) |
| **State** | localStorage (mock database) |

> **Note:** This project uses a fully client-side mock API — no backend server required. All data is persisted in `localStorage`, making it perfect for demos and prototyping.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-username/apex-test-portal.git
cd apex-test-portal

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app will be live at **http://localhost:5173** 🎉

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔑 Demo Credentials

| User ID | Password | Profile |
|---|---|---|
| `vaibhav` | `123456789` | Vaibhav Bhosle |
| `ajinkya` | `123456789` | Ajinkya |

---

## 📁 Project Structure

```
apex-test-portal/
├── public/                  # Static assets
├── docs/
│   └── screenshots/         # README images
├── src/
│   ├── api.js               # Mock API adapter & localStorage database
│   ├── main.jsx             # App entry point
│   ├── App.jsx              # Router configuration & route definitions
│   ├── index.css            # Global design system (dark theme, animations)
│   ├── App.css              # App-level overrides
│   ├── components/
│   │   ├── Navbar.jsx       # Top navigation bar with user avatar & logout
│   │   └── ProtectedRoute.jsx  # Auth guard — redirects unauthenticated users
│   └── pages/
│       ├── LoginPage.jsx       # Authentication screen
│       ├── DashboardPage.jsx   # Test management table + CRUD actions
│       ├── CreateTestPage.jsx  # Multi-step test configuration form
│       ├── AddQuestionsPage.jsx # Bulk question entry with explanations
│       ├── PreviewPage.jsx     # Read-only test preview for admins
│       └── TakeExamPage.jsx    # Full CBT simulation with scoring
├── package.json
├── vite.config.js
└── README.md
```

---

## 📖 Page-by-Page Breakdown

### 1. Login Page (`/login`)
- Clean glassmorphism card with animated gradient border
- User ID + password authentication
- Auto-redirect to dashboard on successful login
- Error toast for invalid credentials

### 2. Dashboard (`/dashboard`)
- Sortable test management table
- Status badges: **Live** (green), **Practice** (blue), **Draft** (amber)
- Quick actions per test: ✏️ Edit · 🗑️ Delete · 👁️ Preview · 🎯 Demo
- "Create New Test" button to start the test builder flow

### 3. Create Test (`/tests/create`)
- Subject → Topic → Sub-topic cascading dropdowns
- Configure: test type, difficulty, marking scheme, time limit
- Form validation via React Hook Form
- Redirects to question entry after creation

### 4. Add Questions (`/tests/:id/questions`)
- Dynamic question form — add as many questions as needed
- Support for **single-choice** and **multiple-choice** types
- Mark correct answers and add detailed explanations
- Bulk save to the question bank

### 5. Preview (`/tests/:id/preview`)
- Read-only view of the full test with all questions
- Shows correct answers highlighted for admin review
- Displays marking scheme and metadata

### 6. Demo Exam (`/take-exam/:id`)
- Full student-facing Computer Based Test (CBT) interface
- ⏱️ Live countdown timer
- 📋 Question navigation sidebar with color-coded status
- 🚩 Flag questions for review
- 📊 Instant score report with right/wrong breakdown after submission

---

## 🎨 Design Philosophy

- **Dark Theme** — Easy on the eyes, modern and professional
- **Glassmorphism** — Frosted-glass card effects with backdrop blur
- **Micro-animations** — Smooth hover transitions, loading spinners, and fade-ins
- **Responsive Layout** — Works on desktop and tablet screens
- **Premium Typography** — Clean font hierarchy with proper spacing

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

```bash
# Fork it, clone it, branch it
git checkout -b feature/awesome-feature

# Make your changes and commit
git commit -m "Add awesome feature"

# Push and open a PR
git push origin feature/awesome-feature
```

---

## 📄 License

This project is [MIT](LICENSE) licensed.

---

<div align="center">

**Built with ❤️ by [Vaibhav Bhosle](https://github.com/your-username)**

⭐ Star this repo if you found it helpful!

</div>
]]>
