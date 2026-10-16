export type AppCategory = 
  | "all"
  | "lms"
  | "classroom"
  | "assessment"
  | "certification"
  | "repository"
  | "tools";

export interface OneGateApp {
  id: string;
  name: string;
  shortDesc: string;
  category: "lms" | "classroom" | "assessment" | "certification" | "repository" | "tools";
  categoryLabel: string;
  url: string;
  iconName: string;
  badge?: string;
  ssoSupported: boolean;
  isFavorite?: boolean;
  status: "online" | "maintenance" | "restricted";
  tags: string[];
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: string;
  progress: number; // 0 - 100
  dueDate: string;
  isMandatory: boolean;
  totalModules: number;
  completedModules: number;
  estimatedHours: string;
  thumbnailUrl?: string;
  status: "in-progress" | "not-started" | "completed";
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "Webinar" | "Workshop Offline" | "Certification Exam" | "Sharing Session";
  trainer: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  meetingUrl?: string;
  registeredCount: number;
  maxCapacity: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: "SOP" | "Manual Guide" | "Modul Pelatihan" | "Kebijakan Perusahaan";
  format: "PDF" | "PPTX" | "DOCX" | "XLSX";
  size: string;
  updatedAt: string;
  downloadUrl: string;
}

export interface UserNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "warning" | "info" | "success";
}

export interface UserProfile {
  name: string;
  nik: string;
  role: string;
  department: string;
  company: string;
  avatarUrl: string;
  learningHoursThisYear: number;
  completedCourses: number;
  certificatesEarned: number;
  complianceRate: number; // percentage
}
