import jwt from "jsonwebtoken";
import User from "../model/userModel.js";


export const optionalAuth =async (req, res, next) =>{
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1]

    if (token){
        try{
           const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password'); 
        }catch(error){
            req.user = null
        }
    }else{
        req.user =null
    }
    next()
}