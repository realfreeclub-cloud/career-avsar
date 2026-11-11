export const TEACHER_CATEGORIES = ["PGT", "TGT", "PRT", "Nursery", "Other"] as const;
export const TEACHING_SUBJECTS = [
  "Mathematics","Science","English","Hindi","Social Science","Computer Science","Physics","Chemistry","Biology",
  "Commerce","Economics","Accountancy","History","Geography","Political Science","Sanskrit","Physical Education",
  "Art","Music","Environmental Studies","General Studies","Other",
];
export const PREFERRED_CLASSES = ["Pre-Primary","Primary (1-5)","Middle (6-8)","Secondary (9-10)","Senior Secondary (11-12)","Other"];
export const BOARDS = ["CBSE","ICSE/ISC","State Board","IB","IGCSE/Cambridge","NIOS","Other"];
export const EMPLOYMENT_TYPES = ["Full-time","Part-time","Contract","Visiting","Temporary"];
export const GENDERS = ["Male","Female","Other","Prefer not to say"];
export const QUALIFICATION_LEVELS = ["High School","Intermediate","Diploma","Graduate","Post Graduate","Doctorate","Other"];
export const TET_OPTIONS = ["CTET Paper I","CTET Paper II","UPTET","State TET","Other TET"];

export type DocumentKind = "resume" | "educational" | "experience" | "training" | "tet" | "photo";
export const DOCUMENT_RULES: Record<DocumentKind, { label: string; accept: string[]; mimes: string[]; maxBytes: number }> = {
  resume: { label: "Resume", accept: [".pdf",".doc",".docx"], mimes: ["application/pdf","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"], maxBytes: 5 * 1024 * 1024 },
  educational: { label: "Educational Certificate", accept: [".pdf",".jpg",".jpeg",".png"], mimes: ["application/pdf","image/jpeg","image/png"], maxBytes: 5 * 1024 * 1024 },
  experience: { label: "Experience Certificate", accept: [".pdf",".jpg",".jpeg",".png"], mimes: ["application/pdf","image/jpeg","image/png"], maxBytes: 5 * 1024 * 1024 },
  training: { label: "Training Certificate", accept: [".pdf",".jpg",".jpeg",".png"], mimes: ["application/pdf","image/jpeg","image/png"], maxBytes: 5 * 1024 * 1024 },
  tet: { label: "CTET/TET Certificate", accept: [".pdf",".jpg",".jpeg",".png"], mimes: ["application/pdf","image/jpeg","image/png"], maxBytes: 5 * 1024 * 1024 },
  photo: { label: "Profile Photo", accept: [".jpg",".jpeg",".png"], mimes: ["image/jpeg","image/png"], maxBytes: 2 * 1024 * 1024 },
};
