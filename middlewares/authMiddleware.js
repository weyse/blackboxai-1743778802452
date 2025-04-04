const jwt = require('jsonwebtoken');
const { db } = require('../database');

module.exports = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).json({ error: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, decoded) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to authenticate token' });
        }

        // Verify user exists in database
        db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
            if (err || !user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Attach user to request
            req.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            next();
        });
    });
};