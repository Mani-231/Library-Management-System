
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET: Retrieve complete transaction history
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT
                i.issue_id,
                b.title AS book_title,
                m.name AS member_name,
                l.name AS librarian_name,
                i.issue_date,
                i.due_date,
                i.return_date,
                CASE
                    WHEN i.return_date IS NULL THEN 'Issued'
                    ELSE 'Returned'
                END AS status
            FROM issues i
            INNER JOIN books b
                ON i.book_id = b.book_id
            INNER JOIN members m
                ON i.member_id = m.member_id
            INNER JOIN librarians l
                ON i.librarian_id = l.librarian_id
            ORDER BY i.issue_id DESC;
        `;

        const result = await pool.query(query);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Transactions Error:', error.message);

        res.status(500).json({
            message: 'Unable to retrieve transaction history'
        });
    }
});

module.exports = router;
