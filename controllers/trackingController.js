

// controllers/trackingController.js
const Bus = require('../models/Bus');


//  function for distance calculation ---
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}


exports.getHomePage = async (req, res) => {
    try {
        const buses = await Bus.find().populate('driver', 'username');
        res.render('index', { title: 'All Buses', buses });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getTrackingPage = async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.busId);
        if (!bus) return res.status(404).send('Bus not found');
        res.render('track', { title: `Tracking ${bus.busNumber}`, bus: bus });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};





// A helper function to calculate distance 
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}


exports.findNearestStop = async (req, res) => {
    const { latitude, longitude } = req.body;
 
    const MAX_RADIUS_KM = 10; 

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required." });
    }

    try {
        const allBuses = await Bus.find({}).select('busNumber routeName stops');

        if (!allBuses || allBuses.length === 0) {
            return res.status(404).json({ message: "No bus routes found in the database." });
        }

        let nearestStopInfo = null;
        let minDistance = Infinity;

        allBuses.forEach(bus => {
            bus.stops.forEach(stop => {
              
                if (stop.lat && stop.lng) {
                    const distance = haversineDistance(latitude, longitude, stop.lat, stop.lng);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestStopInfo = {
                            stopName: stop.name,
                            busNumber: bus.busNumber,
                            routeName: bus.routeName,
                            distance_km: distance.toFixed(2)
                        };
                    }
                }
            });
        });

        if (nearestStopInfo && minDistance <= MAX_RADIUS_KM) {
            return res.json({
                message: "Nearest bus stop found.",
                nearest_stop: nearestStopInfo
            });
        } else {
            return res.status(404).json({ message: `No nearest stoppage found within a ${MAX_RADIUS_KM}km radius.` });
        }

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ message: "An internal server error occurred." });
    }
};
// exports.findNearestStop = async (req, res) => {
//     const { latitude, longitude } = req.body;

//     if (!latitude || !longitude) {
//         return res.status(400).json({ message: "Latitude and longitude are required." });
//     }

//     try {
//         const allBuses = await Bus.find({}).select('busNumber routeName stops');

//         if (!allBuses || allBuses.length === 0) {
//             return res.status(404).json({ message: "No bus routes found in the database." });
//         }

//         let nearestStopInfo = null;
//         let minDistance = Infinity;

//         allBuses.forEach(bus => {
//             bus.stops.forEach(stop => {
//                 const distance = haversineDistance(latitude, longitude, stop.lat, stop.lng);

//                 if (distance < minDistance) {
//                     minDistance = distance;
//                     nearestStopInfo = {
//                         stopName: stop.name,
//                         busNumber: bus.busNumber,
//                         routeName: bus.routeName,
//                         distance_km: distance.toFixed(2) // Format to 2 decimal places
//                     };
//                 }
//             });
//         }); 

//         if (nearestStopInfo) {
//             return res.json({
//                 message: "Nearest bus stop found.",
//                 nearest_stop: nearestStopInfo
//             });
//         } else {
//             return res.status(404).json({ message: "No stops available to calculate distance." });
//         }

//     } catch (error) {
//         console.error("API Error:", error);
//         res.status(500).json({ message: "An internal server error occurred." });
//     }
// };

exports.allBus=async(req,res)=>{
    const busSchedule= await Bus.find({}).populate('stops')
    console.log(busSchedule);
    
res.render('./bus-list.ejs',{busSchedule})
}