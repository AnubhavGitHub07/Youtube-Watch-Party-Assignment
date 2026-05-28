# 🎬 Youtube Watch Party

A real-time collaborative YouTube Watch Party platform where users can create rooms, invite friends, synchronize video playback, and manage participants with role-based permissions.

Built with a modern SaaS-style UI and real-time multiplayer architecture using Socket.IO.

---

# 🚀 Live Demo

### Frontend

[ https://youtube-watch-party-assignment.vercel.app/ ]

### Backend

[ https://youtube-watch-party-assignment.onrender.com ]

---

# ✨ Features

* 🔴 Real-time synchronized YouTube playback
* 👥 Create & Join Watch Party rooms
* 🛡️ Role-Based Access Control (RBAC)
* 👑 Host controls playback & moderation
* ⭐ Moderator management system
* 🎥 Real-time play / pause synchronization
* ⏩ Real-time seek synchronization
* 🔗 Shareable room IDs
* ⚡ WebSocket-powered architecture
* 🌌 Futuristic SaaS-style UI


---

# 🧠 Workflow

## 1. User Authentication Flow (MVP)

* User enters username
* User can:

  * Create a room
  * Join an existing room using Room ID

---

## 2. Room Management

* Room creator automatically becomes HOST
* Other users join as PARTICIPANTS
* Host can promote users to MODERATOR

---

## 3. Real-Time Synchronization

Socket.IO handles:

* room joining
* participant updates
* play/pause sync
* seek sync
* video change events
* moderator role updates

---

## 4. RBAC (Role-Based Access Control)

### 👑 HOST

* Full playback control
* Change videos
* Seek timeline
* Promote/Remove moderators

### ⭐ MODERATOR

* Playback control
* Seek control
* Video control

### 👤 PARTICIPANT

* Watch-only access
* Cannot control room playback

---

# 🏗️ Tech Stack

## Frontend

* React
* TypeScript
* Tailwind CSS
* Socket.IO Client
* React Router DOM
* React Player / YouTube Player

---

## Backend

* Node.js
* Express.js
* TypeScript
* Socket.IO

---

## Deployment

* Vercel (Frontend)
* Render (Backend)

---

# 📸 Screenshots

## 🏠 Homepage

<img width="1470" height="802" alt="Screenshot 2026-05-28 at 11 22 54 PM" src="https://github.com/user-attachments/assets/4702307e-d93a-4ee6-83f8-dc5455efbf3c" />


---

## 🎥 Room Page

<img width="1470" height="802" alt="Screenshot 2026-05-28 at 11 24 45 PM" src="https://github.com/user-attachments/assets/07a7b67d-3678-425f-a644-4cac8b5ec9a1" />

---

# ⚙️ Project Structure

```bash
watch-party/
│
├── client/         # Frontend (React + TS)
│
├── server/         # Backend (Node + Socket.IO)
│
└── README.md
```

---

# 🧩 Major Challenges Faced

## 1. React Strict Mode Duplicate Socket Events

### Problem

React 18 Strict Mode caused duplicate room joins and broken event listeners.

### Solution

Implemented symmetric lifecycle cleanup using:

* `join_room`
* `leave_room`
* proper socket cleanup in `useEffect`

---

## 2. Real-Time Playback Synchronization

### Problem

Play/Pause synchronization worked but timeline seeking caused drift between users.

### Solution

Implemented:

* authoritative host playback
* synchronized seek events
* playback drift correction logic

---

## 3. RBAC Permission Management

### Problem

Participants were able to affect shared playback state.

### Solution

Implemented backend permission validation using:

* HOST
* MODERATOR
* PARTICIPANT role hierarchy

---

## 4. Socket.IO Production Deployment

### Problem

Deployment issues caused WebSocket connection failures due to incorrect CORS and environment configuration.

### Solution

Configured:

* dynamic environment variables
* production-safe socket URLs
* Render + Vercel integration

---

## 5. UI Layering & Interaction Issues

### Problem

Animated background overlays blocked input interactions.

### Solution

Fixed using:

* proper z-index hierarchy
* `pointer-events: none`
* layered layout structure

---

# 🔮 Future Improvements

* 💬 Real-time chat system
* 🎤 Voice rooms
* 🎞️ Playlist queue support
* 📺 Multi-platform streaming support
* 🔐 Authentication system
* 🧠 Persistent database storage
* 🌍 Public room discovery

---

# 🛠️ Installation & Setup

## Clone Repository

```bash
git clone <your-repo-url>
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## Backend Setup

```bash
cd server
npm install
npm run dev
```

---

# 🌐 Environment Variables

## Frontend `.env`

```env
VITE_SERVER_URL=http://localhost:5001
```

---

## Backend `.env`

```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

# 📌 Key Engineering Concepts Used

* Real-time systems
* WebSockets
* Multiplayer synchronization
* RBAC architecture
* Socket lifecycle management
* SaaS UI design
* Client-server event architecture
* Production deployment

---

# 👨‍💻 Author

### Anubhav Dwivedi

Built as part of an internship assignment project focused on:

* real-time systems
* scalable frontend architecture
* multiplayer synchronization
* Socket.IO engineering

---
