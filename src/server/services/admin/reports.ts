import "server-only";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ApplicationModel } from "@/lib/db/models/teacher/application";
import { TeacherProfileModel } from "@/lib/db/models/teacher-profile";
import { JobModel } from "@/lib/db/models/job";
import { InterviewModel } from "@/lib/db/models/teacher/interview";
import { PlacementModel } from "@/lib/db/models/admin/placement";
import { UserModel } from "@/lib/db/models/user";
import { SchoolModel } from "@/lib/db/models/admin/school";

export type DateFilterParams = {
  from?: string;
  to?: string;
};

function buildDateMatch(field: string, params?: DateFilterParams): Record<string, unknown> {
  const match: Record<string, unknown> = {};
  if (!params?.from && !params?.to) return match;

  const dateCond: Record<string, Date> = {};
  if (params?.from) {
    const f = new Date(params.from);
    if (!isNaN(f.getTime())) dateCond.$gte = f;
  }
  if (params?.to) {
    const t = new Date(params.to);
    if (!isNaN(t.getTime())) {
      t.setHours(23, 59, 59, 999);
      dateCond.$lte = t;
    }
  }

  if (Object.keys(dateCond).length > 0) {
    match[field] = dateCond;
  }
  return match;
}

export async function getAdminReports(filterParams?: DateFilterParams) {
  await connectToDatabase();
  const dateMatch = buildDateMatch("createdAt", filterParams);

  try {
    // 1. Overall counts
    const [totalTeachers, totalSchools, totalJobs, totalApps, totalInterviews, totalPlacements] =
      await Promise.all([
        UserModel.countDocuments({ role: "candidate", ...dateMatch }).catch(() => 0),
        SchoolModel.countDocuments({ ...dateMatch }).catch(() => 0),
        JobModel.countDocuments({ ...dateMatch }).catch(() => 0),
        ApplicationModel.countDocuments({ ...dateMatch }).catch(() => 0),
        InterviewModel.countDocuments({ ...dateMatch }).catch(() => 0),
        PlacementModel.countDocuments({ ...dateMatch }).catch(() => 0),
      ]);

    // 2. Registrations Timeline (daily/monthly trend)
    const timelineAgg = await UserModel.aggregate([
      { $match: { role: "candidate", ...dateMatch } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]).catch(() => []);

    const registrationsTimeline = timelineAgg.map((r: { _id: string; count: number }) => ({
      date: r._id || "Unknown",
      count: Number(r.count || 0),
    }));

    // 3. State-wise registrations & verification
    const stateAgg = await TeacherProfileModel.aggregate([
      { $match: { "location.state": { $exists: true, $ne: "" }, ...dateMatch } },
      {
        $group: {
          _id: "$location.state",
          count: { $sum: 1 },
          verifiedCount: {
            $sum: { $cond: [{ $eq: ["$verification.status", "verified"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]).catch(() => []);

    const stateWise = stateAgg.map(
      (r: { _id: string; count: number; verifiedCount: number }) => ({
        state: r._id || "Unspecified",
        count: Number(r.count || 0),
        verifiedCount: Number(r.verifiedCount || 0),
      }),
    );

    // 4. District-wise registrations (top 25)
    const districtAgg = await TeacherProfileModel.aggregate([
      { $match: { "location.district": { $exists: true, $ne: "" }, ...dateMatch } },
      {
        $group: {
          _id: { district: "$location.district", state: "$location.state" },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 25 },
    ]).catch(() => []);

    const districtWise = districtAgg.map((r: { _id: { district?: string; state?: string }; count: number }) => ({
      district: r._id?.district || "Unknown",
      state: r._id?.state || "",
      count: Number(r.count || 0),
    }));

    // 5. Qualification distribution (CTET, B.Ed, D.El.Ed, etc.)
    const qualAgg = await TeacherProfileModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          bedCount: { $sum: { $cond: [{ $eq: ["$education.bed", true] }, 1, 0] } },
          deledCount: { $sum: { $cond: [{ $eq: ["$education.deled", true] }, 1, 0] } },
          ctetPaperI: { $sum: { $cond: [{ $eq: ["$education.ctetPaperI", true] }, 1, 0] } },
          ctetPaperII: { $sum: { $cond: [{ $eq: ["$education.ctetPaperII", true] }, 1, 0] } },
          uptetCount: { $sum: { $cond: [{ $eq: ["$education.uptet", true] }, 1, 0] } },
        },
      },
    ]).catch(() => []);

    const qualData = qualAgg[0] || { total: 0, bedCount: 0, deledCount: 0, ctetPaperI: 0, ctetPaperII: 0, uptetCount: 0 };
    const qualTotal = Math.max(1, qualData.total || totalTeachers);

    const qualificationDistribution = [
      { label: "B.Ed Qualified", count: qualData.bedCount, percentage: Math.round((qualData.bedCount / qualTotal) * 100) },
      { label: "CTET Paper II (Upper Primary)", count: qualData.ctetPaperII, percentage: Math.round((qualData.ctetPaperII / qualTotal) * 100) },
      { label: "CTET Paper I (Primary)", count: qualData.ctetPaperI, percentage: Math.round((qualData.ctetPaperI / qualTotal) * 100) },
      { label: "D.El.Ed / BTC", count: qualData.deledCount, percentage: Math.round((qualData.deledCount / qualTotal) * 100) },
      { label: "UPTET Qualified", count: qualData.uptetCount, percentage: Math.round((qualData.uptetCount / qualTotal) * 100) },
    ];

    // 6. Subject distribution (unwind preferences.subjects)
    const subjectAgg = await TeacherProfileModel.aggregate([
      { $match: dateMatch },
      { $unwind: "$preferences.subjects" },
      { $group: { _id: "$preferences.subjects", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]).catch(() => []);

    const subjectDistribution = subjectAgg.map((r: { _id: string; count: number }) => ({
      subject: r._id || "Other",
      count: Number(r.count || 0),
    }));

    // 7. Experience distribution
    const expAgg = await TeacherProfileModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: null,
          fresher: { $sum: { $cond: [{ $or: [{ $eq: ["$experience.status", "fresher"] }, { $eq: ["$experience.totalYears", 0] }] }, 1, 0] } },
          exp1to3: { $sum: { $cond: [{ $and: [{ $gt: ["$experience.totalYears", 0] }, { $lte: ["$experience.totalYears", 3] }] }, 1, 0] } },
          exp3to5: { $sum: { $cond: [{ $and: [{ $gt: ["$experience.totalYears", 3] }, { $lte: ["$experience.totalYears", 5] }] }, 1, 0] } },
          exp5to10: { $sum: { $cond: [{ $and: [{ $gt: ["$experience.totalYears", 5] }, { $lte: ["$experience.totalYears", 10] }] }, 1, 0] } },
          exp10plus: { $sum: { $cond: [{ $gt: ["$experience.totalYears", 10] }, 1, 0] } },
        },
      },
    ]).catch(() => []);

    const expData = expAgg[0] || { fresher: 0, exp1to3: 0, exp3to5: 0, exp5to10: 0, exp10plus: 0 };
    const expTotal = Math.max(1, totalTeachers);

    const experienceDistribution = [
      { bracket: "Fresher (0 Years)", count: expData.fresher, percentage: Math.round((expData.fresher / expTotal) * 100) },
      { bracket: "Early Career (1 - 3 Years)", count: expData.exp1to3, percentage: Math.round((expData.exp1to3 / expTotal) * 100) },
      { bracket: "Mid-Level (3 - 5 Years)", count: expData.exp3to5, percentage: Math.round((expData.exp3to5 / expTotal) * 100) },
      { bracket: "Senior (5 - 10 Years)", count: expData.exp5to10, percentage: Math.round((expData.exp5to10 / expTotal) * 100) },
      { bracket: "Veteran (10+ Years)", count: expData.exp10plus, percentage: Math.round((expData.exp10plus / expTotal) * 100) },
    ];

    // 8. Vacancy performance & Applications by vacancy
    const jobsList = await JobModel.find(dateMatch)
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Applications count aggregated by vacancy
    const appsByJobAgg = await ApplicationModel.aggregate([
      { $match: dateMatch },
      {
        $group: {
          _id: "$jobId",
          total: { $sum: 1 },
          shortlisted: { $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] } },
          selected: { $sum: { $cond: [{ $eq: ["$status", "selected"] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 30 },
    ]).catch(() => []);

    const appsByJobMap = new Map(
      appsByJobAgg.map(
        (r: { _id: unknown; total: number; shortlisted: number; selected: number; rejected: number }) => [
          String(r._id),
          r,
        ],
      ),
    );

    const vacancyPerformance = jobsList.map((j) => {
      const stats = appsByJobMap.get(String(j._id));
      return {
        id: String(j._id),
        title: j.title || "Teaching Vacancy",
        schoolName: j.schoolName || "Partner Institution",
        category: j.category || "General",
        status: j.status || "draft",
        viewsCount: (j as { viewsCount?: number }).viewsCount || 0,
        applicantsCount: stats ? stats.total : 0,
        deadline: j.applicationDeadline ? new Date(j.applicationDeadline).toISOString() : undefined,
      };
    });

    const applicationsByVacancy = jobsList
      .filter((j) => appsByJobMap.has(String(j._id)))
      .map((j) => {
        const stats = appsByJobMap.get(String(j._id))!;
        return {
          vacancyTitle: j.title,
          schoolName: j.schoolName,
          total: stats.total,
          shortlisted: stats.shortlisted,
          selected: stats.selected,
          rejected: stats.rejected,
        };
      });

    // 9. Application statuses breakdown
    const appStatusAgg = await ApplicationModel.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).catch(() => []);

    const applicationStatuses = appStatusAgg.map((r: { _id: string; count: number }) => ({
      status: r._id || "submitted",
      count: Number(r.count || 0),
    }));

    // 10. Interviews breakdown (status, mode, results)
    const [ivStatusAgg, ivModeAgg, ivResultAgg] = await Promise.all([
      InterviewModel.aggregate([{ $match: dateMatch }, { $group: { _id: "$status", count: { $sum: 1 } } }]).catch(() => []),
      InterviewModel.aggregate([{ $match: dateMatch }, { $group: { _id: "$mode", count: { $sum: 1 } } }]).catch(() => []),
      InterviewModel.aggregate([{ $match: dateMatch }, { $group: { _id: "$result", count: { $sum: 1 } } }]).catch(() => []),
    ]);

    const interviewsBreakdown = {
      byStatus: ivStatusAgg.map((r: { _id: string; count: number }) => ({ status: r._id || "scheduled", count: Number(r.count || 0) })),
      byMode: ivModeAgg.map((r: { _id: string; count: number }) => ({ mode: r._id || "offline", count: Number(r.count || 0) })),
      byResult: ivResultAgg.filter((r: { _id: unknown }) => Boolean(r._id)).map((r: { _id: string; count: number }) => ({ result: r._id, count: Number(r.count || 0) })),
    };

    // 11. Selections list
    const selectionsList = await InterviewModel.find({ result: "selected", ...dateMatch })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    const selections = selectionsList.map((s) => ({
      candidateName: s.candidateName || "Candidate Educator",
      jobTitle: s.jobTitle || "Faculty Position",
      schoolName: s.schoolName || "Institution",
      selectedAt: s.updatedAt ? new Date(s.updatedAt).toISOString() : new Date().toISOString(),
    }));

    // 12. Placements breakdown
    const placementsAgg = await PlacementModel.aggregate([
      { $match: dateMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).catch(() => []);

    const placements = placementsAgg.map((r: { _id: string; count: number }) => ({
      status: r._id || "offered",
      count: Number(r.count || 0),
    }));

    return {
      totals: {
        teachers: totalTeachers,
        schools: totalSchools,
        jobs: totalJobs,
        applications: totalApps,
        interviews: totalInterviews,
        placements: totalPlacements,
      },
      registrationsTimeline,
      stateWise,
      districtWise,
      qualificationDistribution,
      subjectDistribution,
      experienceDistribution,
      vacancyPerformance,
      applicationsByVacancy,
      applicationStatuses,
      interviewsBreakdown,
      selections,
      placements,
    };
  } catch (err) {
    console.error("getAdminReports error:", err);
    return {
      totals: { teachers: 0, schools: 0, jobs: 0, applications: 0, interviews: 0, placements: 0 },
      registrationsTimeline: [],
      stateWise: [],
      districtWise: [],
      qualificationDistribution: [],
      subjectDistribution: [],
      experienceDistribution: [],
      vacancyPerformance: [],
      applicationsByVacancy: [],
      applicationStatuses: [],
      interviewsBreakdown: { byStatus: [], byMode: [], byResult: [] },
      selections: [],
      placements: [],
    };
  }
}

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export async function generateReportCsv(
  reportType: string,
  filterParams?: DateFilterParams,
): Promise<{ filename: string; csv: string }> {
  const data = await getAdminReports(filterParams);
  const dateSuffix = new Date().toISOString().split("T")[0];
  let filename = `report_${reportType}_${dateSuffix}.csv`;
  let headers: string[] = [];
  let rows: string[][] = [];

  switch (reportType) {
    case "registrations":
      filename = `teacher_registrations_trend_${dateSuffix}.csv`;
      headers = ["Date", "New Registrations"];
      rows = data.registrationsTimeline.map((r) => [r.date, String(r.count)]);
      break;

    case "state_wise":
      filename = `state_wise_distribution_${dateSuffix}.csv`;
      headers = ["State", "Total Candidates", "Verified Candidates"];
      rows = data.stateWise.map((r) => [r.state, String(r.count), String(r.verifiedCount)]);
      break;

    case "district_wise":
      filename = `district_wise_distribution_${dateSuffix}.csv`;
      headers = ["District", "State", "Candidates Count"];
      rows = data.districtWise.map((r) => [r.district, r.state, String(r.count)]);
      break;

    case "qualifications":
      filename = `qualification_distribution_${dateSuffix}.csv`;
      headers = ["Qualification / Credential", "Candidates Count", "Percentage (%)"];
      rows = data.qualificationDistribution.map((r) => [r.label, String(r.count), `${r.percentage}%`]);
      break;

    case "subjects":
      filename = `subject_distribution_${dateSuffix}.csv`;
      headers = ["Subject", "Candidate Preference Count"];
      rows = data.subjectDistribution.map((r) => [r.subject, String(r.count)]);
      break;

    case "experience":
      filename = `experience_distribution_${dateSuffix}.csv`;
      headers = ["Experience Bracket", "Candidates Count", "Percentage (%)"];
      rows = data.experienceDistribution.map((r) => [r.bracket, String(r.count), `${r.percentage}%`]);
      break;

    case "vacancies":
      filename = `vacancy_performance_${dateSuffix}.csv`;
      headers = ["Vacancy ID", "Job Title", "School Name", "Category", "Applicants", "Views", "Status", "Deadline"];
      rows = data.vacancyPerformance.map((v) => [
        v.id,
        v.title,
        v.schoolName,
        v.category,
        String(v.applicantsCount),
        String(v.viewsCount),
        v.status,
        v.deadline || "Open",
      ]);
      break;

    case "applications":
      filename = `applications_by_vacancy_${dateSuffix}.csv`;
      headers = ["Job Vacancy", "School Name", "Total Applications", "Shortlisted", "Selected", "Rejected"];
      rows = data.applicationsByVacancy.map((a) => [
        a.vacancyTitle,
        a.schoolName,
        String(a.total),
        String(a.shortlisted),
        String(a.selected),
        String(a.rejected),
      ]);
      break;

    case "interviews":
      filename = `interviews_report_${dateSuffix}.csv`;
      headers = ["Status / Mode", "Count"];
      rows = [
        ...data.interviewsBreakdown.byStatus.map((s) => [`Status: ${s.status}`, String(s.count)]),
        ...data.interviewsBreakdown.byMode.map((m) => [`Mode: ${m.mode}`, String(m.count)]),
      ];
      break;

    case "selections":
      filename = `selections_report_${dateSuffix}.csv`;
      headers = ["Candidate Name", "Position", "School / Institution", "Selected At"];
      rows = data.selections.map((s) => [s.candidateName, s.jobTitle, s.schoolName, s.selectedAt]);
      break;

    case "placements":
      filename = `placements_pipeline_${dateSuffix}.csv`;
      headers = ["Placement Status", "Count"];
      rows = data.placements.map((p) => [p.status, String(p.count)]);
      break;

    default:
      filename = `platform_summary_${dateSuffix}.csv`;
      headers = ["Metric", "Total Count"];
      rows = [
        ["Total Registered Teachers", String(data.totals.teachers)],
        ["Total Partner Schools", String(data.totals.schools)],
        ["Total Published Vacancies", String(data.totals.jobs)],
        ["Total Job Applications", String(data.totals.applications)],
        ["Total Scheduled Interviews", String(data.totals.interviews)],
        ["Total Final Placements", String(data.totals.placements)],
      ];
      break;
  }

  // Prepend UTF-8 BOM so Excel opens Indian fonts and CSVs without garbling
  const bom = "\uFEFF";
  const csvLines = [
    headers.map(escapeCsvCell).join(","),
    ...rows.map((r) => r.map(escapeCsvCell).join(",")),
  ];

  return {
    filename,
    csv: bom + csvLines.join("\r\n"),
  };
}
