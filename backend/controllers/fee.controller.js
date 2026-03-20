const Fee = require('../models/fee.model');
const StudentFee = require('../models/studentFee.model');
const { Student: Student } = require('../models/student.model');
const FeeReceipt = require('../models/feeReceipt.model');
const Admin = require('../models/admin.model');
const Sclass = require('../models/sclass.model');
const amountToWords = require('../utils/amountToWords.js');

const normalizeReceiptItems = (items = []) => {
    const normalizedItems = Array.isArray(items) ? items : [items];

    return normalizedItems
        .filter((item) => item && (item.particulars || item.title) && item.amount !== undefined)
        .map((item) => ({
            particulars: String(item.particulars || item.title || '').trim(),
            amount: Number(item.amount) || 0,
        }))
        .filter((item) => item.particulars && item.amount > 0);
};

const generateBillNumber = async () => {
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

    for (let attempt = 0; attempt < 5; attempt += 1) {
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const billNumber = `RCPT-${ymd}-${suffix}`;
        const exists = await FeeReceipt.findOne({ billNumber });
        if (!exists) return billNumber;
    }

    return `RCPT-${ymd}-${Date.now().toString().slice(-6)}`;
};

const feeCreate = async (req, res) => {
    try {
        const { title, amount, sclassName, school, description, dueDate, adminID } = req.body;

        const fee = new Fee({
            title,
            amount,
            sclassName,
            school,
            description,
            dueDate,
            createdByAdmin: adminID
        });

        const result = await fee.save();

        // Automatically assign this fee to all students in the class
        const students = await Student.find({ sclassName, school });

        if (students.length > 0) {
            const studentFeeRecords = students.map(student => ({
                studentId: student._id,
                feeId: result._id,
                amount: amount,
                status: 'pending'
            }));
            await StudentFee.insertMany(studentFeeRecords);
        }

        res.status(200).json({ message: "Fee created and assigned successfully", result });
    } catch (err) {
        res.status(500).json({ message: "Error creating fee", error: err });
    }
};

const getStudentFees = async (req, res) => {
    try {
        const studentFees = await StudentFee.find({ studentId: req.params.id })
            .populate('feeId', 'title description dueDate')
            .populate('receiptId', 'billNumber receiptDate totalAmount')
            .sort({ createdAt: -1 });

        if (studentFees.length > 0) {
            res.status(200).json(studentFees);
        } else {
            res.status(200).json({ message: "No fees found for this student", empty: true });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching student fees", error: err });
    }
};

const feeList = async (req, res) => {
    try {
        const fees = await StudentFee.find({})
            .populate('studentId', 'name rollNum')
            .populate('feeId', 'title amount dueDate')
            .populate('receiptId', 'billNumber receiptDate totalAmount')
            .sort({ createdAt: -1 });

        if (fees.length > 0) {
            res.status(200).json(fees);
        } else {
            res.status(200).json({ message: "No fee records found" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error fetching fee list", error: err });
    }
};

const deleteFee = async (req, res) => {
    try {
        // Find if it's a base fee being deleted - this would be more complex as we'd need to delete all related StudentFees
        // For simplicity, we'll delete a specific StudentFee record if id is passed
        const result = await StudentFee.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Fee record deleted successfully", result });
    } catch (error) {
        res.status(500).json({ message: "Error deleting fee", error });
    }
};

const createFeeReceipt = async (req, res) => {
    try {
        const {
            studentId,
            studentFeeId,
            paymentType,
            paymentReference,
            items,
            receiptDate,
            institutionLocation,
            year,
        } = req.body;

        let studentFee = null;
        let student = null;

        if (studentFeeId) {
            studentFee = await StudentFee.findById(studentFeeId)
                .populate('feeId')
                .populate('studentId');

            if (!studentFee) {
                return res.status(404).json({ message: 'Student fee record not found' });
            }

            if (studentFee.receiptId) {
                const existingReceipt = await FeeReceipt.findById(studentFee.receiptId);
                if (existingReceipt) {
                    return res.status(200).json({ receipt: existingReceipt, alreadyExists: true });
                }
            }

            student = studentFee.studentId;
        } else if (studentId) {
            student = await Student.findById(studentId);
        }

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        let feeItems = normalizeReceiptItems(items);

        if (!feeItems.length && studentFee) {
            feeItems = normalizeReceiptItems([
                {
                    particulars: studentFee.feeId?.title || 'Fee Payment',
                    amount: studentFee.amount,
                },
            ]);
        }

        if (!feeItems.length) {
            return res.status(400).json({ message: 'At least one fee item is required' });
        }

        const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

        if (totalAmount <= 0) {
            return res.status(400).json({ message: 'Total amount must be greater than zero' });
        }

        const admin = await Admin.findById(student.school);
        const sclass = student.sclassName ? await Sclass.findById(student.sclassName) : null;

        const billNumber = await generateBillNumber();
        const receiptTimestamp = receiptDate ? new Date(receiptDate) : new Date();

        const receipt = await FeeReceipt.create({
            studentId: student._id,
            studentFeeId: studentFeeId || null,
            school: student.school,
            billNumber,
            receiptDate: receiptTimestamp,
            paymentType: paymentType || (studentFee?.stripePaymentIntentId ? 'online' : 'cash'),
            paymentReference: paymentReference || studentFee?.stripePaymentIntentId || null,
            items: feeItems,
            totalAmount,
            amountInWords: amountToWords(totalAmount),
            institution: {
                name: admin?.schoolName || 'Institution',
                location: institutionLocation || process.env.INSTITUTION_LOCATION || '',
            },
            student: {
                name: student.name,
                registerNumber: student.registerNumber || '',
                rollNum: student.rollNum || '',
                department: student.departmentName || sclass?.sclassName || '',
                course: student.courseName || '',
                year: year || '',
            },
            issuedByAdmin: admin?._id || null,
        });

        if (studentFeeId) {
            const updateFields = { receiptId: receipt._id };
            if (studentFee?.status !== 'paid') {
                updateFields.status = 'paid';
                updateFields.paidAt = new Date();
            }

            await StudentFee.findByIdAndUpdate(studentFeeId, updateFields);
        }

        return res.status(200).json({ receipt });
    } catch (error) {
        return res.status(500).json({ message: 'Unable to generate fee receipt', error });
    }
};

const getStudentReceipts = async (req, res) => {
    try {
        const receipts = await FeeReceipt.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });

        if (!receipts.length) {
            return res.status(200).json({ message: 'No receipts found', empty: true });
        }

        return res.status(200).json(receipts);
    } catch (error) {
        return res.status(500).json({ message: 'Unable to load receipts', error });
    }
};

const getReceiptById = async (req, res) => {
    try {
        const receipt = await FeeReceipt.findById(req.params.receiptId);
        if (!receipt) {
            return res.status(404).json({ message: 'Receipt not found' });
        }

        return res.status(200).json(receipt);
    } catch (error) {
        return res.status(500).json({ message: 'Unable to load receipt', error });
    }
};

module.exports = {
    feeCreate,
    getStudentFees,
    feeList,
    deleteFee,
    createFeeReceipt,
    getStudentReceipts,
    getReceiptById,
};
