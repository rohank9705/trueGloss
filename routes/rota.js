const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// 1. GET 4-Week Rota (Hiding Completed Jobs)
router.get('/rota', async (req, res) => {
    try {
        const { startDate } = req.query;

        if (!startDate) {
            return res.status(400).json({ error: 'startDate query parameter is required' });
        }

        const start = new Date(startDate);
        const end = new Date(startDate);
        end.setDate(start.getDate() + 27); 

        const formattedEndDate = end.toISOString().split('T')[0];

        // Added: AND status != 'Completed' so they vanish from the active list
        const queryText = `
            SELECT id, title, date::text, time_slot, assigned_to, status 
            FROM jobs 
            WHERE date >= $1 AND date <= $2 AND status != 'Completed'
            ORDER BY date ASC, time_slot ASC;
        `;
        
        const { rows } = await pool.query(queryText, [startDate, formattedEndDate]);
        
        res.json({
            meta: { rangeStart: startDate, rangeEnd: formattedEndDate, totalJobs: rows.length },
            jobs: rows
        });

    } catch (err) {
        console.error('Error fetching rota data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. POST Log a new job
router.post('/jobs', async (req, res) => {
    try {
        const { title, date, time_slot, assigned_to } = req.body;

        if (!title || !date) {
            return res.status(400).json({ error: 'Title and date are required' });
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

// 3. PUT Mark Job as Completed (NEW ROUTE)
router.put('/jobs/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;
        const queryText = `UPDATE jobs SET status = 'Completed' WHERE id = $1`;
        
        await pool.query(queryText, [id]);
        res.json({ message: 'Job marked as completed successfully' });

    } catch (err) {
        console.error('Error completing job:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;