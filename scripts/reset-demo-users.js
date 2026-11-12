// scripts/reset-demo-users.js
const mongoose = require("mongoose");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Load .env if present
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/indian_teacher_recruitment";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const parts = stored.split(":");
  let salt, hash;
  if (parts.length === 3 && parts[0] === "scrypt") {
    salt = parts[1];
    hash = parts[2];
  } else if (parts.length === 2) {
    salt = parts[0];
    hash = parts[1];
  } else {
    return false;
  }
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (expected.length !== derived.length) return false;
  return crypto.timingSafeEqual(expected, derived);
}

const INITIAL_SERVICE_DISTRICTS = [
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Pratapgarh",
    slug: "pratapgarh",
    isActive: true,
    isFeatured: true,
    displayOrder: 1,
    seoTitle: "Teaching Jobs in Pratapgarh, Uttar Pradesh | Career Avsar",
    seoDescription:
      "Explore verified teaching vacancies and faculty positions in Pratapgarh, Uttar Pradesh with Career Avsar. PGT, TGT, PRT openings across CBSE, ICSE, and UP State Board schools.",
    headquarterCity: "Pratapgarh",
    majorTowns: ["Bela Pratapgarh", "Kunda", "Patti", "Lalganj", "Raniganj"],
    searchAliases: ["Bela Pratapgarh", "Partapgarh"],
    description:
      "Connecting qualified teachers with progressive CBSE, ICSE and state board schools across Pratapgarh, Kunda, and Patti.",
    bannerImage: "/images/districts/pratapgarh.jpg",
    landingPageVisible: true,
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Amethi",
    slug: "amethi",
    isActive: true,
    isFeatured: true,
    displayOrder: 2,
    seoTitle: "Teaching Jobs in Amethi, Uttar Pradesh | Career Avsar",
    seoDescription:
      "Discover verified school teacher positions in Amethi, Uttar Pradesh. Career Avsar connects qualified educators directly with hiring schools in Gauriganj, Musafirkhana, and Tiloi.",
    headquarterCity: "Gauriganj",
    majorTowns: ["Gauriganj", "Amethi", "Musafirkhana", "Tiloi", "Jagdishpur"],
    searchAliases: ["Chhatrapati Shahuji Maharaj Nagar"],
    description:
      "Discover trusted teaching vacancies across expanding educational institutions in Amethi, Gauriganj, and Jagdishpur.",
    bannerImage: "/images/districts/amethi.jpg",
    landingPageVisible: true,
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Jaunpur",
    slug: "jaunpur",
    isActive: true,
    isFeatured: true,
    displayOrder: 3,
    seoTitle: "Teaching Jobs in Jaunpur, Uttar Pradesh | Career Avsar",
    seoDescription:
      "Find verified school teacher jobs in Jaunpur, Uttar Pradesh. Apply for PGT, TGT, PRT, and primary teacher vacancies with Career Avsar.",
    headquarterCity: "Jaunpur",
    majorTowns: ["Jaunpur City", "Shahganj", "Machhlishahr", "Badlapur", "Kerakat", "Mariahu"],
    searchAliases: ["Shiraz-e-Hind", "Jaunpore"],
    description:
      "Join premier schools and inter colleges in Jaunpur, Shahganj, and Machhlishahr with transparent direct recruitment.",
    bannerImage: "/images/districts/jaunpur.jpg",
    landingPageVisible: true,
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Prayagraj",
    slug: "prayagraj",
    isActive: true,
    isFeatured: true,
    displayOrder: 4,
    seoTitle: "Teaching Jobs in Prayagraj, Uttar Pradesh | Career Avsar",
    seoDescription:
      "Explore verified school teacher vacancies in Prayagraj (Allahabad) across CBSE, ICSE, UP Board and private institutions. Connect with top schools via Career Avsar.",
    headquarterCity: "Prayagraj",
    majorTowns: ["Civil Lines", "Naini", "Phulpur", "Jhunsi", "Koraon", "Soraon"],
    searchAliases: ["Allahabad", "Prayag", "Ilhabad"],
    description:
      "Historic academic capital of Uttar Pradesh offering premier teaching opportunities across convent, CBSE, ICSE, and private academies.",
    bannerImage: "/images/districts/prayagraj.jpg",
    landingPageVisible: true,
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Raebareli",
    slug: "raebareli",
    isActive: true,
    isFeatured: true,
    displayOrder: 5,
    seoTitle: "Teaching Jobs in Raebareli, Uttar Pradesh | Career Avsar",
    seoDescription:
      "Apply for verified school teaching jobs in Raebareli, Uttar Pradesh with Career Avsar. Openings for PGT, TGT, PRT, and foundational educators.",
    headquarterCity: "Raebareli",
    majorTowns: ["Raebareli City", "Lalganj", "Salon", "Dalmau", "Unchahar", "Bachhrawan"],
    searchAliases: ["Rae Bareli", "Rai Bareli", "Raebarelly"],
    description:
      "Thriving educational corridor in central Uttar Pradesh connecting certified educators with reputed schools.",
    bannerImage: "/images/districts/raebareli.jpg",
    landingPageVisible: true,
  },
  {
    country: "India",
    state: "Uttar Pradesh",
    district: "Sultanpur",
    slug: "sultanpur",
    isActive: true,
    isFeatured: true,
    displayOrder: 6,
    seoTitle: "Teaching Jobs in Sultanpur, Uttar Pradesh | Career Avsar",
    seoDescription:
      "Discover verified teaching vacancies in Sultanpur, Uttar Pradesh. Browse openings across premier CBSE, ICSE, and UP State Board schools via Career Avsar.",
    headquarterCity: "Sultanpur",
    majorTowns: ["Sultanpur City", "Kadipur", "Lambhua", "Jaisinghpur", "Kurebhar"],
    searchAliases: ["Sooltanpoor"],
    description:
      "Vital eastern UP education center recruiting B.Ed and CTET qualified teachers for middle, high, and secondary schools.",
    bannerImage: "/images/districts/sultanpur.jpg",
    landingPageVisible: true,
  },
];

async function run() {
  console.log("==================================================");
  console.log("CAREER AVSAR: SEEDING / RESETTING DEMO ACCOUNTS");
  console.log("Target URI:", MONGODB_URI.replace(/:([^@]+)@/, ":****@"));
  console.log("==================================================\n");

  const connectOpts = {};
  if (process.env.MONGODB_DB_NAME) {
    connectOpts.dbName = process.env.MONGODB_DB_NAME;
  }

  await mongoose.connect(MONGODB_URI, connectOpts);
  const db = mongoose.connection.db;
  console.log(`[MONGODB] Connected to database: '${mongoose.connection.name}'\n`);

  const accounts = [
    {
      email: "admin@careeravsar.in",
      pass: "Admin@123",
      role: "admin",
      name: "Career Avsar Administrator",
    },
    {
      email: "teacher@careeravsar.in",
      pass: "Teacher@123",
      role: "candidate",
      name: "Ananya Verma",
    },
    {
      email: "school@careeravsar.in",
      pass: "School@123",
      role: "school",
      name: "Delhi Public Academy Recruitment Desk",
    },
    {
      email: "admin@eduniyukti.com",
      pass: "Admin@123",
      role: "admin",
      name: "Legacy Administrator",
    },
    {
      email: "teacher@eduniyukti.com",
      pass: "Teacher@123",
      role: "candidate",
      name: "Legacy Educator",
    },
  ];

  for (const acc of accounts) {
    const passwordHash = hashPassword(acc.pass);
    const res = await db.collection("users").findOneAndUpdate(
      { email: acc.email.toLowerCase() },
      {
        $set: {
          email: acc.email.toLowerCase(),
          passwordHash,
          role: acc.role,
          status: "active",
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: "after" }
    );

    const userId = res?._id || res?.value?._id;

    if (acc.role === "candidate" && userId) {
      await db.collection("teacherprofiles").updateOne(
        { userId },
        {
          $set: {
            fullName: acc.name,
            email: acc.email.toLowerCase(),
            mobile: "+91 98765 43210",
            gender: "Female",
            verificationStatus: "verified",
            profileCompleted: true,
            bio: "Passionate Senior Secondary Mathematics educator with 4 years experience preparing students for CBSE Board examinations.",
            location: {
              state: "Uttar Pradesh",
              district: "Prayagraj",
              city: "Civil Lines",
            },
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
    }

    const verified = verifyPassword(acc.pass, passwordHash);
    console.log(`✓ Account [${acc.role.toUpperCase()}]: ${acc.email} | Password: ${acc.pass} | Hash Valid: ${verified}`);
  }

  // Seed Locations
  console.log("\n[SEEDING 6 CANONICAL DISTRICTS]");
  for (const dist of INITIAL_SERVICE_DISTRICTS) {
    await db.collection("locations").updateOne(
      { slug: dist.slug },
      { $set: { ...dist, updatedAt: new Date() } },
      { upsert: true }
    );
    console.log(`✓ Location [${dist.district}] verified.`);
  }

  // Ensure login toggles are enabled
  await db.collection("systemsettings").updateOne(
    { key: "teacher_login" },
    { $set: { key: "teacher_login", value: true, updatedAt: new Date() } },
    { upsert: true }
  );
  await db.collection("systemsettings").updateOne(
    { key: "school_login" },
    { $set: { key: "school_login", value: true, updatedAt: new Date() } },
    { upsert: true }
  );
  await db.collection("systemsettings").updateOne(
    { key: "teacher_registration" },
    { $set: { key: "teacher_registration", value: true, updatedAt: new Date() } },
    { upsert: true }
  );
  console.log("\n✓ System settings: teacher_login=true, school_login=true, teacher_registration=true");

  await mongoose.disconnect();
  console.log("\n>>> ALL DEMO ACCOUNTS AND DISTRICTS RESET & VERIFIED SUCCESSFULLY <<<\n");
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
