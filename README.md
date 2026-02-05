# <p align="center">🕵️‍♂️ Codeminati</p>

<p align="center">
  <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" alt="Codeminati Banner" width="100%">
</p>

<p align="center">
  <strong>The Ultimate Real-Time DSA Hackathon & Contest Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white" />
</p>

---

## 🚀 Overview

**Codeminati** is a production-ready, full-stack platform designed for hosting high-stakes coding contests and DSA hackathons. It combines a seamless, low-latency user experience with robust administrative controls, real-time leaderboards, and a secure code execution environment.

Whether you're organizing a university tech fest or a corporate hiring challenge, Codeminati provides all the tools needed to manage participants, problems, and performance metrics in real-time.

---

## ✨ Key Features

### 👤 User Roles
-   **Admin**: Full control over contests, problems, users, and platform analytics.
-   **Judge**: Review submissions, manage specific contest problems, and ensure fairness.
-   **Volunteer/Assistant**: Real-time monitoring and participant assistance.
-   **User**: Participate in contests, solve problems, and track progress.

### 💻 Core Functionality
-   **Online Code Editor**: Integrated **Monaco Editor** with support for multiple languages, syntax highlighting, and auto-completion.
-   **Real-Time Contests**: Synchronized timers, live announcements, and dynamic problem unlocking.
-   **Live Leaderboard**: Real-time ranking updates using **Socket.io** for instant competitive feedback.
-   **OTP Authentication**: Secure login with email verification powered by **Nodemailer**.
-   **Google OAuth**: Quick and secure sign-in with Google integration.
-   **Anti-Cheat Measures**: Real-time monitoring and session management to ensure integrity.
-   **Detailed Analytics**: Visualized performance stats using **Recharts**.

---

## 🛡️ Tech Stack

### Frontend
-   **Vite + React 19**: Lightning-fast development and optimized production builds.
-   **Tailwind CSS 4**: Modern, utility-first styling for a sleek, responsive UI.
-   **Framer Motion**: Smooth micro-animations and transitions.
-   **Lucide React**: Beautiful, consistent iconography.
-   **Socket.io Client**: Real-time bi-directional communication.

### Backend
-   **Node.js & Express.js**: Scalable and performant server architecture.
-   **MongoDB & Mongoose**: Flexible document-based data storage.
-   **JWT & Cookie-Parser**: Secure session-based and token-based authentication.
-   **Google Auth Library**: Enterprise-grade OAuth implementation.
-   **Helmet & Rate Limiter**: Enhanced security and protection against brute-force attacks.

---

## 🛠️ Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   MongoDB Atlas or local instance
-   Gmail App Password (for OTP services)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/sankalp-sachan/Codeminati.git
    cd Codeminati
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    npm install
    ```
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_uri
    JWT_SECRET=your_secret_key
    EMAIL_USER=your_email
    EMAIL_PASS=your_app_password
    GOOGLE_CLIENT_ID=your_google_client_id
    ```
    Start the backend:
    ```bash
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    ```
    Start the frontend:
    ```bash
    npm run dev
    ```

---

## 📸 Screenshots

| Dashboard | Contest Page | Leaderboard |
| :---: | :---: | :---: |
| ![Dashboard Placeholder](https://via.placeholder.com/300x200?text=Dashboard) | ![Contest Placeholder](https://via.placeholder.com/300x200?text=Contest+UI) | ![Leaderboard Placeholder](https://via.placeholder.com/300x200?text=Real-time+Leaderboard) |

---

## 🤝 Contributing

We welcome contributions! If you'd like to improve Codeminati, please follow these steps:
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚖️ License

Distributed under the ISC License. See `LICENSE` for more information.

---

<p align="center">Made with ❤️ by the Codeminati Team</p>
