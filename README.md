# ⚡ CyberPulse - Full-Stack Project Management Tool
> **CodeAlpha Internship — Full Stack Development (Task 3)**  
> Built with **React 18**, **Node.js / Express**, **MySQL Database**, and **Socket.io WebSockets**.

![Design Theme](https://img.shields.io/badge/Theme-Cyber_Violet_%26_Crimson-8b5cf6?style=for-the-badge)
![Database](https://img.shields.io/badge/Database-MySQL_Primary-f43f5e?style=for-the-badge)
![Realtime](https://img.shields.io/badge/WebSockets-Socket.io_Active-10b981?style=for-the-badge)

---

## 🌟 Features Overview

### 1. 📋 Interactive Kanban Boards & Cards
- **5 Dynamic Workflow Columns:** `Backlog`, `To Do`, `In Progress`, `In Review`, and `Completed`.
- **HTML5 Drag & Drop:** Fluid card dragging with column highlight borders and drop target feedback.
- **Quick-Shift Arrow Actions:** 1-click status transitions on cards for touch & mobile devices.
- **Priority Badges:** Vibrant visual tiers — `Urgent` (Crimson), `High` (Orange), `Medium` (Violet), and `Low` (Slate).
- **Due Dates & Overdue Alerts:** Calendar badges highlighting active vs overdue deadlines.

### 2. ⚡ Real-Time WebSockets Sync (Bonus Implemented!)
- Powered by **Socket.io**.
- Room-scoped WebSocket events (`project:join`, `task:created`, `task:moved`, `task:updated`, `comment:added`).
- Live updates across multiple browser windows without needing to refresh!

### 3. 👥 Task Assignment & Team Management
- Assign tasks to specific teammates with member avatars, names, and professional roles.
- Add new members to projects directly from the dashboard.
- Unassigned badge and filter support.

### 4. 💬 Live Task Commenting & Discussion Thread
- Task detail modal features a complete discussion thread.
- User avatars, relative timestamps, and deletion permissions for comment authors.
- Real-time broadcast of new comments to peers.

### 5. 📊 Multiple Workspace Views
- **📌 Kanban Board View:** Visual sprint workflow.
- **📋 List Table View:** Structured table with inline status and priority selectors.
- **📈 Project Analytics View:** Overall sprint completion gauge (%), status distribution charts, priority breakdown, and individual team workload metrics.

### 6. 🎨 Cyber Violet & Crimson Design System (Zero Blue)
- Custom obsidian & deep graphite palette (`#0a0a0f`, `#151520`) with Electric Neon Violet (`#8b5cf6`) and Vivid Crimson (`#f43f5e`).
- 100% non-blue color direction as requested.
- Seamless Dark Mode & Crisp Light Mode toggle.

### 7. 🗄️ MySQL Database Engine
- Auto-initializes database `codealpha_project_management_db` on MySQL Server `localhost:3306`.
- Automatically migrates 6 tables: `users`, `projects`, `project_members`, `tasks`, `comments`, and `activity_logs`.
- Pre-seeds demo projects, users, tasks, and discussion threads.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:5001
# Socket.io listening on ws://localhost:5001
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

### 3. Demo Login Credentials (1-Click Buttons Available on Sign In)
- **Satyam Pal (Project Lead):** `satyam@example.com` / `password123`
- **Alex Rivera (Frontend Engineer):** `alex@example.com` / `password123`
- **Priya Sharma (Backend Architect):** `priya@example.com` / `password123`
