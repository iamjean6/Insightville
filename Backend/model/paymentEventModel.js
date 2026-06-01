import mongoose from "mongoose";

const paymentEventSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
        unique: true, // Idempotency key
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    creditsAdded: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "processed"
    }
}, { timestamps: true });

export default mongoose.model("PaymentEvent", paymentEventSchema);
