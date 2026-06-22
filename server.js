require('dotenv').config(); // Loaded first to keep keys secure
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000; // Added missing PORT

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // <-- ADD THIS LINE

// Connect to Neon.tech Cloud Database
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for secure cloud connection
    }
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.stack);
    } else {
        console.log('Connected to the True Gloss Cloud Database!');
        initializeTables(); // Runs the schema build as soon as we connect
    }
});

// Build the Schema: Creates tables if they don't exist yet
// Postgres uses SERIAL PRIMARY KEY instead of AUTOINCREMENT
async function initializeTables() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS packages (
                id SERIAL PRIMARY KEY,
                name TEXT,
                price REAL,
                description TEXT,
                status TEXT,
                category TEXT
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT DEFAULT 'admin'
            )
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS enquiries (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Database tables verified/created successfully.");
    } catch (err) {
        console.error("Error initializing tables:", err);
    }
}

// --- AUTHENTICATION ROUTE ---
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // We use $1 and $2 for Postgres instead of the old SQLite ?
        const result = await db.query(`SELECT * FROM users WHERE email = $1 AND password = $2`, [email, password]);
        
        // If the database returns 0 rows, the user doesn't exist or password is wrong
        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
        
        // If we found a match, success!
        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        console.error("Login database error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// 3. The API Route: Saves packages to the cloud database
// Changed '?' to '$1, $2, $3...' and 'db.run()' to 'db.query()'
app.post('/api/packages', async (req, res) => {
    const { name, price, description, status, category } = req.body;
    const query = `
        INSERT INTO packages (name, price, description, status, category) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id
    `;
    
    try {
        const result = await db.query(query, [name, price, description, status, category]);
        console.log(`SUCCESS: "${name}" was securely saved to the cloud!`);
        res.status(200).json({ 
            message: "Package securely saved!", 
            packageId: result.rows[0].id // Postgres returns the new ID here
        });
    } catch (err) {
        console.error("Failed to save package:", err);
        res.status(500).json({ message: "Error saving to database." });
    }
});

// 4. Fetch All Packages
// Changed 'db.all()' to 'db.query()'
app.get('/api/packages', async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM packages ORDER BY id ASC`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching packages:", err);
        res.status(500).json({ message: "Error fetching packages" });
    }
});

// --- ENQUIRIES ROUTES ---

// 1. Fetch enquiries for the dashboard (Newest first)
app.get('/api/enquiries', async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM enquiries ORDER BY created_at DESC`);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching enquiries:", err);
        res.status(500).json({ message: "Error fetching enquiries" });
    }
});

// 2. Save a new enquiry from the Contact Form
app.post('/api/enquiries', async (req, res) => {
    const { name, email, message } = req.body;
    try {
        await db.query(
            `INSERT INTO enquiries (name, email, message) VALUES ($1, $2, $3)`, 
            [name, email, message]
        );
        res.status(200).json({ message: "Enquiry sent successfully!" });
    } catch (err) {
        console.error("Error saving enquiry:", err);
        res.status(500).json({ message: "Failed to send enquiry." });
    }
});

// 5. Delete a Package
app.delete('/api/packages/:id', async (req, res) => {
    const packageId = req.params.id;
    try {
        await db.query(`DELETE FROM packages WHERE id = $1`, [packageId]);
        console.log(`SUCCESS: Package ID ${packageId} was deleted.`);
        res.status(200).json({ message: "Package deleted successfully!" });
    } catch (err) {
        console.error("Error deleting package:", err);
        res.status(500).json({ message: "Failed to delete package." });
    }
});

// 6. Get a Single Package
app.get('/api/packages/:id', async (req, res) => {
    try {
        const result = await db.query(`SELECT * FROM packages WHERE id = $1`, [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Package not found." });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching single package:", err);
        res.status(500).json({ message: "Error fetching package data." });
    }
});

// 7. Edit a Package
app.put('/api/packages/:id', async (req, res) => {
    const { name, price, description, status, category } = req.body;
    const packageId = req.params.id;
    const query = `
        UPDATE packages 
        SET name = $1, price = $2, description = $3, status = $4, category = $5 
        WHERE id = $6
    `;
    try {
        await db.query(query, [name, price, description, status, category, packageId]);
        console.log(`SUCCESS: Package ID ${packageId} was updated.`);
        res.status(200).json({ message: "Package updated successfully!" });
    } catch (err) {
        console.error("Error updating package:", err);
        res.status(500).json({ message: "Failed to update package." });
    }
});

// Boot up the server
app.listen(PORT, () => {
    console.log(`True Gloss Admin Server is running on http://localhost:${PORT}`);
});