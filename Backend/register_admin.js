import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/userModel.js';

dotenv.config();

const register = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const name = 'jean_obuya6';
        const password = 'password#6';
        const role = 'admin';

        const userExists = await User.findOne({ name });
        if (userExists) {
            console.log('User already exists');
            process.exit(0);
        }

        await User.create({ name, password, role });
        console.log('Admin user registered successfully');
        process.exit(0);
    } catch (err) {
        console.error('Registration failed:', err);
        process.exit(1);
    }
};

register();
