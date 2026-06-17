import jwt from "jsonwebtoken";
import User from "../model/userModel.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (token) {
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select("-password");

            return next();
        } catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({ success: false, message: "Not authorized, token failed" });
        }
    }

    return res.status(401).json({ success: false, message: "Not authorized, no token" });
};
