const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./truegloss.db');

// Replace these with your desired credentials
const email = 'truegloss.tg@gmail.com';
const password = 'JobbyCake1'; 
const role = 'admin';

db.serialize(() => {
    // 1. Ensure the table exists
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT
    )`);

    // 2. Insert the user
    db.run(`INSERT INTO users (email, password, role) VALUES (?, ?, ?)`, 
    [email, password, role], (err) => {
        if (err) {
            console.error("Error: User might already exist or table issue.", err.message);
        } else {
            console.log(`Success! Admin user ${email} has been added.`);
        }
    });
});

db.close();