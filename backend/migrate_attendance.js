const mongoose = require('mongoose');
const Attendance = require('./models/Attendance.model');

async function migrate() {
    try {
        await mongoose.connect('mongodb://localhost:27017/college'); // Assuming local based on previous logs
        console.log("Connected for migration...");
        
        // Update records missing studentModel
        await Attendance.updateMany(
            { studentModel: { $exists: false } },
            { $set: { studentModel: 'student' } }
        );
        
        // Update records missing courseModel
        await Attendance.updateMany(
            { courseModel: { $exists: false } },
            { $set: { courseModel: 'subject' } }
        );
        
        // Update records missing facultyModel
        await Attendance.updateMany(
            { facultyModel: { $exists: false } },
            { $set: { facultyModel: 'faculty' } }
        );
        
        console.log("Migration complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

migrate();
