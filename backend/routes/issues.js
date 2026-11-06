
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET: Load books with available copies and all members
router.get('/options', async (req, res) => {
    try {
        const booksQuery = `
            SELECT book_id, title, available_copies
            FROM books
            WHERE available_copies > 0
            ORDER BY title;
        `;

        const membersQuery = `
            SELECT member_id, name
            FROM members
            ORDER BY name;
        `;

        const [booksResult, membersResult] = await Promise.all([
            pool.query(booksQuery),
            pool.query(membersQuery)
        ]);

        res.status(200).json({
            books: booksResult.rows,
            members: membersResult.rows
        });

    } catch (error) {
        console.error('Issue Options Error:', error.message);

        res.status(500).json({
            message: 'Unable to load issue form options'
        });
    }
});

// GET: Retrieve currently issued books
router.get('/active', async (req, res) => {
    try {
        const query = `
            SELECT
                i.issue_id,
                b.title,
                m.name AS member_name,
                i.issue_date,
                i.due_date
            FROM issues i
            JOIN books b ON i.book_id = b.book_id
            JOIN members m ON i.member_id = m.member_id
            WHERE i.return_date IS NULL
            ORDER BY i.issue_id DESC;
        `;

        const result = await pool.query(query);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Active Issues Error:', error.message);

        res.status(500).json({
            message: 'Unable to retrieve issued books'
        });
    }
});

// POST: Issue a book to a member
router.post('/', async (req, res) => {
    const { book_id, member_id, due_date } = req.body;

    if (
        !Number.isInteger(Number(book_id)) ||
        !Number.isInteger(Number(member_id)) ||
        !due_date ||
        !/^\d{4}-\d{2}-\d{2}$/.test(due_date)
    ) {
        return res.status(400).json({
            message: 'Please provide a valid book, member and due date'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const bookResult = await client.query(
            `SELECT book_id, title, available_copies
             FROM books
             WHERE book_id = $1
             FOR UPDATE`,
            [Number(book_id)]
        );

        if (bookResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                message: 'Book not found'
            });
        }

        if (bookResult.rows[0].available_copies <= 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                message: 'No copies of this book are currently available'
            });
        }

        const memberResult = await client.query(
            'SELECT member_id FROM members WHERE member_id = $1',
            [Number(member_id)]
        );

        if (memberResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                message: 'Member not found'
            });
        }

        const librarianResult = await client.query(
            'SELECT librarian_id FROM librarians ORDER BY librarian_id LIMIT 1'
        );

        if (librarianResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                message: 'Please add a librarian record before issuing books'
            });
        }

        const librarianId = librarianResult.rows[0].librarian_id;

        const issueResult = await client.query(
            `INSERT INTO issues
                (book_id, member_id, librarian_id, issue_date, due_date)
             VALUES ($1, $2, $3, CURRENT_DATE, $4)
             RETURNING *`,
            [
                Number(book_id),
                Number(member_id),
                librarianId,
                due_date
            ]
        );

        await client.query(
            `UPDATE books
             SET available_copies = available_copies - 1
             WHERE book_id = $1`,
            [Number(book_id)]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Book issued successfully',
            issue: issueResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Issue Book Error:', error.message);

        if (error.code === '23514') {
            return res.status(400).json({
                message: 'Due date cannot be earlier than the issue date'
            });
        }

        res.status(500).json({
            message: 'Unable to issue book'
        });

    } finally {
        client.release();
    }
});

// PUT: Return an issued book
router.put('/:issueId/return', async (req, res) => {
    const issueId = Number(req.params.issueId);

    if (!Number.isInteger(issueId) || issueId <= 0) {
        return res.status(400).json({
            message: 'Invalid issue ID'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Lock the active issue record
        const issueResult = await client.query(
            `SELECT issue_id, book_id
             FROM issues
             WHERE issue_id = $1
             AND return_date IS NULL
             FOR UPDATE`,
            [issueId]
        );

        if (issueResult.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                message: 'Active issue not found. It may already be returned.'
            });
        }

        const bookId = issueResult.rows[0].book_id;

        // Record the return date
        const returnResult = await client.query(
            `UPDATE issues
             SET return_date = CURRENT_DATE
             WHERE issue_id = $1
             RETURNING *`,
            [issueId]
        );

        // Increase the available copies
        await client.query(
            `UPDATE books
             SET available_copies = available_copies + 1
             WHERE book_id = $1
             AND available_copies < total_copies`,
            [bookId]
        );

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Book returned successfully',
            issue: returnResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');

        console.error('Return Book Error:', error.message);

        res.status(500).json({
            message: 'Unable to return book'
        });

    } finally {
        client.release();
    }
});

module.exports = router;
