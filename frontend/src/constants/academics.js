export const DEFAULT_DEPARTMENTS = [
  // Engineering (UG)
  { name: "B.E Computer Science Engineering (CSE)", category: "Engineering", level: "UG" },
  { name: "B.Tech Computer Science Engineering", category: "Engineering", level: "UG" },
  { name: "B.Tech Artificial Intelligence & Data Science", category: "Engineering", level: "UG" },
  { name: "B.E Information Technology (IT)", category: "Engineering", level: "UG" },
  { name: "B.Tech Cyber Security", category: "Engineering", level: "UG" },
  // Core Engineering
  { name: "B.E Mechanical Engineering", category: "Engineering", level: "UG" },
  { name: "B.E Civil Engineering", category: "Engineering", level: "UG" },
  { name: "B.E Electrical and Electronics Engineering (EEE)", category: "Engineering", level: "UG" },
  { name: "B.E Electronics and Communication Engineering (ECE)", category: "Engineering", level: "UG" },
  // Other Engineering
  { name: "B.Tech Biotechnology", category: "Engineering", level: "UG" },
  { name: "B.E Biomedical Engineering", category: "Engineering", level: "UG" },
  { name: "B.Tech Automobile Engineering", category: "Engineering", level: "UG" },
  { name: "B.E Mechatronics", category: "Engineering", level: "UG" },

  // Computer Related (Mapped to Science per options)
  { name: "B.Sc Computer Science (CS)", category: "Science", level: "UG" },
  { name: "B.Sc Information Technology (IT)", category: "Science", level: "UG" },
  { name: "BCA", category: "Science", level: "UG" },
  { name: "B.Sc Data Science", category: "Science", level: "UG" },
  { name: "B.Sc Artificial Intelligence", category: "Science", level: "UG" },

  // Science
  { name: "B.Sc Mathematics", category: "Science", level: "UG" },
  { name: "B.Sc Physics", category: "Science", level: "UG" },
  { name: "B.Sc Chemistry", category: "Science", level: "UG" },
  { name: "B.Sc Biotechnology", category: "Science", level: "UG" },
  { name: "B.Sc Microbiology", category: "Science", level: "UG" },

  // Commerce & Management
  { name: "B.Com", category: "Commerce", level: "UG" },
  { name: "BBA", category: "Commerce", level: "UG" },

  // Arts
  { name: "B.A English", category: "Arts", level: "UG" },
  { name: "B.A Tamil", category: "Arts", level: "UG" },
  { name: "B.Sc Visual Communication", category: "Arts", level: "UG" },
];

export const DEPARTMENTS = DEFAULT_DEPARTMENTS.map(d => ({ value: d.name, label: d.name }));


export const UG_COURSES = [
  "BA",
  "B.Sc",
  "B.Com",
  "BBA",
  "BMS",
  "BCA",
  "B.Sc IT",
  "B.Tech / B.E",
  "MBBS",
  "BDS",
  "B.Pharm",
  "B.Sc Nursing",
  "BPT",
  "BAMS / BHMS / BNYS",
  "LLB",
  "BA LLB / BBA LLB",
  "B.Des",
  "BFA",
  "Animation & VFX",
  "BHM",
  "BTTM",
  "B.Ed",
];

export const PG_COURSES = [
  "MA",
  "M.Sc",
  "M.Com",
  "MBA",
  "MCA",
  "M.Tech / ME",
  "MD",
  "MS",
  "MDS",
  "LLM",
  "M.Des",
  "M.Ed",
];

export const DEPARTMENT_COURSE_OPTIONS = {
  "Arts & Humanities": [
    { courseName: "BA English", courseCode: "BA-ENG" },
    { courseName: "BA History", courseCode: "BA-HIS" },
    { courseName: "BA Economics", courseCode: "BA-ECO" },
  ],
  Engineering: [
    { courseName: "B.E Computer Science", courseCode: "BE-CSE" },
    { courseName: "B.E Mechanical", courseCode: "BE-MECH" },
    { courseName: "B.Tech IT", courseCode: "BTECH-IT" },
  ],
  "Commerce & Management": [
    { courseName: "B.Com", courseCode: "BCOM" },
    { courseName: "BBA", courseCode: "BBA" },
    { courseName: "MBA", courseCode: "MBA" },
  ],
};

