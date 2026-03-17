function computeGrade(marks) {
  if (marks >= 90) return "A+";
  if (marks >= 80) return "A";
  if (marks >= 70) return "B+";
  if (marks >= 60) return "B";
  if (marks >= 50) return "C";
  if (marks >= 40) return "D";
  return "F";
}

module.exports = { computeGrade };

