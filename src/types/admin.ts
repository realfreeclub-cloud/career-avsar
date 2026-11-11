export type PageMeta = { page: number; limit: number; total: number; totalPages: number };
export type Paged<T> = { items: T[]; page: PageMeta };

export type TeacherListItem = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobile: string;
  state: string;
  district: string;
  highestQualification: string;
  experienceYears: number | null;
  subjects: string[];
  ctet: boolean;
  uptet: boolean;
  expectedSalaryInr: number | null;
  verificationStatus: string;
  createdAt: string;
};

export type SchoolContact = {
  id?: string;
  name: string;
  role?: string;
  designation?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  isPrimary?: boolean;
  schoolId?: string;
  schoolName?: string;
};

export type SchoolNote = {
  id?: string;
  authorUserId?: string;
  authorName?: string;
  body: string;
  createdAt?: string;
};

export type SchoolListItem = {
  id: string;
  name: string;
  type?: string;
  board?: string;
  status: "active" | "inactive";
  verificationStatus?: "verified" | "pending_verification" | "unverified";
  verifiedAt?: string;
  state?: string;
  district?: string;
  city?: string;
  contactsCount: number;
  followUpDate?: string;
  followUpStatus?: "pending" | "completed" | "none";
  isArchived?: boolean;
  activeVacanciesCount?: number;
  updatedAt?: string;
};

export type SchoolDetail = SchoolListItem & {
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  pincode?: string;
  hiringRequirements?: string;
  contacts: SchoolContact[];
  internalNotes: SchoolNote[];
};

export type AdminDashboardStats = {
  totalTeachers: number;
  verifiedTeachers: number;
  unverifiedTeachers: number;
  pendingDocumentVerification: number;
  totalSchools: number;
  verifiedSchools: number;
  pendingFollowUps: number;
  activeVacancies: number;
  totalApplications: number;
  pendingApplications: number;
  shortlistedCandidates: number;
  scheduledInterviews: number;
  successfulPlacements: number;
  recentRegistrations: TeacherListItem[];
  recentActivities: { id: string; action: string; summary: string; entityType: string; createdAt: string }[];
};
