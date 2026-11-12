import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LocationModel, type LocationDoc } from "@/lib/db/models/location";
import { JobModel } from "@/lib/db/models/job";
import { canonicalizeDistrict } from "@/data/india-locations";

export type LocationDto = {
  id: string;
  country: string;
  state: string;
  district: string;
  slug: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  headquarterCity?: string;
  majorTowns?: string[];
  searchAliases?: string[];
  description?: string;
  bannerImage?: string;
  landingPageVisible?: boolean;
  activeJobsCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Career Avsar Approved Initial Service Districts (6 Districts of Uttar Pradesh)
 */
export const INITIAL_SERVICE_DISTRICTS = [
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

function toDto(doc: LocationDoc, activeJobsCount?: number): LocationDto {
  return {
    id: String(doc._id),
    country: doc.country,
    state: doc.state,
    district: doc.district,
    slug: doc.slug,
    isActive: !!doc.isActive,
    isFeatured: !!doc.isFeatured,
    displayOrder: doc.displayOrder ?? 0,
    seoTitle: doc.seoTitle ?? undefined,
    seoDescription: doc.seoDescription ?? undefined,
    headquarterCity: doc.headquarterCity ?? undefined,
    majorTowns: doc.majorTowns ?? [],
    searchAliases: doc.searchAliases ?? [],
    description: doc.description ?? undefined,
    bannerImage: doc.bannerImage ?? undefined,
    landingPageVisible: doc.landingPageVisible !== false,
    activeJobsCount: activeJobsCount ?? 0,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

/**
 * Ensures initial active locations are seeded into the database idempotently.
 * Deactivates legacy districts (Lucknow, Barabanki) without deleting existing records.
 */
export async function seedInitialLocations(): Promise<void> {
  await connectToDatabase();

  // 1. Deactivate legacy districts so they do not appear in active lists, but preserve records
  await LocationModel.updateMany(
    { slug: { $in: ["lucknow", "barabanki"] } },
    { $set: { isActive: false, isFeatured: false } },
  );

  // 2. Upsert the approved 6 districts
  for (const item of INITIAL_SERVICE_DISTRICTS) {
    await LocationModel.updateOne(
      { slug: item.slug },
      {
        $set: {
          country: item.country,
          state: item.state,
          district: item.district,
          isActive: item.isActive,
          isFeatured: item.isFeatured,
          displayOrder: item.displayOrder,
          seoTitle: item.seoTitle,
          seoDescription: item.seoDescription,
          headquarterCity: item.headquarterCity,
          majorTowns: item.majorTowns,
          searchAliases: item.searchAliases,
          description: item.description,
          bannerImage: item.bannerImage,
          landingPageVisible: item.landingPageVisible,
        },
      },
      { upsert: true },
    );
  }
}

/**
 * Retrieves a single active location by slug with real job counts for SEO landing pages.
 * Handles alias slugs:
 * - "allahabad" -> resolves to "prayagraj"
 * - "rae-bareli" or "rai-bareli" -> resolves to "raebareli"
 */
export async function getLocationBySlug(slug: string): Promise<LocationDto | null> {
  let cleanSlug = (slug || "").toLowerCase().trim();

  // Alias slug resolution
  if (cleanSlug === "allahabad" || cleanSlug === "prayag") {
    cleanSlug = "prayagraj";
  } else if (cleanSlug === "rae-bareli" || cleanSlug === "rai-bareli") {
    cleanSlug = "raebareli";
  }

  try {
    await connectToDatabase();

    let doc = await LocationModel.findOne({
      $or: [{ slug: cleanSlug }, { searchAliases: new RegExp(`^${cleanSlug}$`, "i") }],
    }).lean<LocationDoc | null>();

    if (!doc) {
      await seedInitialLocations().catch(() => {});
      doc = await LocationModel.findOne({
        $or: [{ slug: cleanSlug }, { searchAliases: new RegExp(`^${cleanSlug}$`, "i") }],
      }).lean<LocationDoc | null>();
    }

    if (!doc) {
      const staticMatch = INITIAL_SERVICE_DISTRICTS.find(
        (d) => d.slug === cleanSlug || d.searchAliases?.some((a) => a.toLowerCase() === cleanSlug)
      );
      if (staticMatch) {
        return {
          id: staticMatch.slug,
          ...staticMatch,
          activeJobsCount: 0,
        };
      }
      return null;
    }

    // Build query matching canonical district or aliases
    const districtMatchPatterns = [doc.district];
    if (doc.district.toLowerCase() === "prayagraj") {
      districtMatchPatterns.push("Allahabad");
    } else if (doc.district.toLowerCase() === "raebareli") {
      districtMatchPatterns.push("Rae Bareli", "Rai Bareli");
    }

    let count = 0;
    try {
      count = await JobModel.countDocuments({
        status: "published",
        isPublic: true,
        "location.district": {
          $in: districtMatchPatterns.map((d) => new RegExp(`^${escapeRegex(d)}$`, "i")),
        },
      });
    } catch {
      count = 0;
    }

    return toDto(doc, count);
  } catch (err) {
    console.error("[LOCATIONS ERROR] getLocationBySlug failed:", err);
    const staticMatch = INITIAL_SERVICE_DISTRICTS.find(
      (d) => d.slug === cleanSlug || d.searchAliases?.some((a) => a.toLowerCase() === cleanSlug)
    );
    if (staticMatch) {
      return {
        id: staticMatch.slug,
        ...staticMatch,
        activeJobsCount: 0,
      };
    }
    return null;
  }
}

/**
 * Returns active service locations for public discovery, search panels and registration forms.
 */
export async function getActiveLocations(): Promise<LocationDto[]> {
  try {
    await connectToDatabase();
    let docs = await LocationModel.find({ isActive: true }).sort({ displayOrder: 1, district: 1 }).lean<LocationDoc[]>();

    // If collection is empty or missing initial 6 districts, trigger seed and refetch
    if (!docs.length || docs.length < 6) {
      await seedInitialLocations().catch(() => {});
      docs = await LocationModel.find({ isActive: true }).sort({ displayOrder: 1, district: 1 }).lean<LocationDoc[]>();
    }

    if (!docs.length) {
      return INITIAL_SERVICE_DISTRICTS.map((d) => ({
        id: d.slug,
        ...d,
        activeJobsCount: 0,
      }));
    }

    // Count active published jobs per district
    try {
      const districtCounts = await JobModel.aggregate([
        { $match: { status: "published", isPublic: true } },
        { $group: { _id: { $toLower: "$location.district" }, count: { $sum: 1 } } },
      ]);

      const countMap = new Map<string, number>();
      for (const item of districtCounts) {
        if (item._id) countMap.set(String(item._id).toLowerCase(), Number(item.count));
      }

      return docs.map((doc) => {
        let jobCount = countMap.get(doc.district.toLowerCase()) ?? 0;
        if (doc.district.toLowerCase() === "prayagraj") {
          jobCount += countMap.get("allahabad") ?? 0;
        }
        return toDto(doc, jobCount);
      });
    } catch {
      return docs.map((doc) => toDto(doc, 0));
    }
  } catch (err) {
    console.error("[LOCATIONS ERROR] getActiveLocations failed:", err);
    return INITIAL_SERVICE_DISTRICTS.map((d) => ({
      id: d.slug,
      ...d,
      activeJobsCount: 0,
    }));
  }
}

/**
 * Returns all locations (active & inactive) for Admin Management.
 */
export async function getAllLocationsAdmin(): Promise<LocationDto[]> {
  await connectToDatabase();
  let docs = await LocationModel.find().sort({ displayOrder: 1, district: 1 }).lean<LocationDoc[]>();

  if (!docs.length) {
    await seedInitialLocations();
    docs = await LocationModel.find().sort({ displayOrder: 1, district: 1 }).lean<LocationDoc[]>();
  }

  const districtCounts = await JobModel.aggregate([
    { $group: { _id: { $toLower: "$location.district" }, count: { $sum: 1 } } },
  ]);
  const countMap = new Map<string, number>();
  for (const item of districtCounts) {
    if (item._id) countMap.set(String(item._id).toLowerCase(), Number(item.count));
  }

  return docs.map((doc) => {
    const totalJobs = countMap.get(doc.district.toLowerCase()) ?? 0;
    return toDto(doc, totalJobs);
  });
}

/**
 * Validates whether a district is currently an active service location.
 * Accurately handles search aliases (e.g. Allahabad -> Prayagraj).
 */
export async function isDistrictActive(districtName: string, stateName = "Uttar Pradesh"): Promise<boolean> {
  if (!districtName) return false;
  const canonical = canonicalizeDistrict(districtName);
  await connectToDatabase();
  const found = await LocationModel.findOne({
    $or: [
      { district: new RegExp(`^${escapeRegex(canonical)}$`, "i") },
      { searchAliases: new RegExp(`^${escapeRegex(districtName.trim())}$`, "i") },
    ],
    state: new RegExp(`^${escapeRegex(stateName.trim())}$`, "i"),
    isActive: true,
  }).lean();
  return !!found;
}

/**
 * Admin creates a new district / service area.
 */
export async function createLocationAdmin(data: {
  country?: string;
  state?: string;
  district: string;
  slug?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  seoTitle?: string;
  seoDescription?: string;
  headquarterCity?: string;
  majorTowns?: string[];
  searchAliases?: string[];
  description?: string;
  bannerImage?: string;
  landingPageVisible?: boolean;
}): Promise<LocationDto> {
  await connectToDatabase();
  const district = canonicalizeDistrict(data.district.trim());
  const state = (data.state || "Uttar Pradesh").trim();
  const country = (data.country || "India").trim();
  const slug = (data.slug || district.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")).trim();

  const existing = await LocationModel.findOne({ $or: [{ slug }, { state, district }] }).lean();
  if (existing) {
    throw new Error(`Location with district '${district}' or slug '${slug}' already exists.`);
  }

  const created = await LocationModel.create({
    country,
    state,
    district,
    slug,
    isActive: data.isActive ?? true,
    isFeatured: data.isFeatured ?? true,
    displayOrder: data.displayOrder ?? 0,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    headquarterCity: data.headquarterCity,
    majorTowns: data.majorTowns || [],
    searchAliases: data.searchAliases || [],
    description: data.description,
    bannerImage: data.bannerImage,
    landingPageVisible: data.landingPageVisible ?? true,
  });

  return toDto(created.toObject() as unknown as LocationDoc, 0);
}

/**
 * Admin updates an existing district.
 */
export async function updateLocationAdmin(
  id: string,
  data: Partial<{
    district: string;
    slug: string;
    isActive: boolean;
    isFeatured: boolean;
    displayOrder: number;
    seoTitle: string;
    seoDescription: string;
    headquarterCity: string;
    majorTowns: string[];
    searchAliases: string[];
    description: string;
    bannerImage: string;
    landingPageVisible: boolean;
  }>,
): Promise<LocationDto | null> {
  await connectToDatabase();
  const updated = await LocationModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true },
  ).lean<LocationDoc | null>();

  if (!updated) return null;
  return toDto(updated);
}

/**
 * Admin toggles district active status.
 */
export async function toggleLocationActiveAdmin(id: string, isActive: boolean): Promise<LocationDto | null> {
  await connectToDatabase();
  const updated = await LocationModel.findByIdAndUpdate(
    id,
    { $set: { isActive } },
    { new: true },
  ).lean<LocationDoc | null>();

  if (!updated) return null;
  return toDto(updated);
}

function escapeRegex(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
