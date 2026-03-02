

# Advance Bus Tracking System

A real-time bus tracking application built for college campuses. Drivers log in, share their live location, and students see buses moving on an interactive map — instantly.

**Live Demo:** [https://advance-bus-tracking-deployment.onrender.com/](https://advance-bus-tracking-deployment.onrender.com/)

---

## The Problem

Students never know where the college bus is. Is it five minutes away or twenty? Has it already left? This app removes the guesswork by showing live bus positions on a map, updated in real time.

---

## How It Works

1. Driver logs into a secure dashboard
2. The app captures and sends the driver's location via Socket.io
3. The server broadcasts that location to all connected students
4. The student's map updates the bus marker position instantly
5. No page refresh. No delay. Just a moving dot on a map.

---

## What's Inside

- Real-time location streaming using Socket.io
- Interactive map with live marker movement using Leaflet.js
- Secure driver login with Passport.js and bcrypt-hashed passwords
- Session-based authentication stored in MongoDB
- Driver dashboard for managing bus status
- Support for tracking multiple buses simultaneously
- Fully responsive — works on phones, tablets, and desktops
- Server-side rendered pages using EJS

---

## Built With

**Backend:** Node.js, Express, MongoDB, Mongoose, Passport.js, Socket.io, bcryptjs, Express-Session, Connect-Mongo

**Frontend:** EJS, Tailwind CSS, Leaflet.js, Vanilla JavaScript

---

## Project Structure

```
advance_bus_tracking/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── dashboardController.js
│   └── trackingController.js
├── models/
│   ├── Driver.js
│   └── Bus.js
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   └── trackingRoutes.js
├── socket/
│   └── socketHandler.js
├── views/
│   ├── driver/
│   ├── dashboard.ejs
│   ├── map.ejs
│   └── layout.ejs
├── public/
│   ├── css/
│   ├── js/
│   └── images/
├── .env
├── server.js
├── package.json
└── README.md
```

---

## Getting Started

### Clone and install

```bash
git clone https://github.com/your-username/advance_bus_tracking.git
cd advance_bus_tracking
npm install
```

### Configure environment

Create a `.env` file in the root directory:

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_secret_key
```

### Run the server

```bash
# Development
npm run dev

# Production
npm start
```

Open `http://localhost:3000` in your browser.

---

## Authentication

- Passport.js local strategy handles driver login
- Passwords are hashed with bcryptjs before storage
- Sessions are persisted in MongoDB via Connect-Mongo
- Dashboard routes are protected — no session, no access
- Flash messages provide login/logout feedback

---

## Map Integration

- Built on Leaflet.js with OpenStreetMap tiles
- Bus markers move in real time based on Socket.io events
- No polling — updates are pushed the moment a driver's position changes
- Supports multiple buses on the same map simultaneously

---

## Screenshots

### Desktop

<div align="center">

<img width="100%" alt="Desktop View - Map" src="https://github.com/user-attachments/assets/86ca167a-792a-4bf1-a375-be32accd6c3f" />

<br/><br/>

<img width="100%" alt="Desktop View - Dashboard" src="https://github.com/user-attachments/assets/7ae271aa-3fbe-4a6d-a49f-224da0faa4af" />

<br/><br/>

<img width="100%" alt="Desktop View - Tracking" src="https://github.com/user-attachments/assets/d60ac28f-cfa5-4607-9618-644459d48103" />

</div>

---

### Mobile

<div align="center">

<img width="280" alt="Mobile View 1" src="https://github.com/user-attachments/assets/d1cddcd5-59ed-4f60-bb0e-04e09cf599da" />
&nbsp;&nbsp;&nbsp;
<img width="280" alt="Mobile View 2" src="https://github.com/user-attachments/assets/3c3956db-ad9f-401b-8151-4f752e446aff" />
&nbsp;&nbsp;&nbsp;
<img width="280" alt="Mobile View 3" src="https://github.com/user-attachments/assets/840dab12-5ec4-4926-a455-10292dfb6c1e" />

</div>

---

## Architecture

- MVC structure across controllers, models, routes, and views
- Persistent WebSocket connections for low-latency location streaming
- Session store backed by MongoDB so sessions survive server restarts
- Server-side rendering for fast initial page loads
- RESTful API endpoints for bus and driver management

---

## What This Project Covers

- Real-time full-stack application design
- WebSocket communication between multiple clients and a server
- Secure authentication with session management
- Third-party map API integration with live data
- Responsive UI that works across devices
- Scalable backend architecture following MVC conventions

---

