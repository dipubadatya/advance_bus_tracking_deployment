
// controllers/dashboardController.js


const Bus = require('../models/Bus');

exports.getDashboard = async (req, res) => {
    try {
        const bus = await Bus.findOne({ driver: req.session.driverId });
        res.render('driver/dashboard', { title: 'Dashboard', bus });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getEditBus = async (req, res) => {
    const bus = await Bus.findOne({ driver: req.session.driverId });
    res.render('driver/edit-bus', { title: 'Edit Bus', bus });
};

exports.postEditBus = async (req, res) => {
    try {
        const { busNumber, routeName, stops } = req.body;
        const driverId = req.session.driverId;

        // Ensure stops is an array
        const processedStops = Array.isArray(stops) ? stops : [];

        await Bus.findOneAndUpdate(
            { driver: driverId },
            {
                busNumber,
                routeName,
                stops: processedStops,
                driver: driverId
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};