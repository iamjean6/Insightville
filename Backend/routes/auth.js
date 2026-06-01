import express from "express";
import passport from "passport";
import '../config/passport.js'; // Ensure passport config is loaded

const router = express.Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { session: false }),
    (req, res) => {
        try {
            res.cookie('token', req.user.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });
            res.redirect(process.env.CLIENT_ORIGIN || 'http://localhost:5173');
        } catch (error) {
            console.error('Error logging in', error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
);

export default router;