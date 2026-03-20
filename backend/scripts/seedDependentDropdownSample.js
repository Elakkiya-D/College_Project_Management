require("dotenv").config();
const mongoose = require("mongoose");

const Department = require('../models/Department.model');
const Course = require('../models/Course.model');

const departmentSeed = [
  {
    name: "Arts & Humanities",
    code: "ARTS",
    description: "Department for language, literature, history, and social studies",
  },
  {
    name: "Engineering",
    code: "ENG",
    description: "Department for engineering and technology programs",
  },
  {
    name: "Commerce & Management",
    code: "COMM",
    description: "Department for commerce and management programs",
  },
];

const courseSeed = {
  ARTS: [
    { courseName: "BA English", courseCode: "BA-ENG", credits: 3 },
    { courseName: "BA History", courseCode: "BA-HIS", credits: 3 },
    { courseName: "BA Economics", courseCode: "BA-ECO", credits: 3 },
  ],
  ENG: [
    { courseName: "B.E Computer Science", courseCode: "BE-CSE", credits: 4 },
    { courseName: "B.E Mechanical", courseCode: "BE-MECH", credits: 4 },
    { courseName: "B.Tech IT", courseCode: "BTECH-IT", credits: 4 },
  ],
  COMM: [
    { courseName: "B.Com", courseCode: "BCOM", credits: 3 },
    { courseName: "BBA", courseCode: "BBA", credits: 3 },
    { courseName: "MBA", courseCode: "MBA", credits: 4 },
  ],
};

async function seed() {
  const mongoUri = process.env.MONGO_URI || process.env.mongo;

  if (!mongoUri) {
    throw new Error("Missing MONGO_URI connection string in environment.");
  }

  await mongoose.connect(mongoUri);

  const departmentMap = {};

  for (const entry of departmentSeed) {
    const department = await Department.findOneAndUpdate(
      { code: entry.code },
      { $set: entry },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    departmentMap[entry.code] = department._id;
  }

  for (const [departmentCode, courses] of Object.entries(courseSeed)) {
    for (const item of courses) {
      await Course.findOneAndUpdate(
        { code: item.courseCode },
        {
          $set: {
            courseName: item.courseName,
            courseCode: item.courseCode,
            credits: item.credits,
            departmentId: departmentMap[departmentCode],
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  await mongoose.disconnect();
  console.log("Seeded dependent dropdown sample data successfully.");
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
