<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Bricolage+Grotesque&weight=800&size=40&duration=3000&pause=1000&color=20C997&center=true&vCenter=true&width=600&lines=Codify+%F0%9F%9A%80;Crack+Every+OA.;Land+Every+Offer." alt="Codify" />

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Live%20Beta-20c997?style=for-the-badge&logoColor=white" />
  <img src="https://img.shields.io/badge/Built%20For-NSUT%20%26%20DTU-007BFF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Placement-Season%202026-f59e0b?style=for-the-badge" />
</p>

<p align="center">
  <a href="https://codify-nine.vercel.app">
    <img src="https://img.shields.io/badge/🌐%20Live%20Demo-codify--nine.vercel.app-20c997?style=flat-square&labelColor=0d1117" />
  </a>
</p>

<br/>

> *The placement prep platform built specifically for NSUT & DTU students.*  
> *Real OA questions. Company intel. Live coding battles. Community-driven.*

<br/>

---

</div>

## 🧠 The Problem

Every year, thousands of NSUT & DTU students prepare for campus placements **completely blind**:

- ❌ No idea what companies actually ask in their OAs
- ❌ Grinding LeetCode with no campus-specific relevance  
- ❌ No single place for CGPA cutoffs, branch eligibility, interview rounds
- ❌ No way to simulate real OA pressure or compete with peers
- ❌ Seniors' OA experiences lost — never documented for juniors

**Codify fixes all of this.**

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📁 PataKaro
**Company Intelligence Archive**

Browse 40+ companies that visit NSUT & DTU with:
- CGPA cutoffs & branch eligibility
- Hiring timelines & OA patterns  
- Location & backlog policies
- Full interview experience threads

</td>
<td width="50%">

### ⚡ IntelliCode
**OA Question Bank**

500+ real OA questions actually asked in campus drives:
- Filtered by company, difficulty, topic
- Monaco-based code editor (VS Code engine)
- Live test case execution (C++, Python, Java)
- AI-powered hints via Gemini

</td>
</tr>
<tr>
<td width="50%">

### ⚔️ CodeCast
**Live 1v1 Coding Battles**

The most unique feature — real-time competitive coding:
- Create a room, share code with friend
- Both code simultaneously on same problem
- Live code sync + battle chat
- Winner decided by test cases passed
- Session persists on page refresh

</td>
<td width="50%">

### 💬 OA Discussion
**Community Forum with Rewards**

Students share OA experiences, juniors learn:
- Post real OA questions & approaches
- Upvote / comment system
- Points & badge system (Rookie → Legend)
- Live leaderboard of top contributors
- Filter by company, difficulty, year

</td>
</tr>
</table>

---

## 🛠 Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

### Auth & APIs
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

</div>

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User Browser                        │
│                                                          │
│  React App (Vercel)                                      │
│  ├── Clerk Auth         → Authentication                 │
│  ├── Monaco Editor      → VS Code-quality editing        │
│  └── Socket.IO Client   → Real-time CodeCast            │
└──────────────┬──────────────────────┬───────────────────┘
               │ REST API             │ WebSocket
               ▼                      ▼
┌──────────────────────────────────────────────────────────┐
│              Express.js Server (Render.com)               │
│                                                           │
│  ├── /api/companies     → PataKaro data                  │
│  ├── /api/questions     → Question bank                  │
│  ├── /api/execute       → Code execution                 │
│  ├── /api/discussion    → Forum posts                    │
│  ├── /api/users         → User profiles & points        │
│  └── Socket.IO Server   → CodeCast rooms                │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                  MongoDB Atlas                            │
│                                                          │
│  Collections: Users · Companies · Questions              │
│               Posts · Submissions · Progress             │
└──────────────────────────────────────────────────────────┘
```

---

## ⚙️ Key Technical Challenges Solved

| Challenge | Problem | Solution |
|-----------|---------|----------|
| **Socket.IO on serverless** | Vercel closes connections after each request, breaking WebSockets | Migrated backend to Render.com which supports persistent connections |
| **Race condition on socket** | `emit('join-room')` fired before socket was connected | Made `connectSocket()` return a Promise that resolves on `connect` event |
| **Session on refresh** | Refreshing mid-battle lost all battle state | Persisted roomId, userId, timer, and chat in `sessionStorage` |
| **MongoDB on serverless** | New DB connection on every request caused timeouts | Startup connection on server boot with Mongoose connection caching |
| **Auth over WebSocket** | Clerk JWT tokens don't work over WebSocket headers | Pass `userId` in Socket.IO event payload, scope all events to rooms |
| **Real-time code sync** | Both players typing simultaneously caused flickering | Debounced emit on keystrokes + read-only Monaco panel for opponent |

---

## 📊 Database Schema

```
Users          Companies         Questions
─────          ─────────         ─────────
clerkId        name              name
email          logo              difficulty
fullName       category          topics[]
points         location          company
badge          cgpaCriteria      rating
streak         branchesAllowed   testCases[]
questionsSolved backlogsPolicy   solutions[]
codeCastWins   interviewExp[]    description

Posts          Progress          Submissions
─────          ────────          ───────────
userId         userId            userId
title          questionId        questionId
content        isSolved          language
company        solvedAt          code
upvotes[]                        verdict
comments[]                       execTimeMs
tags[]
```

---

## 🆚 Codify vs Others

| Feature | Codify | LeetCode | GFG | InterviewBit |
|---------|:------:|:--------:|:---:|:------------:|
| NSUT/DTU specific OA questions | ✅ | ❌ | ❌ | ❌ |
| Company placement intel | ✅ | ❌ | ❌ | ❌ |
| Live 1v1 coding battles | ✅ | ❌ | ❌ | ❌ |
| OA Discussion + rewards | ✅ | ❌ | ❌ | ❌ |
| AI code hints | ✅ | ⚡ Partial | ❌ | ❌ |
| Campus placement calendar | ✅ | ❌ | ❌ | ❌ |
| Free for students | ✅ | ⚡ Partial | ✅ | ⚡ Partial |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Clerk account
- Render.com account (for backend)

### Frontend Setup
```bash
git clone https://github.com/dSAxmonis/codex
cd codex
npm install

# Create .env.local
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=http://localhost:8000
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key

npm start
```

### Backend Setup
```bash
git clone https://github.com/dSAxmonis/codex-backend
cd codex-backend
npm install

# Create .env
MONGODB_URI=your_mongodb_uri
CLERK_SECRET_KEY=your_clerk_secret
FRONTEND_URL=http://localhost:3000
PORT=8000

node server.js
```

---

## 📁 Project Structure

```
codex/                          codex-backend/
├── src/                        ├── routes/
│   ├── components/             │   ├── companies.js
│   │   ├── Landing_page.jsx    │   ├── questions.js
│   │   ├── PublicLanding.jsx   │   ├── codecast.js
│   │   ├── Intern_home.jsx     │   ├── discussion.js
│   │   ├── Questions_page.jsx  │   ├── users.js
│   │   ├── Upsolve.jsx         │   ├── submissions.js
│   │   ├── CodeCast.jsx        │   └── progress.js
│   │   ├── Discussion.jsx      ├── models/
│   │   └── Header.jsx          │   ├── User.js
│   ├── data/                   │   ├── Company.js
│   │   └── question.json       │   └── Question.js
│   └── App.js                  ├── middleware/
│                               │   └── auth.js
│                               └── server.js
```

---

## 👥 Team

Built with 💡 by **NSUT students**, for NSUT & DTU students.

---

## 📄 License

MIT License — free to use, learn from, and build on.

---

<div align="center">

<br/>

**"You can if you think you can."**

<br/>

⭐ Star this repo if Codify helped you crack your OA!

<br/>

![Footer](https://capsule-render.vercel.app/api?type=waving&color=20c997&height=100&section=footer)

</div>
