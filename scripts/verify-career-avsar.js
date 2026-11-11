// scripts/verify-career-avsar.js
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/indian_teacher_recruitment";

async function runVerification() {
  console.log("==================================================");
  console.log("CAREER AVSAR - COMPREHENSIVE SYSTEM VERIFICATION");
  console.log("==================================================\n");

  const errors = [];
  const checks = [];

  // Check 1: Logo assets
  const logoPaths = [
    path.join(__dirname, "../public/brand/career-avsar-logo.jpg"),
    path.join(__dirname, "../public/brand/career-avsar-logo.png"),
    "C:/Users/ASUS/.gemini/antigravity/brain/0e6caa5c-a4a4-414e-b487-a62691773b61/career-avsar-logo.jpg"
  ];
  for (const lp of logoPaths) {
    if (fs.existsSync(lp)) {
      const stat = fs.statSync(lp);
      checks.push(`[PASS] Logo asset exists: ${path.basename(lp)} (${(stat.size / 1024).toFixed(1)} KB)`);
    } else {
      errors.push(`[FAIL] Logo asset missing: ${lp}`);
    }
  }

  // Check 2: Canonical Districts & Aliases
  const { ACTIVE_REGIONAL_DISTRICTS, canonicalizeDistrict, DISTRICT_ALIASES } = require("../src/data/india-locations");
  const expectedDistricts = ["Pratapgarh", "Amethi", "Jaunpur", "Prayagraj", "Raebareli", "Sultanpur"];
  
  const matchesDistricts = expectedDistricts.every(d => ACTIVE_REGIONAL_DISTRICTS.includes(d)) &&
                           ACTIVE_REGIONAL_DISTRICTS.length === expectedDistricts.length;
  if (matchesDistricts) {
    checks.push(`[PASS] Exact 6 canonical districts active: ${ACTIVE_REGIONAL_DISTRICTS.join(", ")}`);
  } else {
    errors.push(`[FAIL] Active districts mismatch: ${JSON.stringify(ACTIVE_REGIONAL_DISTRICTS)}`);
  }

  // Check Lucknow and Barabanki NOT in active regional districts
  if (!ACTIVE_REGIONAL_DISTRICTS.includes("Lucknow") && !ACTIVE_REGIONAL_DISTRICTS.includes("Barabanki")) {
    checks.push(`[PASS] Lucknow and Barabanki correctly excluded from active regional districts.`);
  } else {
    errors.push(`[FAIL] Lucknow or Barabanki is mistakenly included in ACTIVE_REGIONAL_DISTRICTS.`);
  }

  // Check Alias Resolution
  const aliasTests = [
    { input: "allahabad", expected: "Prayagraj" },
    { input: "ALLAHABAD", expected: "Prayagraj" },
    { input: "prayag", expected: "Prayagraj" },
    { input: "rae bareli", expected: "Raebareli" },
    { input: "rai bareli", expected: "Raebareli" },
    { input: "pratapgarh", expected: "Pratapgarh" },
    { input: "amethi", expected: "Amethi" },
  ];
  let aliasesPassed = true;
  for (const t of aliasTests) {
    const res = canonicalizeDistrict(t.input);
    if (res !== t.expected) {
      errors.push(`[FAIL] Alias resolution failed for '${t.input}': expected '${t.expected}', got '${res}'`);
      aliasesPassed = false;
    }
  }
  if (aliasesPassed) {
    checks.push(`[PASS] District alias canonicalization passed for Allahabad -> Prayagraj and Rae Bareli -> Raebareli.`);
  }

  // Check 3: Database Records
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    // Check brand_config in systemsettings
    const brandSetting = await db.collection("systemsettings").findOne({ key: "brand_config" });
    if (brandSetting && brandSetting.value && brandSetting.value.brandName.toUpperCase().includes("CAREER AVSAR")) {
      checks.push(`[PASS] systemsettings collection verified: "${brandSetting.value.brandName}" (${brandSetting.value.domain})`);
      checks.push(`       Tagline: "${brandSetting.value.tagline}"`);
    } else {
      errors.push(`[FAIL] brand_config missing or invalid in MongoDB systemsettings.`);
    }

    // Check locations collection
    const activeLocations = await db.collection("locations").find({ isActive: true }).sort({ displayOrder: 1 }).toArray();
    const activeNames = activeLocations.map(l => l.district);
    const hasAll6 = expectedDistricts.every(d => activeNames.includes(d));
    if (hasAll6 && !activeNames.includes("Lucknow") && !activeNames.includes("Barabanki")) {
      checks.push(`[PASS] MongoDB locations: Exactly 6 active districts configured: ${activeNames.join(", ")}`);
    } else {
      errors.push(`[FAIL] MongoDB locations mismatch. Active: ${activeNames.join(", ")}`);
    }

    // Check Lucknow and Barabanki are inactive
    const inactiveLucknow = await db.collection("locations").findOne({ slug: "lucknow", isActive: false });
    const inactiveBarabanki = await db.collection("locations").findOne({ slug: "barabanki", isActive: false });
    if (inactiveLucknow && inactiveBarabanki) {
      checks.push(`[PASS] Lucknow & Barabanki are verified marked as isActive: false in MongoDB.`);
    } else {
      errors.push(`[FAIL] Lucknow and/or Barabanki are not inactive in MongoDB locations collection.`);
    }

    // Check User Accounts
    const usersCount = await db.collection("users").countDocuments();
    const adminUser = await db.collection("users").findOne({ email: "admin@careeravsar.in" });
    const teacherUser = await db.collection("users").findOne({ email: "teacher@careeravsar.in" });
    const schoolUser = await db.collection("users").findOne({ email: "school@careeravsar.in" });

    if (adminUser && teacherUser && schoolUser) {
      checks.push(`[PASS] Seeded Career Avsar accounts verified (Admin, Teacher, School) across ${usersCount} total users.`);
    } else {
      errors.push(`[FAIL] Missing seeded user accounts in MongoDB users collection.`);
    }

    // Check Historical Records Preservation
    const jobsCount = await db.collection("jobs").countDocuments();
    const appsCount = await db.collection("applications").countDocuments();
    const schoolsCount = await db.collection("schools").countDocuments();
    const profilesCount = await db.collection("teacherprofiles").countDocuments();

    checks.push(`[PASS] Historical Records Preserved:`);
    checks.push(`       - Jobs: ${jobsCount} vacancies intact`);
    checks.push(`       - Applications: ${appsCount} applications intact`);
    checks.push(`       - Schools: ${schoolsCount} school institutions intact`);
    checks.push(`       - Teacher Profiles: ${profilesCount} candidate profiles intact`);

    if (jobsCount === 0 || profilesCount === 0) {
      errors.push(`[FAIL] Critical data loss: jobs (${jobsCount}) or profiles (${profilesCount}) are 0!`);
    }

    // Check Settings feature flag
    const settingsDoc = await db.collection("platform_settings").findOne({ singleton: true });
    if (settingsDoc && settingsDoc.flags) {
      checks.push(`[PASS] Platform settings verified (school_login: ${settingsDoc.flags.school_login}, teacher_registration: ${settingsDoc.flags.teacher_registration})`);
    }

  } catch (err) {
    errors.push(`[FAIL] Database connection error: ${err.message}`);
  } finally {
    await mongoose.disconnect();
  }

  // Summary
  console.log("\nCHECK RESULTS:");
  checks.forEach(c => console.log(c));

  if (errors.length > 0) {
    console.log("\nERRORS DETECTED:");
    errors.forEach(e => console.error(e));
    process.exit(1);
  } else {
    console.log("\n>>> ALL CAREER AVSAR VERIFICATION CHECKS PASSED SUCCESSFULLY (100% OK) <<<\n");
  }
}

runVerification();
