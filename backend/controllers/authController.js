const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new borrower
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please enter all required fields: name, email, and password.' });
        }
        const cleanEmail = email.toLowerCase().trim();
        const userExists = await User.findOne({ email: cleanEmail });
        if (userExists) {
            return res.status(400).json({ error: 'An account with this email already exists.' });
        }

        const validRole = (role === 'bank_officer' || role === 'borrower') ? role : 'borrower';

        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            passwordHash: password, // hashed by pre-save hook
            role: validRole,
            phone: phone || ''
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: error.message || 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Please provide email and password' });
        }
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-passwordHash');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { registerUser, loginUser, getMe };
