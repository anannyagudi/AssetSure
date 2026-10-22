const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select('-passwordHash');
            if (!req.user) {
                return res.status(401).json({ error: 'User not found' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ error: 'Not authorized, no token' });
    }
};

// Check for bank officer role
const officerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'bank_officer') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Bank Officers only' });
    }
};

// Check for borrower role
const borrowerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'borrower') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied: Borrowers only' });
    }
};

module.exports = { protect, officerOnly, borrowerOnly };
