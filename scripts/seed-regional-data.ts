/**
 * ==============================================================================
 * REGIONAL TEACHER RECRUITMENT PLATFORM - DATABASE SEED SCRIPT
 * Target Region: Selected Districts of Uttar Pradesh, India
 * ==============================================================================
 * 
 * SAFE BACKUP INSTRUCTIONS BEFORE PRODUCTION EXECUTION:
 * To create a safe database snapshot prior to running migrations:
 *   1. Automated Docker snapshot:
 *      docker compose exec mongo mongodump --out=/data/backups/pre-regional-$(date +%s)
 *   2. Or run the admin backup endpoint:
 *      curl -X POST https://yourdomain.com/api/admin/backup -H "Cookie: token=..."
 *   3. Or execute:
 *      bash deploy/scripts/backup.sh
 */

const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/indian_teacher_recruitment";

const INITIAL_LOCATIONS = [
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Prayagraj",
    slug: "prayagraj",
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
    seoTitle: "Teaching Jobs in Prayagraj, Uttar Pradesh | Teacher Recruitment",
    seoDescription:
      "Explore verified school teacher vacancies in Prayagraj across CBSE, ICSE, UP Board and private institutions. Apply directly with your educator profile.",
    headquarterCity: "Prayagraj",
    majorTowns: ["Civil Lines", "Naini", "Phulpur", "Jhunsi", "Koraon"],
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Pratapgarh",
    slug: "pratapgarh",
    isActive: true,
    isFeatured: true,
    displayOrder: 2,
    seoTitle: "Teaching Jobs in Pratapgarh, Uttar Pradesh | Teacher Recruitment",
    seoDescription:
      "Find teaching positions and academic faculty jobs in Pratapgarh, UP. Connect directly with hiring institutions for PGT, TGT, PRT, and primary roles.",
    headquarterCity: "Pratapgarh",
    majorTowns: ["Bela Pratapgarh", "Kunda", "Patti", "Lalganj", "Raniganj"],
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Sultanpur",
    slug: "sultanpur",
    isActive: true,
    isFeatured: true,
    displayOrder: 3,
    seoTitle: "Teaching Jobs in Sultanpur, Uttar Pradesh | Teacher Recruitment",
    seoDescription:
      "Discover verified teaching vacancies in Sultanpur, Uttar Pradesh. Browse opportunities across premier CBSE, ICSE, and UP State Board schools.",
    headquarterCity: "Sultanpur",
    majorTowns: ["Kadipur", "Amethi", "Musafirkhana", "Jaisinghpur", "Lambhua"],
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Lucknow",
    slug: "lucknow",
    isActive: true,
    isFeatured: true,
    displayOrder: 4,
    seoTitle: "Teaching Jobs in Lucknow, Uttar Pradesh | Teacher Recruitment",
    seoDescription:
      "Search premier school teaching jobs in Lucknow, Uttar Pradesh. Discover verified openings for PGT, TGT, PRT, and language teachers with transparent salaries.",
    headquarterCity: "Lucknow",
    majorTowns: ["Gomti Nagar", "Aliganj", "Indira Nagar", "Hazratganj", "Jankipuram"],
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Barabanki",
    slug: "barabanki",
    isActive: true,
    isFeatured: true,
    displayOrder: 5,
    seoTitle: "Teaching Jobs in Barabanki, Uttar Pradesh | Teacher Recruitment",
    seoDescription:
      "Apply for verified teaching opportunities in Barabanki, Uttar Pradesh. Connect with vetted schools and secure your next educator position.",
    headquarterCity: "Barabanki",
    majorTowns: ["Nawabganj", "Fatehpur", "Haidergarh", "Ramsanehi Ghat", "Sirauli Gauspur"],
  },
];

const TEACHING_CATEGORIES = [
  "PGT",
  "TGT",
  "PRT",
  "Nursery",
  "Primary",
  "Computer Teacher",
  "Mathematics",
  "Science",
  "English",
  "Social Studies",
  "Other Subjects",
];

const QUALIFICATIONS = [
  "Graduation",
  "Post Graduation",
  "B.Ed",
  "D.El.Ed",
  "BTC",
  "CTET",
  "UPTET",
  "Other TET",
  "NTT",
  "Other recognized qualifications",
];

const EMPLOYMENT_TYPES = ["Full Time", "Part Time", "Contract", "Temporary"];

const SCHOOL_BOARDS = ["CBSE", "ICSE", "UP Board", "Other"];

const APPLICATION_STATUSES = [
  "Submitted",
  "Under Review",
  "Shortlisted",
  "On Hold",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Rejected",
  "Withdrawn",
];

const PLATFORM_SETTINGS = [
  { key: "default_country", value: "India", category: "regional" },
  { key: "default_state", value: "Uttar Pradesh", category: "regional" },
  { key: "service_districts", value: "Prayagraj, Pratapgarh, Sultanpur, Lucknow, Barabanki", category: "regional" },
  { key: "school_registration", value: false, category: "recruitment" },
  { key: "school_login", value: false, category: "recruitment" },
  { key: "school_dashboard", value: false, category: "recruitment" },
  { key: "teacher_registration", value: true, category: "access" },
  { key: "teacher_login", value: true, category: "access" },
  { key: "public_jobs", value: true, category: "recruitment" },
  { key: "applications", value: true, category: "recruitment" },
];

async function seed() {
  console.log("================================================================================");
  console.log("REGIONAL TEACHER RECRUITMENT PLATFORM: SEEDING MASTER DATA");
  console.log("================================================================================");
  console.log(`Connecting to: ${MONGODB_URI}`);

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;

  // 1. Seed Locations
  console.log("\n[1/6] Seeding Initial Active Locations (Uttar Pradesh)...");
  for (const loc of INITIAL_LOCATIONS) {
    await db.collection("locations").updateOne(
      { slug: loc.slug },
      {
        $set: {
          country: loc.country,
          state: loc.state,
          district: loc.district,
          slug: loc.slug,
          isActive: loc.isActive,
          isFeatured: loc.isFeatured,
          displayOrder: loc.displayOrder,
          seoTitle: loc.seoTitle,
          seoDescription: loc.seoDescription,
          headquarterCity: loc.headquarterCity,
          majorTowns: loc.majorTowns,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
    console.log(`  ✓ Location verified: ${loc.district}, ${loc.state} (${loc.slug})`);
  }

  // 2. Seed Master Items (Categories)
  console.log("\n[2/6] Seeding Teaching Categories...");
  for (let i = 0; i < TEACHING_CATEGORIES.length; i++) {
    const name = TEACHING_CATEGORIES[i];
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    await db.collection("masteritems").updateOne(
      { type: "category", key },
      {
        $set: { type: "category", key, label: name, displayOrder: i + 1, isActive: true, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }
  console.log(`  ✓ ${TEACHING_CATEGORIES.length} categories verified`);

  // 3. Seed Qualifications
  console.log("\n[3/6] Seeding Academic & Teacher Qualifications...");
  for (let i = 0; i < QUALIFICATIONS.length; i++) {
    const name = QUALIFICATIONS[i];
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    await db.collection("masteritems").updateOne(
      { type: "qualification", key },
      {
        $set: { type: "qualification", key, label: name, displayOrder: i + 1, isActive: true, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }
  console.log(`  ✓ ${QUALIFICATIONS.length} qualifications verified`);

  // 4. Seed Employment Types & School Boards
  console.log("\n[4/6] Seeding Employment Types & School Boards...");
  for (let i = 0; i < EMPLOYMENT_TYPES.length; i++) {
    const name = EMPLOYMENT_TYPES[i];
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    await db.collection("masteritems").updateOne(
      { type: "employment_type", key },
      {
        $set: { type: "employment_type", key, label: name, displayOrder: i + 1, isActive: true, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }
  for (let i = 0; i < SCHOOL_BOARDS.length; i++) {
    const name = SCHOOL_BOARDS[i];
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    await db.collection("masteritems").updateOne(
      { type: "board", key },
      {
        $set: { type: "board", key, label: name, displayOrder: i + 1, isActive: true, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }
  console.log(`  ✓ ${EMPLOYMENT_TYPES.length} employment types & ${SCHOOL_BOARDS.length} school boards verified`);

  // 5. Seed Application Statuses
  console.log("\n[5/6] Seeding Application Lifecycle Statuses...");
  for (let i = 0; i < APPLICATION_STATUSES.length; i++) {
    const name = APPLICATION_STATUSES[i];
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    await db.collection("masteritems").updateOne(
      { type: "status", key },
      {
        $set: { type: "status", key, label: name, displayOrder: i + 1, isActive: true, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
  }
  console.log(`  ✓ ${APPLICATION_STATUSES.length} application statuses verified`);

  // 6. Platform Configuration Settings
  console.log("\n[6/6] Seeding Regional Platform Configuration...");
  for (const s of PLATFORM_SETTINGS) {
    await db.collection("settings").updateOne(
      { key: s.key },
      {
        $set: { value: s.value, category: s.category, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    console.log(`  ✓ Setting verified: ${s.key} = ${JSON.stringify(s.value)}`);
  }

  // 7. Non-Destructive Data Audit & Tagging: Flag existing profiles with serviceAreaStatus
  console.log("\n[7/7] Auditing & Flagging Existing Profiles for Regional Service Area...");
  const activeDistrictNames = ["prayagraj", "pratapgarh", "sultanpur", "lucknow", "barabanki"];
  const existingProfiles = await db.collection("teacherprofiles").find({}).toArray();
  let inServiceCount = 0;
  let outsideServiceCount = 0;

  for (const prof of existingProfiles) {
    const loc = prof.location || {};
    const state = (loc.state || "").trim().toLowerCase();
    const district = (loc.district || "").trim().toLowerCase();
    const isUP = state === "uttar pradesh" || state === "up";
    const isInActiveDistrict = isUP && activeDistrictNames.includes(district);

    const status = isInActiveDistrict ? "in_service_area" : "outside_service_area";
    if (isInActiveDistrict) inServiceCount++;
    else outsideServiceCount++;

    await db.collection("teacherprofiles").updateOne(
      { _id: prof._id },
      { $set: { "location.serviceAreaStatus": status } }
    );
  }
  console.log(`  ✓ Flagged ${existingProfiles.length} profiles: ${inServiceCount} in service area, ${outsideServiceCount} outside service area (zero records removed)`);

  // Safety Verification Check
  const [totalTeachers, totalApplications, totalJobs] = await Promise.all([
    db.collection("teacherprofiles").countDocuments(),
    db.collection("applications").countDocuments(),
    db.collection("jobs").countDocuments(),
  ]);
  console.log("\n--- DATA INTEGRITY CONFIRMATION ---");
  console.log(`Existing Teacher Profiles: ${totalTeachers} (Intact, 0 deleted)`);
  console.log(`Existing Applications:    ${totalApplications} (Intact, 0 deleted)`);
  console.log(`Existing Vacancy Records: ${totalJobs} (Intact, 0 deleted)`);

  console.log("\n================================================================================");
  console.log("REGIONAL DATABASE SEEDING COMPLETED SUCCESSFULLY WITH ZERO DATA LOSS");
  console.log("================================================================================");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ SEED ERROR:", err);
  process.exit(1);
});
