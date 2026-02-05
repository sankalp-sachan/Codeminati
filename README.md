# <p align="center">🕵️‍♂️ Codeminati</p>

<p align="center">
  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" width="100%" />
</p>

<p align="center">
  <strong>A Real-Time DSA Contest & Hackathon Hosting Platform</strong>
</p>

<p align="center">
  Built for Universities • Tech Fests • Coding Clubs • Hiring Challenges
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
</p>

---

## 🚀 What is Codeminati?

Codeminati is a production-grade competitive programming platform designed to conduct **live coding contests, private hackathons, and DSA practice** in a secure, real-time environment.

It replicates the experience of professional coding platforms while giving organizers complete control over participants, problems, and performance tracking.

---

## 🧠 Core Principle

> A problem solved during a contest or hackathon is **never** marked as solved in the global problem set.

This guarantees:
- Fair competition
- Accurate leaderboards
- No practice data leakage
- True contest integrity

---

## ✨ Platform Highlights

### 👥 Role-Based Access

| Role | Capabilities |
|------|--------------|
| Admin | Manage contests, problems, users, analytics |
| Judge | Monitor submissions, validate problems |
| Volunteer / Assistant | Support participants in real time |
| User | Participate, code, compete, track rank |

---

### 💻 Competitive Environment

- Monaco powered online code editor
- Multi-language support with syntax highlighting
- Real-time contest timer and announcements
- Dynamic leaderboard updates using Socket.io
- Secure code execution with verdict system
- Anti-cheat session monitoring

---

### 🔐 Authentication & Security

- Email OTP verification
- Google OAuth login
- JWT based authentication
- Protected routes and rate limiting

---

### 📊 Analytics & Insights

- Visual performance charts
- Submission history tracking
- Contest and leaderboard analytics

---

## 🏗️ System Architecture

```
React Frontend
      ↓
Express Backend API
      ↓
MongoDB Database
      ↓
Judge Engine + Socket.io (Real-time)
```

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS
- Framer Motion
- Socket.io Client
- Recharts

**Backend**
- Node.js & Express
- MongoDB & Mongoose
- JWT Authentication
- Nodemailer OTP Service
- Google OAuth
- Helmet & Rate Limiter

---

## 🧪 How the Judge Works

1. User submits code
2. Code runs against hidden test cases
3. Output is verified
4. Verdict is stored
5. Leaderboard updates instantly during contests

---

## 🎯 Ideal Use Cases

Codeminati is perfect for:

- University Tech Fests
- Coding Clubs
- Placement Cells
- Hiring Challenges
- Private Hackathons
- Weekly DSA Contests

---

## 🤝 Contributing

Contributions are welcome. Fork the repository, make improvements, and open a pull request.

---

## ⚖️ License

ISC License

---

<p align="center">
Made with ❤️ by Sankalp Sachan
</p>
