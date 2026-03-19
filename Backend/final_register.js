import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin"], default: "admin" }
});

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model("User_Temp", UserSchema); // Use a temp name to avoid conflicts if needed

const register = async () => {
    try {
        console.log('Connecting to:', process.env.MONGODB_URL);
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        const name = 'jean_obuya6';
        const password = 'password#6';
        const role = 'admin';

        // Check if user exists in the REAL User model
        // To be safe, let's just use the connection to create the user directly in the "users" collection
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ name });
        if (existingUser) {
            console.log('User already exists in "users" collection');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await usersCollection.insertOne({
            name,
            password: hashedPassword,
            role,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('Admin user registered successfully in "users" collection');
        process.exit(0);
    } catch (err) {
        console.error('Registration failed:', err);
        process.exit(1);
    }
};

register();
