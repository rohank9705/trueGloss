const sqlite3 = require('sqlite3').verbose();

// Connect to your existing database
const db = new sqlite3.Database('./truegloss.db', (err) => {
    if (err) {
        return console.error("Could not connect to database:", err.message);
    }
    console.log("Connected to the True Gloss database.");
});

db.serialize(() => {
    db.run(`DELETE FROM packages`, function(err) {
        if (err) {
            return console.error("Error clearing table:", err.message);
        }
        console.log(`Success! Deleted ${this.changes} test packages from the database.`);
    });

    db.run(`DELETE FROM sqlite_sequence WHERE name='packages'`, function(err) {
        if (!err) console.log("Reset package IDs back to 1.");
    });
});

db.close((err) => {
    if (err) return console.error(err.message);
    console.log("Database reset complete. You can now start your server.");
});