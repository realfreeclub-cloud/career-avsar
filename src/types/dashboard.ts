export type DashboardStats = {
  profileCompletion: number;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  totalApplications: number;
  pendingApplications: number;
  shortlistedApplications: number;
  interviewsScheduled: number;
};

export type DashboardJob = {
  id: string;
  title: string;
  schoolName: string;
  location: { city: string; state: string };
  subject?: string;
  category?: string;
  salaryMinInr?: number;
  salaryMaxInr?: number;
  applicationDeadline?: string;
};

export type DashboardApplication = {
  id: string;
  jobId: string;
  jobTitle: string;
  schoolName: string;
  status:
    | "submitted"
    | "under_review"
    | "shortlisted"
    | "on_hold"
    | "interview_scheduled"
    | "interview_completed"
    | "selected"
    | "rejected"
    | "withdrawn"
    | "applied"
    | "pending"
    | "interview"
    | "offered";
  appliedAt: string;
  updatedAt: string;
  coverNote?: string;
  salary?: string;
  location?: string;
  withdrawalReason?: string;
  statusHistory?: Array<{
    status: string;
    changedByRole?: string;
    note?: string;
    createdAt: string;
  }>;
  candidateMessages?: Array<{
    senderName: string;
    message: string;
    createdAt: string;
  }>;
  interviewScheduledAt?: string;
  interviewMode?: string;
};

export type DashboardInterview = {
  id: string;
  applicationId?: string;
  jobTitle: string;
  schoolName: string;
  scheduledAt: string;
  mode: "online" | "in_person" | "phone" | "hybrid" | "other";
  status: "scheduled" | "confirmed" | "rescheduled" | "completed" | "cancelled" | "no_show";
  locationOrLink?: string;
  instructions?: string;
  result?: "pending" | "selected" | "rejected" | "on_hold" | "reschedule_needed";
  candidateConfirmedAt?: string;
  candidateAttendanceNote?: string;
  cancellationReason?: string;
  notes?: string;
};

export type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  type: "application" | "interview" | "profile" | "system" | "message" | "announcement";
  read: boolean;
  createdAt: string;
  href?: string;
  priority?: "normal" | "high" | "urgent";
  channel?: "in_app" | "email" | "sms" | "whatsapp";
};

export type DashboardMessage = {
  id: string;
  fromName: string;
  fromRole?: string;
  subject?: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type TeacherDashboardData = {
  user: { id: string; name: string; email: string };
  stats: DashboardStats;
  latestJobs: DashboardJob[];
  recentNotifications: DashboardNotification[];
};
