require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const flash = require('connect-flash');

const Bus = require('./models/Bus');


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to Database
connectDB();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_ATLAS}),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));


// app.use((req, res, next) => {
//     res.locals.isAuthenticated = req.session.isLoggedIn;

//     next();
// });
app.use(flash());

// 3. Global Middleware to make flash messages available in templates
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;

    res.locals.errorMessage = req.flash('error'); // For error messages
    res.locals.successMessage = req.flash('success'); // For success messages
    next();
});
 
// Routes
app.use('/', require('./routes/trackingRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));

// Socket.IO Connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinBusRoom', (busId) => {
        socket.join(busId);
        console.log(`User joined room for bus: ${busId}`);
    });

    socket.on('startTracking', async ({ busId }) => {
        await Bus.findByIdAndUpdate(busId, { trackingStarted: true });
        io.to(busId).emit('trackingStatus', { status: 'started' });

        io.emit('trackingStatusUpdate', { busId: busId, status: 'started' });
    });

    socket.on('stopTracking', async ({ busId }) => {
        await Bus.findByIdAndUpdate(busId, { trackingStarted: false });
        io.to(busId).emit('trackingStatus', { status: 'stopped' });
       
        io.emit('trackingStatusUpdate', { busId: busId, status: 'stopped' });
    });

    socket.on('updateLocation', async (data) => {
        const { busId, coords } = data;
        try {
            await Bus.findByIdAndUpdate(busId, {
                'currentLocation.lat': coords.lat,
                'currentLocation.lng': coords.lng,
            });
            io.to(busId).emit('locationUpdate', coords);
        } catch (err) {
            console.error('Error updating location:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('joinBusRoom', (busId) => {
//         socket.join(busId);
//         console.log(`User joined room for bus: ${busId}`);
//     });

//     socket.on('startTracking', async ({ busId }) => {
//         await Bus.findByIdAndUpdate(busId, { trackingStarted: true });
//         io.to(busId).emit('trackingStatus', { status: 'started' });
//     });

//     socket.on('stopTracking', async ({ busId }) => {
//         await Bus.findByIdAndUpdate(busId, { trackingStarted: false });
//         io.to(busId).emit('trackingStatus', { status: 'stopped' });
//     });

//     socket.on('updateLocation', async (data) => {
//         const { busId, coords } = data;
//         try {
//             await Bus.findByIdAndUpdate(busId, {
//                 'currentLocation.lat': coords.lat,
//                 'currentLocation.lng': coords.lng,
//             });
//             // Broadcast the new location to clients in the specific bus room
//             io.to(busId).emit('locationUpdate', coords);
//         } catch (err) {
//             console.error('Error updating location:', err);
//         }
//     }); 

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
// });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} 🚀`));