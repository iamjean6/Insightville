import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../model/userModel.js';
import jwt from 'jsonwebtoken';
import passport from 'passport';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
            // Also check if user exists by email (in case they registered manually before)
            const existingEmail = await User.findOne({ email: profile.emails[0].value });
            if (existingEmail) {
                // Link the google account to existing user
                existingEmail.googleId = profile.id;
                if (!existingEmail.avatarUrl) existingEmail.avatarUrl = profile.photos[0].value;
                user = await existingEmail.save();
            } else {
                // Create brand new user
                user = await User.create({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatarUrl: profile.photos[0].value,
                    role: "user" // Default to normal user, not admin
                });
            }
        }

        // Generate Token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        
        // Pass the user and token to the callback route
        return done(null, { user, token });
        
    } catch (error) {
        console.error("Passport Error:", error);
        return done(error, null);
    }
}));

export default passport;