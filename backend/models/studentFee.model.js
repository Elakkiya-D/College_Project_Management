const mongoose = require('mongoose');

const studentFeeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    feeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'fee',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    stripePaymentIntentId: {
        type: String
    },
    receiptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'feeReceipt',
        default: null,
    },
    paidAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model("studentFee", studentFeeSchema);
