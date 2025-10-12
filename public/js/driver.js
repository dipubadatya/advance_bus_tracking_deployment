document.addEventListener('DOMContentLoaded', () => {
    if (!busId) return; 

    const socket = io();
    let watchId = null;

    const startBtn = document.getElementById('start-tracking');
    const stopBtn = document.getElementById('stop-tracking');
    const statusEl = document.getElementById('status');

    startBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    statusEl.textContent = `Tracking... Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
                    socket.emit('updateLocation', {
                        busId,
                        coords: { lat: latitude, lng: longitude }
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    statusEl.textContent = 'Error: Could not get location.';
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
            socket.emit('startTracking', { busId });
            statusEl.textContent = 'Tracking started!';
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            statusEl.textContent = 'Geolocation is not supported by this browser.';
        }
    });

    stopBtn.addEventListener('click', () => {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
            socket.emit('stopTracking', { busId });
            statusEl.textContent = 'Tracking stopped.';
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    });
});

// document.addEventListener('DOMContentLoaded', async () => {
//     if (!busId) return; // Don't run if no bus is assigned

//     const socket = io();
//     let watchId = null;
//     let wakeLock = null;

//     const startBtn = document.getElementById('start-tracking');
//     const stopBtn = document.getElementById('stop-tracking');
//     const statusEl = document.getElementById('status');

//     // --- Service Worker Registration ---
//     // This is the first step to enable background capabilities.
//     if ('serviceWorker' in navigator) {
//         try {
//             await navigator.serviceWorker.register('/sw.js');
//             console.log('Service Worker registered successfully.');
//         } catch (error) {
//             console.error('Service Worker registration failed:', error);
//         }
//     }

//     // --- Helper function to request a Wake Lock ---
//     const requestWakeLock = async () => {
//         if ('wakeLock' in navigator) {
//             try {
//                 wakeLock = await navigator.wakeLock.request('screen');
//                 console.log('Screen Wake Lock is active.');
//                 // Listen for when the wake lock is released
//                 wakeLock.addEventListener('release', () => {
//                     console.log('Screen Wake Lock was released.');
//                 });
//             } catch (err) {
//                 console.error(`${err.name}, ${err.message}`);
//             }
//         }
//     };

//     // --- Main Tracking Logic ---
//     const startTracking = () => {
//         if (!navigator.geolocation) {
//             statusEl.textContent = 'Geolocation is not supported by this browser.';
//             return;
//         }

//         // 1. Request Wake Lock to keep screen on
//         requestWakeLock();

//         // 2. Tell Service Worker to show persistent notification
//         if (navigator.serviceWorker.controller) {
//             navigator.serviceWorker.controller.postMessage({ action: 'start' });
//         }

//         // 3. Start watching the GPS position
//         watchId = navigator.geolocation.watchPosition(
//             (position) => {
//                 const { latitude, longitude } = position.coords;
//                 const statusText = `Tracking... Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
//                 statusEl.textContent = statusText;

//                 // Update notification with current location
//                 if (navigator.serviceWorker.controller) {
//                     navigator.serviceWorker.controller.postMessage({ action: 'update', text: statusText });
//                 }

//                 // Send data to server
//                 socket.emit('updateLocation', {
//                     busId,
//                     coords: { lat: latitude, lng: longitude }
//                 });
//             },
//             (error) => {
//                 console.error('Error getting location:', error);
//                 statusEl.textContent = 'Error: Could not get location.';
//             },
//             { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
//         );

//         socket.emit('startTracking', { busId });
//         statusEl.textContent = 'Tracking started!';
//         startBtn.disabled = true;
//         stopBtn.disabled = false;
//     };

//     const stopTracking = () => {
//         if (watchId !== null) {
//             // 1. Stop watching GPS
//             navigator.geolocation.clearWatch(watchId);
//             watchId = null;

//             // 2. Tell Service Worker to hide notification
//             if (navigator.serviceWorker.controller) {
//                 navigator.serviceWorker.controller.postMessage({ action: 'stop' });
//             }

//             // 3. Release the Wake Lock
//             if (wakeLock !== null) {
//                 wakeLock.release();
//                 wakeLock = null;
//             }

//             // 4. Notify the server
//             socket.emit('stopTracking', { busId });
//             statusEl.textContent = 'Tracking stopped.';
//             startBtn.disabled = false;
//             stopBtn.disabled = true;
//         }
//     };

//     startBtn.addEventListener('click', startTracking);
//     stopBtn.addEventListener('click', stopTracking);
// });
// // In your routes file (e.g., dashboard.js)
// router.post('/bus/switch-direction', isAuthenticated, async (req, res) => {
//     try {
//         const bus = await Bus.findOne({ driver: req.user.id });
//         if (bus) {
//             // Flip the direction
//             bus.currentDirection = bus.currentDirection === 'outgoing' ? 'return' : 'outgoing';
//             await bus.save();
//         }
//         res.redirect('/dashboard');
//     } catch (err) {
//         console.error(err);
//         res.redirect('/dashboard'); // Or show an error page
//     }
// });
// driver.js

// document.addEventListener('DOMContentLoaded', async () => {
//     // Assuming 'busId' is defined globally in your template as before
//     if (!busId) return;

//     const socket = io();
//     let watchId = null;
//     let wakeLock = null;

//     const startBtn = document.getElementById('start-tracking');
//     const stopBtn = document.getElementById('stop-tracking');
//     const statusEl = document.getElementById('status');

//     // --- 1. Register the Service Worker ---
//     if ('serviceWorker' in navigator) {
//         try {
//             // Make sure the service worker is ready before we try to use it
//             await navigator.serviceWorker.register('/sw.js');
//             console.log('Service Worker registered successfully.');
//         } catch (error) {
//             console.error('Service Worker registration failed:', error);
//             statusEl.textContent = 'Background tracking might not work.';
//         }
//     }

//     // --- Helper function to request a Wake Lock (keeps screen on in foreground) ---
//     const requestWakeLock = async () => {
//         if ('wakeLock' in navigator) {
//             try {
//                 wakeLock = await navigator.wakeLock.request('screen');
//                 console.log('Screen Wake Lock is active.');
//                 wakeLock.addEventListener('release', () => console.log('Screen Wake Lock was released.'));
//             } catch (err) {
//                 console.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
//             }
//         }
//     };

//     // --- Main Tracking Logic ---
//     const startTracking = async () => {
//         if (!navigator.geolocation) {
//             statusEl.textContent = 'Geolocation is not supported by this browser.';
//             return;
//         }

//         // A. Request permissions first (best practice)
//         // Note: Geolocation permission prompt is handled by watchPosition itself.
//         // Notification permission is needed for the service worker.
//         const notificationPermission = await Notification.requestPermission();
//         if (notificationPermission !== 'granted') {
//              statusEl.textContent = 'Notification permission is required for background tracking.';
//              return;
//         }

//         // B. Activate Wake Lock for when the app is in the foreground
//         requestWakeLock();

//         // C. Tell the Service Worker to show the persistent notification.
//         // This is the MOST IMPORTANT step for background operation.
//         if (navigator.serviceWorker.controller) {
//             navigator.serviceWorker.controller.postMessage({ action: 'start' });
//         }

//         // D. Start watching the GPS position
//         watchId = navigator.geolocation.watchPosition(
//             (position) => {
//                 const { latitude, longitude } = position.coords;
//                 const statusText = `Tracking... Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
//                 statusEl.textContent = statusText;

//                 // Update the notification with the current location
//                 if (navigator.serviceWorker.controller) {
//                     navigator.serviceWorker.controller.postMessage({ action: 'update', text: statusText });
//                 }

//                 // Send data to your server
//                 socket.emit('updateLocation', {
//                     busId,
//                     coords: { lat: latitude, lng: longitude }
//                 });
//             },
//             (error) => {
//                 console.error('Error getting location:', error);
//                 statusEl.textContent = `Error: ${error.message}`;
//             },
//             { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Increased timeout for better reliability
//         );

//         socket.emit('startTracking', { busId });
//         statusEl.textContent = 'Tracking started!';
//         startBtn.disabled = true;
//         stopBtn.disabled = false;
//     };

//     const stopTracking = () => {
//         if (watchId !== null) {
//             // A. Stop watching GPS
//             navigator.geolocation.clearWatch(watchId);
//             watchId = null;

//             // B. Tell Service Worker to hide the notification
//             if (navigator.serviceWorker.controller) {
//                 navigator.serviceWorker.controller.postMessage({ action: 'stop' });
//             }

//             // C. Release the Wake Lock
//             if (wakeLock !== null) {
//                 wakeLock.release();
//                 wakeLock = null;
//             }

//             // D. Notify the server
//             socket.emit('stopTracking', { busId });
//             statusEl.textContent = 'Tracking stopped.';
//             startBtn.disabled = false;
//             stopBtn.disabled = true;
//         }
//     };

//     startBtn.addEventListener('click', startTracking);
//     stopBtn.addEventListener('click', stopTracking);
// });