import User from "../model/userModel.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret", {
        expiresIn: "1h"
    });
};

export const login = async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await User.findOne({ name });

        if (user && (await user.matchPassword(password))) {
            res.status(200).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid name or password" });
        }
    } catch (err) {
        console.error("Login error:", err);
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

        const user = await User.create({
            name,
            password,
            role: role || "admin"
        });

        if (user) {
            res.status(201).json({
                success: true,
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    name: user.name,
                    role: user.role
                }
            });
        }
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
