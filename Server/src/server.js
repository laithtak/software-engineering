const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csvParser = require('csv-parser');

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Create SQLite database and table
const db = new sqlite3.Database(':memory:'); // Use ':memory:' for in-memory database, replace with a file path for persistent storage

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      ACCOUNT_ID INTEGER PRIMARY KEY,
      CUSTOMER_ID INTEGER,
      INIT_BALANCE REAL,
      COUNTRY TEXT,
      ACCOUNT_TYPE TEXT,
      IS_FRAUD INTEGER,
      TX_BEHAVIOUR_ID INTEGER
    )
  `);
});

// Function to read CSV file and add records to the database
const importRecordsFromCSV = (filePath) => {
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      db.run(`
        INSERT INTO accounts 
        (ACCOUNT_ID, CUSTOMER_ID, INIT_BALANCE, COUNTRY, ACCOUNT_TYPE, IS_FRAUD, TX_BEHAVIOUR_ID) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [row.ACCOUNT_ID, row.CUSTOMER_ID, row.INIT_BALANCE, row.COUNTRY, row.ACCOUNT_TYPE, row.IS_FRAUD, row.TX_BEHAVIOUR_ID]);
    })
    .on('end', () => {
      console.log('CSV import complete.');
    });
};

importRecordsFromCSV('C:/Users/C-ROAD/Downloads/accounts.csv');


app.get('/api/balance/:accountID', (req, res) => {
  const accountID = req.params.accountID;
  db.get('SELECT balance FROM accounts WHERE accountID = ?', [accountID], (err, row) => {
    if (err) {
      console.error('Error fetching balance:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (row) {
      res.json({ balance: row.balance });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  });
});

app.post('/api/transfer', (req, res) => {
  const { accountID, amount } = req.body;

  db.get('SELECT balance FROM accounts WHERE accountID = ?', [accountID], (err, row) => {
    if (err) {
      console.error('Error fetching balance:', err);
      res.status(500).json({ error: 'Internal server error' });
    } else if (row) {
      const currentBalance = row.balance;
      if (currentBalance >= amount) {
        // Update balance and record transaction
        const newBalance = currentBalance - amount;
        db.run('UPDATE accounts SET balance = ? WHERE accountID = ?', [newBalance, accountID], (updateErr) => {
          if (updateErr) {
            console.error('Error updating balance:', updateErr);
            res.status(500).json({ error: 'Internal server error' });
          } else {
            // Implement logic to record the transaction in a separate transactions table
            res.json({ success: true });
          }
        });
      } else {
        res.status(403).json({ error: 'Insufficient funds' });
      }
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});