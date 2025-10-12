const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    name: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    scheduledTime: { type: String, required: true }, 
});

const busSchema = new mongoose.Schema({
    busNumber: { type: String, required: true, unique: true },
    routeName: { type: String, required: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    stops: [stopSchema],
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
    },
    trackingStarted: { type: Boolean, default: false },
});

module.exports = mongoose.model('Bus', busSchema);