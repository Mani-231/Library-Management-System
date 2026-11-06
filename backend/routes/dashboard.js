
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const query = `
            SELECT
                (SELECT COUNT(*) FROM books)
                    AS total_book_titles,

                (SELECT COALESCE(SUM(total_copies), 0)
                 FROM books)
                    AS total_book_copies,

                (SELECT COALESCE(SUM(available_copies), 0)
                 FROM books)
                    AS available_copies,

                (SELECT COUNT(*) FROM members)
                    AS total_members,

                (SELECT COUNT(*) FROM issues
                 WHERE return_date IS NULL)
                    AS currently_issued,

                (SELECT COUNT(*) FROM issues
                 WHERE return_date IS NULL
                 AND due_date < CURRENT_DATE)
                    AS overdue_books;
        `;

        const result = await pool.query(query);

        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Dashboard Error:', error.message);

        res.status(500).json({
            message: 'Unable to fetch dashboard statistics'
        });
    }
});

module.exports = router;
