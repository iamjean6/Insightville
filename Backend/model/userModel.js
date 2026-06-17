import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null values if email is omitted
    },
    password: {
        type: String,
        // Password is not required for OAuth users
        required: function() { return !this.googleId; } 
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatarUrl: {
        type: String
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    refreshToken:{
        type: String
    },
    credits: {
        type: Number,
        default: 6
    }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
