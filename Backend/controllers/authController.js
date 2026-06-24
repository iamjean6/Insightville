import User from "../model/userModel.js";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import cacheService from "../cache/cache.js";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;


if(!JWT_SECRET || !REFRESH_SECRET){
    throw new Error("Critical: JWT_SECRET or REFRESH_SECRET environment variable is missing.")
}

const generateToken = (id) => {
    return jwt.sign({ id }, 
        JWT_SECRET, {
        expiresIn: "15m"
    });
};
const generateRefreshToken =(id) =>{
    return jwt.sign({id},
        REFRESH_SECRET,{
            expiresIn:"7d"
        }
    )
}

const sendRefreshToken= (res, token)=>{
    res.cookie('refreshToken', token,{
        httpOnly: true,
        path: '/api/auth/refresh',
        secure: process.env.NODE_ENV === "production",
        sameSite: 'strict',
        maxAge: 7 * 24*60*60*1000
    })
}

export const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await User.findOne({ name });

        if (user && (await user.matchPassword(password))) {
            // Generate a 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const tempId = user._id.toString();

            // Save OTP in Redis/Cache for 5 minutes
            await cacheService.saveOtp(tempId, otp);

            const adminEmail = process.env.ADMIN_OTP_EMAIL;
            const resendApiKey = process.env.RESEND_API_KEY;
            
            if (adminEmail && resendApiKey) {
                const resend = new Resend(resendApiKey);
                // Send OTP via email
                await resend.emails.send({
                    from: "Insightville Security <onboarding@resend.dev>", // Or use your verified domain
                    to: adminEmail,
                    subject: "Your Insightville Admin Login Code",
                    html: `
                        <h2>Admin Login Attempt</h2>
                        <p>Your one-time passcode is: <strong>${otp}</strong></p>
                        <p>This code will expire in 5 minutes.</p>
                    `
                });
            } else {
                console.warn("RESEND_API_KEY or ADMIN_OTP_EMAIL is missing. OTP is:", otp);
            }

            // Return response indicating OTP is required
            res.status(200).json({
                success: true,
                requireOtp: true,
                tempId: tempId,
                message: "OTP sent to your email"
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid name or password" });
        }    

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { tempId, otp } = req.body;

        const savedOtp = await cacheService.fetchOtp(tempId);

        if (!savedOtp || savedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        const user = await User.findById(tempId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // OTP is valid, generate tokens
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        user.refreshToken.push(refreshToken);
        await user.save();
        
        sendRefreshToken(res, refreshToken);

        // Clear the OTP from cache
        await cacheService.saveOtp(tempId, null); // Overwrite with null/expire it

        res.status(200).json({
            success: true,
            token: accessToken,
            user: {
                id: user._id,
                name: user.name,
                role: user.role
            }
        });

    } catch (err) {
        console.error("OTP Verification error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Initial registration for the first admin (can be removed or protected later)
export const register = async (req, res) => {
    try {
        const { name, password, role } = req.body;

        const userExists = await User.findOne({ name });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const newUser = await User.create({
            name,
            password,
            role: role || "admin"
        });

        const accessToken = generateToken(newUser);
        const refreshToken = generateRefreshToken(newUser);
        
        newUser.refreshToken.push(refreshToken);
        await newUser.save();

        sendRefreshToken(res, refreshToken);
        if (newUser) {
            res.status(201).json({
                success: true,
                token: accessToken,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    role: newUser.role
                }
            });
        }
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
export const refresh = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Refresh token missing" });

    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        const user = await User.findById(decoded.id );

        if (!user || !user.refreshToken.includes(token)) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const AccessToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        
        // Remove the old token and add the new one
        user.refreshToken = user.refreshToken.filter(rt => rt !== token);
        user.refreshToken.push(newRefreshToken);
        await user.save();
        
        sendRefreshToken(res, newRefreshToken);
        res.json({ token: AccessToken });
    } catch (error) {
        console.error("Refresh Error:", error.message);
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};
export const logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        const user = await User.findOne({ refreshToken: token });
        if (user) {
            // Remove only this specific device's token
            user.refreshToken = user.refreshToken.filter(rt => rt !== token);
            await user.save();
        }
    }
    res.clearCookie('refreshToken', 
        { path: '/api/auth/refresh' ,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        });
    res.status(200).json({ message: "Logged out successfully" });
};
