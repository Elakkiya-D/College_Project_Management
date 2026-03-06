const Assignment = require('../models/assignmentSchema.js');

const assignmentCreate = async (req, res) => {
    try {
        const assignment = new Assignment({
            ...req.body
        });
        const result = await assignment.save();
        res.send(result);
    } catch (err) {
        res.status(500).json(err);
    }
};

const assignmentList = async (req, res) => {
    try {
        const assignments = await Assignment.find({ sclassName: req.params.id }).populate("subject", "subName").populate("teacher", "name");
        if (assignments.length > 0) {
            res.send(assignments);
        } else {
            res.send({ message: "No assignments found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const getTeacherAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacher: req.params.id }).populate("subject", "subName");
        if (assignments.length > 0) {
            res.send(assignments);
        } else {
            res.send({ message: "No assignments found" });
        }
    } catch (err) {
        res.status(500).json(err);
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const result = await Assignment.findByIdAndDelete(req.params.id);
        res.send(result);
    } catch (error) {
        res.status(500).json(err);
    }
};

module.exports = { assignmentCreate, assignmentList, getTeacherAssignments, deleteAssignment };
