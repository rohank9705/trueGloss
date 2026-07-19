const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your PostgreSQL connection pool

// GET /api/rota?startDate=YYYY-MM-DD
router.get('/rota', async (req, res) => {
    try {
        const { startDate } = req.query;

        if (!startDate) {
            return res.status(400).json({ error: 'startDate query parameter is required' });
        }

        // Calculate the end date exactly 28 days (4 weeks) later
        const start = new Date(startDate);
        const end = new Date(startDate);
        end.setDate(start.getDate() + 27); // 27 additional days = 28 total days inclusive

        const formattedEndDate = end.toISOString().split('T')[0];

        // Fetch all jobs falling within the 4-week window
        const queryText = `
            SELECT id, title, date::text, time_slot, assigned_to, status 
            FROM jobs 
            WHERE date >= $1 AND date <= $2
            ORDER BY date ASC, time_slot ASC;
        `;
        
        const { rows } = await pool.query(queryText, [startDate, formattedEndDate]);
        
        res.json({
            meta: {
                rangeStart: startDate,
                rangeEnd: formattedEndDate,
                totalJobs: rows.length
            },
            jobs: rows
        });

    } catch (err) {
        console.error('Error fetching rota data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/jobs - Log a new job on the rota
router.post('/jobs', async (req, res) => {
    try {
        const { title, date, time_slot, assigned_to } = req.body;

        if (!title || !date) {
            return res.status(400).json({ error: 'Title and date are required fields' });
        }

        const queryText = `
            INSERT INTO jobs (title, date, time_slot, assigned_to, status)
            VALUES ($1, $2, $3, $4, 'Scheduled')
            RETURNING *;
        `;

        const { rows } = await pool.query(queryText, [title, date, time_slot || 'All Day', assigned_to || null]);
        res.status(201).json(rows[0]);

    } catch (err) {
        console.error('Error creating rota job:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;