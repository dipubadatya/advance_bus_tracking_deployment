// sw.js

// A global variable to hold the notification object
let notification;

self.addEventListener('message', event => {
    if (!event.data) return;

    const { action, text } = event.data;

    if (action === 'start') {
        // When the page asks to start, show a persistent notification.
        // The 'tag' is important: it lets us update the same notification later.
        self.registration.showNotification('Bus Tracking Active', {
            body: 'Location is being shared...',
            icon: '/path/to/your/icon.png', // Optional: add an icon
            tag: 'bus-tracking-notification',
            // 'renotify: true' can be annoying, so it's often omitted.
        }).then(event => {
            notification = event.notification;
        });
    } else if (action === 'update' && notification) {
        // To update, we just show a new notification with the same tag.
        self.registration.showNotification('Bus Tracking Active', {
            body: text,
            icon: '/path/to/your/icon.png',
            tag: 'bus-tracking-notification',
        });
    } else if (action === 'stop' && notification) {
        // Close the notification when tracking stops.
        notification.close();
    }
});

// Optional: Listen for the user closing the notification manually
self.addEventListener('notificationclose', event => {
    console.log('Notification was closed. You might want to signal the main page to stop tracking.');
    // Here you could use the Clients API to message the main page back,
    // but stopping is usually handled by the user pressing the "Stop" button.
});