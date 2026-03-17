const mongoose = require('mongoose');

const feeReceiptSchema = new mongoose.Schema({
    billNumber: {
        type: String,
        required: true,
        unique: true,
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true,
    },
    studentFeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'studentFee',
        default: null,
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        required: true,
    },
    receiptDate: {
        type: Date,
        required: true,
    },
    paymentType: {
        type: String,
        required: true,
    },
    paymentReference: {
        type: String,
        default: null,
    },
    items: [
        {
            particulars: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    amountInWords: {
        type: String,
        required: true,
    },
    institution: {
        name: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            default: '',
        },
    },
    student: {
        name: {
            type: String,
            required: true,
        },
        registerNumber: {
            type: String,
            default: '',
        },
        rollNum: {
            type: String,
            default: '',
        },
        department: {
            type: String,
            default: '',
        },
        course: {
            type: String,
            default: '',
        },
        year: {
            type: String,
            default: '',
        },
    },
    issuedByAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'admin',
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('feeReceipt', feeReceiptSchema);
