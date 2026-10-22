const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Catch unexpected database disconnects instantly so the server never crashes
pool.on('error', (err, client) => {
    console.error('Unexpected database disconnect (Neon sleep). Server is still running.', err.message);
});

module.exports = pool;