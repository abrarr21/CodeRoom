# 🚀 CodeRoom

<div align="center">

A real-time collaborative code editor where developers can create rooms, invite participants using a unique room code, and collaborate on code together in real time.

Built with **React, Node.js, Express, MongoDB, Socket.IO, and Ace Editor**.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-black?style=flat-square&logo=socketdotio)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite)

</div>

---

## 📌 Overview

CodeRoom is a collaborative coding platform that enables multiple users to work on the same code editor simultaneously.

Users can create a room, share the generated room code, and collaborate in real time with live synchronization, participant management, typing indicators, session restoration, and host controls.

The project demonstrates real-world concepts like WebSockets, collaborative editing, MongoDB persistence, and scalable backend architecture.

---

## ✨ Features

### 🏠 Room Management

- Create a room with a unique room code
- Join existing rooms using the room code
- Close room (Host only)
- Automatic session restore after refresh

### 💻 Collaborative Editing

- Real-time code synchronization
- Shared code editor
- JavaScript syntax highlighting
- Auto-completion with Ace Editor
- Delta-based document updates
- Line-level locking

### 👥 Participant Management

- Live participant list
- Online / Offline status
- Typing indicators
- Host identification
- Remove (Kick) participant (Host only)

### ⚡ Real-Time Communication

- Socket.IO powered communication
- Instant code synchronization
- Live participant updates
- Automatic reconnect
- Connection status indicator

### 💾 Data Persistence

- MongoDB document storage
- Debounced auto-save
- Automatic document recovery
- Session persistence

---

## 🛠 Tech Stack

| Frontend | Backend | Database | Real-Time |
|----------|----------|----------|-----------|
| React | Node.js | MongoDB | Socket.IO |
| Vite | Express | Mongoose | WebSockets |
| Tailwind CSS | Zod | | |
| Axios | JWT | | |
| Ace Editor | NanoID | | |

---

# 📁 Project Structure

```text
CodeRoom
│
├── client
│   ├── public
│   ├── src
│   │   ├── api
│   │   ├── components
│   │   ├── pages
│   │   ├── socket
│   │   ├── utils
│   │   ├── App.jsx
│   │   └── appRouter.jsx
│   └── package.json
│
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── socket
│   │   ├── utils
│   │   └── validators
│   ├── server.js
│   └── package.json
│
├── package.json
└── README.md
```

---

# ⚙️ Getting Started

## Clone the Repository

```bash
git clone https://github.com/abrarr21/CodeRoom.git
```

```bash
cd CodeRoom
```

---

## Install Dependencies

### Install Root Dependencies

```bash
npm install
```

### Install Client Dependencies

```bash
cd client
npm install
```

### Install Server Dependencies

```bash
cd ../server
npm install
```

---

# 🔑 Environment Variables

## Server (.env)

```env
PORT=5000

CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/coderoom

JWT_SECRET=your_jwt_secret
```

---

## Client (.env)

```env
VITE_API_URL=http://localhost:5000/api

VITE_SOCKET_URL=http://localhost:5000
```

---

# ▶️ Run Locally

### Start Backend

```bash
cd server
npm run dev
```

---

### Start Frontend

```bash
cd client
npm run dev
```

---

Open your browser and visit

```
http://localhost:5173
```

---

# 🌐 REST API

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/rooms` | Create a new room |
| POST | `/api/rooms/join` | Join an existing room |
| PATCH | `/api/rooms/:code` | Rename room (Host) |
| PATCH | `/api/rooms/:code/close` | Close room (Host) |

---

# 🔌 Socket Events

## Client → Server

| Event | Description |
|--------|-------------|
| `room:join` | Join a room |
| `room:reconnect` | Restore previous session |
| `doc:delta` | Send code changes |
| `doc:lock-request` | Request line lock |
| `doc:lock-release` | Release line lock |
| `presence:typing` | Notify typing status |
| `participant:remove` | Remove participant (Host) |
| `room:close` | Close room (Host) |

---

## Server → Client

| Event | Description |
|--------|-------------|
| `presence:participants` | Update participant list |
| `presence:typing` | Typing indicator |
| `doc:delta-applied` | Sync document changes |
| `doc:lock-granted` | Line lock granted |
| `doc:lock-denied` | Line lock denied |
| `doc:lock-released` | Line lock released |
| `participant:removed` | Participant removed by host |
| `room:closed` | Room closed |
| `room:error` | Error message |

---

# 🔄 How It Works

1. Create a room or join using a room code.
2. Share the room code with your teammates.
3. Participants connect through Socket.IO.
4. Code changes are synchronized in real time.
5. Host can manage participants and close the room.
6. Documents are automatically saved to MongoDB.

---

# 👨‍💻 Team

This project was collaboratively developed by:

| Name | Role |
|------|------|
| **Abrar Ansary** | Full Stack Developer |
| **Siddhant Mul** | Full Stack Developer |
| **Shiva Verma** | Full Stack Developer |

---

## ⭐ Support

If you like this project, consider giving it a **Star ⭐** on GitHub.

It helps us and motivates us to build more projects.

---

<div align="center">

**Built with ❤️ by Abrar Ansary, Siddhant Mul & Shiva Verma**

</div>