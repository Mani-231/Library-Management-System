
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 1. Overall library report
router.get('/summary', async (req, res) => {
    try {
        const query = `
            SELECT
                (SELECT COUNT(*) FROM books) AS total_book_titles,
                (SELECT COALESCE(SUM(total_copies), 0) FROM books)
                    AS total_book_copies,
                (SELECT COALESCE(SUM(available_copies), 0) FROM books)
                    AS available_copies,
                (SELECT COUNT(*) FROM members) AS total_members,
                (SELECT COUNT(*) FROM issues) AS total_transactions,
                (SELECT COUNT(*) FROM issues
                    WHERE return_date IS NULL) AS currently_issued,
                (SELECT COUNT(*) FROM issues
                    WHERE return_date IS NOT NULL) AS returned_books,
                (SELECT COUNT(*) FROM issues
                    WHERE return_date IS NULL
                    AND due_date < CURRENT_DATE) AS overdue_books;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Summary Report Error:', error.message);
        res.status(500).json({
            message: 'Unable to generate summary report'
        });
    }
});

// 2. Category-wise book report
router.get('/categories', async (req, res) => {
    try {
        const query = `
            SELECT
                COALESCE(category, 'Uncategorized') AS category,
                COUNT(*) AS total_titles,
                COALESCE(SUM(total_copies), 0) AS total_copies,
                COALESCE(SUM(available_copies), 0) AS available_copies
            FROM books
            GROUP BY category
            ORDER BY total_titles DESC;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Category Report Error:', error.message);
        res.status(500).json({
            message: 'Unable to generate category report'
        });
    }
});

// 3. Overdue books report
router.get('/overdue', async (req, res) => {
    try {
        const query = `
            SELECT
                i.issue_id,
                b.title AS book_title,
                m.name AS member_name,
                m.phone AS member_phone,
                i.issue_date,
                i.due_date,
                CURRENT_DATE - i.due_date AS days_overdue
            FROM issues i
            INNER JOIN books b ON i.book_id = b.book_id
            INNER JOIN members m ON i.member_id = m.member_id
            WHERE i.return_date IS NULL
              AND i.due_date < CURRENT_DATE
            ORDER BY i.due_date ASC;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Overdue Report Error:', error.message);
        res.status(500).json({
            message: 'Unable to generate overdue report'
        });
    }
});

// 4. Most borrowed books report
router.get('/popular-books', async (req, res) => {
    try {
        const query = `
            SELECT
                b.book_id,
                b.title,
                b.author,
                b.category,
                COUNT(i.issue_id) AS times_issued
            FROM books b
            LEFT JOIN issues i ON b.book_id = i.book_id
            GROUP BY
                b.book_id,
                b.title,
                b.author,
                b.category
            ORDER BY times_issued DESC, b.title ASC;
        `;

        const result = await pool.query(query);
        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Popular Books Report Error:', error.message);
        res.status(500).json({
            message: 'Unable to generate popular books report'
        });
    }
});

module.exports = router;
