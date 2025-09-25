/**
 * Calculate profile completion percentage based on key fields.
 * Considered fields: skills, location, experienceYears, currentPosition,
 * currentCompany, expectedSalary, education.
 * @param {object} user - Mongoose user document or plain object
 * @returns {number} 0-100 integer percentage
 */
function calculateProfileCompletion(user) {
  if (!user) return 0;

  const checks = [];

  // skills: array non-empty
  const hasSkills = Array.isArray(user.skills) && user.skills.length > 0;
  checks.push(hasSkills);

  // location: object with any non-empty string value
  const loc = user.location || {};
  const hasLocation = ['city', 'state', 'country', 'zipCode'].some(k => {
    const v = loc[k];
    return typeof v === 'string' && v.trim().length > 0;
  });
  checks.push(hasLocation);

  // experienceYears: number not null/undefined
  const hasExperienceYears = user.experienceYears != null && !Number.isNaN(Number(user.experienceYears));
  checks.push(hasExperienceYears);

  // currentPosition: non-empty string
  const hasCurrentPosition = typeof user.currentPosition === 'string' && user.currentPosition.trim().length > 0;
  checks.push(hasCurrentPosition);

  // currentCompany: non-empty string
  const hasCurrentCompany = typeof user.currentCompany === 'string' && user.currentCompany.trim().length > 0;
  checks.push(hasCurrentCompany);

  // expectedSalary: number not null/undefined
  const hasExpectedSalary = user.expectedSalary != null && !Number.isNaN(Number(user.expectedSalary));
  checks.push(hasExpectedSalary);

  // education: array non-empty OR single string description present in first item
  const edu = Array.isArray(user.education) ? user.education : [];
  const hasEducation = edu.length > 0 && (
    typeof edu[0] === 'string' ? edu[0].trim().length > 0 : (
      (typeof edu[0]?.institution === 'string' && edu[0].institution.trim().length > 0) ||
      (typeof edu[0]?.degree === 'string' && edu[0].degree.trim().length > 0) ||
      (typeof edu[0]?.field === 'string' && edu[0].field.trim().length > 0) ||
      (typeof edu[0]?.description === 'string' && edu[0].description.trim().length > 0)
    )
  );
  checks.push(hasEducation);

  const filled = checks.filter(Boolean).length;
  const total = checks.length;
  return Math.round((filled / total) * 100);
}

module.exports = {
  calculateProfileCompletion
};


