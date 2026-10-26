const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env
dotenv.config();

// // Connect DB
// connectDB();

const app = express();

const path = require('path');

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Default route
app.get('/', (req, res) => {
    res.json({ message: 'AI Loan Verification API is running...' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/verification', require('./routes/verification'));
app.use('/api/monitoring', require('./routes/monitoring'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err.stack);
    const status = err.status || 500;
    res.status(status).json({
        error: status === 500 ? 'Server Error' : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`
            );
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();
