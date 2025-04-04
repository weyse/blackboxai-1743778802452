const express = require('express');
const router = express.Router();
const { db } = require('../database');
const authMiddleware = require('../middlewares/authMiddleware');

// Get all accounts
router.get('/accounts', authMiddleware, (req, res) => {
    db.all('SELECT * FROM accounts ORDER BY account_code', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Create new account
router.post('/accounts', authMiddleware, (req, res) => {
    const { account_code, account_name, account_type, normal_balance } = req.body;
    
    db.run(
        'INSERT INTO accounts (account_code, account_name, account_type, normal_balance) VALUES (?, ?, ?, ?)',
        [account_code, account_name, account_type, normal_balance],
        function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ 
                id: this.lastID,
                account_code,
                account_name,
                account_type,
                normal_balance
            });
        }
    );
});

module.exports = router;