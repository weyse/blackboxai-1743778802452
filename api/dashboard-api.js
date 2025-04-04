const express = require('express');
const router = express.Router();
const { db } = require('../database');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
    // Get counts from database
    const dashboardData = {
        visitors: 0,
        revenue: 0,
        bookings: 0,
        lowStockItems: 0,
        recentActivities: []
    };

    // Get visitor count (example query)
    db.get(`SELECT COUNT(*) as count FROM reservations 
            WHERE date(start_time) = date('now')`, (err, row) => {
        if (!err && row) {
            dashboardData.visitors = row.count;
        }

        // Get today's revenue
        db.get(`SELECT SUM(amount) as total FROM payments 
                WHERE date(payment_date) = date('now')`, (err, row) => {
            if (!err && row) {
                dashboardData.revenue = row.total || 0;
            }

            // Get active bookings
            db.get(`SELECT COUNT(*) as count FROM reservations 
                    WHERE status = 'active'`, (err, row) => {
                if (!err && row) {
                    dashboardData.bookings = row.count;
                }

                // Get low stock items
                db.get(`SELECT COUNT(*) as count FROM inventory 
                        WHERE quantity < minimum_stock`, (err, row) => {
                    if (!err && row) {
                        dashboardData.lowStockItems = row.count;
                    }

                    // Get recent activities
                    db.all(`SELECT * FROM activities 
                            ORDER BY created_at DESC LIMIT 5`, (err, rows) => {
                        if (!err && rows) {
                            dashboardData.recentActivities = rows;
                        }

                        res.json(dashboardData);
                    });
                });
            });
        });
    });
});

module.exports = router;