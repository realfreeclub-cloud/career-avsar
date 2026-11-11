export type ProfileDto = {
  personal: { fullName: string; email: string; mobile: string; whatsapp: string; dob: string; gender: string; photoUrl: string };
  location: {
    state: string;
    district: string;
    city: string;
    currentAddress: string;
    preferredJobDistricts?: string[];
    preferredJobLocations: string[];
    serviceAreaStatus?: "in_service_area" | "outside_service_area" | "review_needed";
  };
  education: { highestQualification: string; graduation: string; postGraduation: string; bed: boolean; deled: boolean; btc: boolean; ctet: boolean; ctetPaperI: boolean; ctetPaperII: boolean; uptet: boolean; otherTet: string };
  experience: { status: string; totalYears: number | ""; previousSchool: string; previousDesignation: string; currentEmploymentStatus: string; expectedSalaryInr: number | "" };
  preferences: { categories: string[]; subjects: string[]; preferredClasses: string[]; preferredBoard: string; employmentType: string; preferredLocations: string[] };
  documents: { id: string; kind: string; originalName: string; mimeType: string; size: number; uploadedAt?: string }[];
  registration: { currentStep: number; completed: boolean; draftSavedAt?: string };
  verification: { status: string; note: string };
  completion: { percent: number; missing: string[] };
  updatedAt?: string;
};

export type TeacherDocument = ProfileDto["documents"][number];
