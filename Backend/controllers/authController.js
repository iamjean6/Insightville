import User from "../model/userModel.js";
import jwt from "jsonwebtoken";


const JWT_SECRET =process.env.JWT_SECRET;
const REFRESH_SECRET= process.env.REFRESH_SECRET


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
            
        const accessToken =generateToken(user._id)
        const refreshToken= generateRefreshToken(user._id)
        user.refreshToken = refreshToken;
        await user.save() 
        sendRefreshToken(res, refreshToken)
            res.status(200).json({
                success: true,
                token: accessToken,
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

        const newUser = await User.create({
            name,
            password,
            role: role || "admin"
        });

        const accessToken = generateToken(newUser);
        const refreshToken = generateRefreshToken(newUser);
        
        newUser.refreshToken = refreshToken;
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

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const AccessToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        user.refreshToken = newRefreshToken;
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
            user.refreshToken = null;
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
