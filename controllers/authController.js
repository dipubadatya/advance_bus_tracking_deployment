const Driver = require('../models/Driver');
const Bus = require('../models/Bus');
const bcrypt = require('bcryptjs');

// Renders the registration page
exports.getRegister = (req, res) => {
    res.render('driver/register', { title: 'Driver Register' });
};

// Handles new driver registration
// In your controller file (e.g., authController.js)

exports.postRegister = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const existingDriver = await Driver.findOne({ username });

    if (existingDriver) {
            // Set a flash message before redirecting
      req.flash('error', 'A driver with that username already exists.'); 
      return res.redirect('/auth/register');
    }

    const driver = new Driver({ username, password });
    await driver.save();
        
        // Optional: Add a success message for the login page
        req.flash('success', 'Registration successful! Please log in.');
    res.redirect('/auth/login');

  } catch (err) {
    console.error(err);
        req.flash('error', 'Server error during registration. Please try again.');
    res.redirect('/auth/register');
  }
};
// exports.postRegister = async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         // Check if driver already exists
//         const existingDriver = await Driver.findOne({ username });
//         if (existingDriver) {
           
//             return res.redirect('/auth/register');
//         }
//         const driver = new Driver({ username, password });
//         await driver.save();
//         res.redirect('/auth/login');
//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server Error during registration.');
//     }
// };

// Renders the login page
exports.getLogin = (req, res) => {
    res.render('driver/login', { title: 'Driver Login' });
};

// Handles driver login
exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const driver = await Driver.findOne({ username });
        if (!driver) {
            return res.redirect('/auth/login');
        }
        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) {
            return res.redirect('/auth/login');
        }
        req.session.isLoggedIn = true;
        req.session.driverId = driver._id;
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error during login.');
    }
};

//  Stops tracking on logout 
exports.postLogout = async (req, res) => {
    try {
        const driverId = req.session.driverId;
        if (driverId) {
           
            const bus = await Bus.findOne({ driver: driverId });
            if (bus) {
                
                bus.trackingStarted = false;
                await bus.save();

               
                const io = req.app.get('socketio'); 
               
                console.log(`Driver ${driverId} logged out, stopping tracking for bus ${bus._id}`);
            }
        }
    } catch (err) {
        console.error("Error during logout cleanup:", err);
    } finally {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).send("Could not log out.");
            }
            res.redirect('/');
        });
    }
};