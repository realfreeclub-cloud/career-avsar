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

async function run() {
  console.log("==================================================");
  console.log("CAREER AVSAR: SEEDING / RESETTING DEMO ACCOUNTS");
  console.log("Target Database:", MONGODB_URI.replace(/:([^@]+)@/, ":****@"));
  console.log("==================================================\n");

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

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

    console.log(`✓ Account [${acc.role.toUpperCase()}]: ${acc.email} | Password: ${acc.pass}`);
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
  console.log("\n>>> ALL DEMO ACCOUNTS RESET AND VERIFIED SUCCESSFULLY <<<\n");
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
