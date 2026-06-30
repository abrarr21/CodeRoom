# 🚀 CodeRoom

<div align="center">

A real-time collaborative code editor that enables multiple developers to write, edit, and collaborate on code simultaneously.

Built with **React, Node.js, Express, MongoDB, Socket.IO, and Ace Editor**.

<br/>

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite)

</div>

---

## 📖 Overview

CodeRoom is a collaborative coding platform where multiple users can join the same room and edit code together in real time.

Users can create a room, share a unique room code, invite teammates, and collaborate seamlessly. The application provides live code synchronization, participant management, typing indicators, session restoration, and host controls for an efficient collaborative coding experience.

---

## ✨ Features

### 🏠 Room Management

- Create a room with a unique room code
- Join an existing room using the room code
- Rename room (Host only)
- Close room (Host only)
- Automatic session restoration after page refresh

### 💻 Collaborative Editor

- Real-time collaborative code editing
- Live document synchronization
- JavaScript syntax highlighting
- Auto-completion with Ace Editor
- Delta-based synchronization
- Line-level locking

### 👥 Participant Management

- Live participant list
- Online / Offline status
- Typing indicators
- Host identification
- Remove (Kick) participants (Host only)

### ⚡ Real-Time Communication

- Socket.IO powered communication
- Instant document synchronization
- Live participant updates
- Automatic reconnection
- Connection status indicator

### 💾 Persistence

- MongoDB document storage
- Debounced auto-save
- Automatic document recovery
- Persistent session management

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Real-Time |
|----------|----------|----------|-----------|
| React | Node.js | MongoDB | Socket.IO |
| Vite | Express.js | Mongoose | WebSockets |
| Tailwind CSS | Zod | | |
| Axios | JWT | | |
| Ace Editor | NanoID | | |

---

## 📂 Project Structure

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
│   ├── package.json
│   └── server.js
│
├── package.json
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/abrarr21/CodeRoom.git
cd CodeRoom
```

---

### 2. Install Dependencies

Install root dependencies:

```bash
npm install
```

Install frontend dependencies:

```bash
cd client
npm install
```

Install backend dependencies:

```bash
cd ../server
npm install
```

---

## 🔑 Environment Variables

### Server (`server/.env`)

```env
PORT=5000

CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/coderoom

JWT_SECRET=your_jwt_secret
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000/api

VITE_SOCKET_URL=http://localhost:5000
```

---

## ▶️ Running the Application

Start the backend server:

```bash
cd server
npm run dev
```

Start the frontend application:

```bash
cd client
npm run dev
```

Open your browser and visit:

```text
http://localhost:5173
```

---

## 🌐 REST API

| Method | Endpoint | Description |
| :----- | :------- | :---------- |
| `POST` | `/api/rooms` | Create a new room |
| `POST` | `/api/rooms/join` | Join an existing room |
| `PATCH` | `/api/rooms/:code` | Rename room (Host only) |
| `PATCH` | `/api/rooms/:code/close` | Close room (Host only) |

---

## 🔌 Socket Events

### Client → Server

| Event | Description |
| :---- | :---------- |
| `room:join` | Join a room |
| `room:reconnect` | Restore previous session |
| `doc:delta` | Send document changes |
| `doc:lock-request` | Request a line lock |
| `doc:lock-release` | Release a line lock |
| `presence:typing` | Send typing status |
| `room:rename` | Rename room (Host only) |
| `participant:remove` | Remove a participant (Host only) |
| `room:close` | Close room (Host only) |

### Server → Client

| Event | Description |
| :---- | :---------- |
| `presence:participants` | Update participant list |
| `presence:typing` | Receive typing status |
| `doc:delta-applied` | Synchronize document changes |
| `doc:lock-granted` | Lock granted |
| `doc:lock-denied` | Lock denied |
| `doc:lock-released` | Lock released |
| `participant:removed` | Participant removed |
| `room:renamed` | Room renamed |
| `room:closed` | Room closed |
| `room:error` | Error message |

---

## 🔄 Workflow

1. Create a new room or join an existing one using a room code.
2. Share the room code with other participants.
3. Connect to the room using Socket.IO.
4. Collaborate on the same document in real time.
5. View online participants and typing indicators.
6. Host can rename the room, remove participants, or close the room.
7. Changes are automatically synchronized and persisted to MongoDB.

---

## 👨‍💻 Team

This project was collaboratively developed by:

| Name | Role |
| :--- | :--- |
| **Abrar Ansary** | Full Stack Developer |
| **Siddhant Mul** | Full Stack Developer |
| **Shiva Verma** | Full Stack Developer |

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps us improve the project and build more open-source applications.

---

<div align="center">

Made with ❤️ by **Abrar Ansary**, **Siddhant Mul** & **Shiva Verma**

</div>