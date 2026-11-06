
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET: Retrieve all members
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT member_id, name, email, phone
            FROM members
            ORDER BY member_id ASC;
        `;

        const result = await pool.query(query);

        res.status(200).json(result.rows);

    } catch (error) {
        console.error('Get Members Error:', error.message);

        res.status(500).json({
            message: 'Unable to retrieve members'
        });
    }
});

// POST: Add a new member
router.post('/', async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: 'Member name is required'
            });
        }

        const query = `
            INSERT INTO members (name, email, phone)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const values = [
            name.trim(),
            email?.trim() || null,
            phone?.trim() || null
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: 'Member added successfully',
            member: result.rows[0]
        });

    } catch (error) {
        console.error('Add Member Error:', error.message);

        if (error.code === '23505') {
            return res.status(409).json({
                message: 'A member with this email already exists'
            });
        }

        res.status(500).json({
            message: 'Unable to add member'
        });
    }
});

module.exports = router;
