

---

# 🚍 Advance Bus Tracking System

A real-time college bus tracking web application that allows students to monitor live bus locations on an interactive map.

Built using Node.js, Express, MongoDB, Passport.js, Socket.io, EJS, TailwindCSS, and Leaflet.js.

## 🌐 Live Demo

🔗 Live Application:  https://advance-bus-tracking-deployment.onrender.com/

---

## 📌 Overview

This project enables real-time bus location tracking inside a college campus.
Drivers can securely log in and update live bus locations, while students can monitor movement instantly through an interactive map interface.

---

## ✨ Features

* 🔴 Real-time bus tracking using Socket.io
* 🗺️ Interactive map integration with Leaflet.js
* 🔐 Secure driver authentication using Passport.js
* 👨‍✈️ Driver dashboard for bus status management
* 📍 Live GPS-based location updates
* 🚌 Multiple bus tracking support
* 💾 MongoDB data management with Mongoose
* 📱 Fully responsive UI using TailwindCSS
* ⚡ Server-side rendering using EJS

---

## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Passport.js
* Express-Session
* Connect-Mongo
* Socket.io
* bcryptjs

### Frontend

* EJS
* TailwindCSS
* Leaflet.js
* Vanilla JavaScript

---

## 📁 Project Structure

```
advance_bus_tracking/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   └── dashboardController.js
│   └── trackingController.js
│
├── models/
│   ├── Driver.js
│   └── Bus.js
│
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   └── trackingRoutes.js
│
├── socket/
│   └── socketHandler.js
│
├── views/
│   ├── driver/
│   ├── dashboard.ejs
│   ├── map.ejs
│   └── layout.ejs
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── .env
├── server.js
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/advance_bus_tracking.git
cd advance_bus_tracking
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

---

### 4️⃣ Run the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Visit:

```
http://localhost:3000
```

---

## 🔄 Real-Time Communication Flow

1. Driver logs in securely.
2. Driver dashboard sends location updates via Socket.io.
3. Server receives and broadcasts updated location.
4. Connected students receive updates instantly.
5. Leaflet map updates bus marker position dynamically.

---

## 🔐 Authentication System

* Passport Local Strategy
* Password hashing using bcryptjs
* Session-based authentication
* Protected dashboard routes
* Flash messaging for login feedback

---

## 🗺️ Map Integration (Leaflet.js)

* OpenStreetMap tile layer
* Real-time marker movement
* Dynamic route visualization
* Live socket event-based updates

---

## 📸 Application Screenshots

### 🖥️ Desktop View


<p align="center"> <img width="1905" height="946" alt="Screenshot 2025-11-01 120350" src="https://github.com/user-attachments/assets/86ca167a-792a-4bf1-a375-be32accd6c3f" /> </p>
<p align="center"> <img width="1919" height="942" alt="Screenshot 2025-11-01 120013" src="https://github.com/user-attachments/assets/7ae271aa-3fbe-4a6d-a49f-224da0faa4af" /> </p>
<p align="center"> <img width="1919" height="855" alt="Screenshot 2025-11-17 211323" src="https://github.com/user-attachments/assets/d60ac28f-cfa5-4607-9618-644459d48103" /> </p>

---

### 📱 Responsive View

 <p align="center"> <img width="423" height="835" alt="Screenshot 2025-11-01 115204" src="https://github.com/user-attachments/assets/d1cddcd5-59ed-4f60-bb0e-04e09cf599da" /> </p>
<p align="center"> <img width="425" height="837" alt="Screenshot 2025-11-01 114037" src="https://github.com/user-attachments/assets/3c3956db-ad9f-401b-8151-4f752e446aff" /> </p>
<p align="center"> <img width="421" height="838" alt="Screenshot 2025-11-01 113956" src="https://github.com/user-attachments/assets/840dab12-5ec4-4926-a455-10292dfb6c1e" /> </p>

---

## 🎯 Key Contributions

* Engineered real-time communication using WebSockets (Socket.io)
* Implemented secure driver authentication using Passport.js
* Integrated Leaflet.js for dynamic route and live location tracking
* Built RESTful APIs for bus and user management
* Designed driver dashboard for bus status control
* Structured scalable MongoDB schemas

---

## 🧠 Architecture Highlights

* MVC-based backend structure
* Persistent WebSocket connection for low-latency updates
* Session-based authentication with MongoDB session store
* Server-side rendering for fast initial load

---

## 🚀 Why This Project Matters

This project demonstrates:

* Real-time full-stack architecture
* Secure authentication flow
* WebSocket implementation
* Map API integration
* Clean and responsive UI
* Scalable backend design

---



