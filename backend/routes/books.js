
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET: Retrieve all books
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT
                book_id,
                title,
                author,
                category,
                total_copies,
                available_copies
            FROM books
            ORDER BY book_id ASC;
        `;

        const result = await pool.query(query);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Get Books Error:', error.message);

        res.status(500).json({
            message: 'Unable to retrieve books'
        });
    }
});

// POST: Add a new book
router.post('/', async (req, res) => {
    try {
        const {
            title,
            author,
            category,
            total_copies
        } = req.body;

        if (!title || !Number.isInteger(total_copies) || total_copies <= 0) {
            return res.status(400).json({
                message: 'Title and a valid positive number of copies are required'
            });
        }

        const query = `
            INSERT INTO books
                (title, author, category, total_copies, available_copies)
            VALUES ($1, $2, $3, $4, $4)
            RETURNING *;
        `;

        const values = [
            title,
            author || null,
            category || null,
            total_copies
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Book added successfully',
            book: result.rows[0]
        });

    } catch (error) {
        console.error('Add Book Error:', error.message);

        res.status(500).json({
            message: 'Unable to add book'
        });
    }
});

module.exports = router;
