# 🚀 Planora - Event Management Platform

Planora is a full-stack MERN-based event management platform developed to simplify the workflow of organizing, managing, and monitoring events, programs, registrations, coordinators, and analytics through a modern web application.

The platform helps coordinators efficiently manage event operations including participant registration, QR verification, dashboard analytics, reporting, and workflow automation.

---

# 🌟 Project Overview

Planora provides a centralized event management system where administrators and coordinators can:

- Create and manage events
- Organize programs and teams
- Handle participant registrations
- Generate and verify QR codes
- Monitor analytics and reports
- Manage workflows efficiently

The project is built using modern scalable web technologies with responsive UI and backend API integration.

---

# 🧠 Planora Workflow Architecture

```text
                         ╔══════════════╗
                         ║    START     ║
                         ╚══════╦═══════╝
                                ↓
                 ╔══════════════════════════╗
                 ║  USER LOGIN / ACCESS     ║
                 ╚══════════╦═══════════════╝
                            ↓
                 ╔══════════════════════════╗
                 ║   CREATE EVENT / PROGRAM ║
                 ╚══════════╦═══════════════╝
                            ↓
                 ╔══════════════════════════╗
                 ║  ASSIGN COORDINATORS     ║
                 ║      & TEAMS             ║
                 ╚══════════╦═══════════════╝
                            ↓
                 ╔══════════════════════════╗
                 ║ REGISTRATION & FORM DATA ║
                 ╚══════════╦═══════════════╝
                            ↓
                 ╔══════════════════════════╗
                 ║ QR GENERATION & VERIFY   ║
                 ╚══════════╦═══════════════╝
                            ↓
                      ╔════════════╗
                      ║ APPROVED ? ║
                      ╚═════╦══════╝
                            ║
               ╔════════════╩════════════╗
               ║                         ║
              YES                       NO
               ║                         ║
               ↓                         ↓
    ╔════════════════════╗    ╔════════════════════╗
    ║ EVENT DASHBOARD &  ║    ║ MODIFY EVENT DATA  ║
    ║ ANALYTICS TRACKING ║    ╚═════════╦══════════╝
    ╚═════════╦══════════╝              ║
              ↓                         ║
    ╔════════════════════╗              ║
    ║ REPORTS & EXPORTS  ║◄═════════════╝
    ╚═════════╦══════════╝
              ↓
        ╔══════════════╗
        ║    FINISH    ║
        ╚══════════════╝
```

---

# ⚙️ System Architecture

```text
Frontend (React + Tailwind CSS)
              ↓
      API Communication
              ↓
      Node.js + Express
              ↓
   Authentication Middleware
              ↓
        MongoDB Database
              ↓
 QR Processing & Analytics
              ↓
      Dashboard Rendering
```

---

# 🔥 Features

✅ Event & Program Management  
✅ Coordinator & Team Assignment  
✅ QR Code Generation & Verification  
✅ Registration Management  
✅ Dashboard Analytics  
✅ Report Generation  
✅ Authentication & Authorization  
✅ Responsive Modern UI  
✅ Real-time Workflow Management  
✅ MERN Full-Stack Architecture  

---

# 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| React.js | Frontend Development |
| Tailwind CSS | UI Styling |
| Node.js | Backend Runtime |
| Express.js | REST API |
| MongoDB | Database |
| JWT | Authentication |
| QR Libraries | QR Generation |
| Vercel | Frontend Deployment |
| Render | Backend Deployment |

---

# 📂 Project Structure

```bash
PLANORA/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── assets/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── config/
│
├── docs/
├── README.md
└── package.json
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Sabarisekaran/PLANORA__pbl.git
```

---

# Install Dependencies

## Frontend

```bash
cd frontend
npm install
```

## Backend

```bash
cd backend
npm install
```

---

# ▶️ Run Development Server

## Frontend

```bash
npm run dev
```

## Backend

```bash
npm start
```

---

# 🌐 Deployment Workflow

```text
Frontend Development
        ↓
React Build Process
        ↓
Deploy Frontend to Vercel
        ↓
Backend API Deployment
        ↓
Deploy Backend to Render
        ↓
Connect MongoDB Atlas
        ↓
Production Hosting
```

---

# 📸 Core Functionalities

### 📌 Event Management
- Create and manage events
- Program scheduling
- Team coordination

### 📌 Registration System
- Dynamic form handling
- Participant data management
- QR registration workflow

### 📌 QR Verification
- QR generation
- QR scanning & validation
- Attendance tracking

### 📌 Analytics Dashboard
- Event statistics
- Participation tracking
- Performance monitoring

---

# 📚 Learning Outcomes

Through this project, I learned:

- Full-stack MERN development
- REST API architecture
- Authentication systems
- QR-based workflow integration
- Dashboard analytics implementation
- Frontend & backend deployment
- Scalable project structure
- Real-world workflow management

---

# 🚀 Future Improvements

- AI-based analytics
- Notification system
- Real-time event tracking
- Mobile responsive enhancements
- Advanced reporting
- Cloud scaling support

---

# 👨‍💻 Author

## Sabari Sekaran
B.Tech Artificial Intelligence & Data Science Student

🔗 LinkedIn:
https://www.linkedin.com/in/sabari-sekaran-mu-9238032a3/
