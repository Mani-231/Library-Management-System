
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const dashboardRoutes = require('./routes/dashboard');
const booksRoutes = require('./routes/books');
const membersRoutes = require('./routes/members');
const issuesRoutes = require('./routes/issues');
const transactionsRoutes = require('./routes/transactions');
const reportsRoutes = require('./routes/reports');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/reports', reportsRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Library Management System Backend is Running!');
});

// Test PostgreSQL connection
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            message: 'PostgreSQL connected successfully!',
            database: 'library_db',
            time: result.rows[0].now
        });
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'Database connection failed'
        });
    }
});

// Start server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
