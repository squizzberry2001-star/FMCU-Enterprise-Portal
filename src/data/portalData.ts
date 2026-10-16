import { OneGateApp, TrainingCourse, CalendarEvent, DocumentItem, UserNotification, UserProfile } from "@/types";

export const initialUserProfile: UserProfile = {
  name: "Budi Pratama",
  nik: "FMCU-2024-0891",
  role: "Senior Operations Specialist",
  department: "Fleet & Operations Excellence",
  company: "PT FMCU Global Solusindo",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  learningHoursThisYear: 38.5,
  completedCourses: 12,
  certificatesEarned: 4,
  complianceRate: 85,
};

export const oneGateAppsData: OneGateApp[] = [
  {
    id: "app-moodle-lms",
    name: "FMCU Core LMS",
    shortDesc: "Platform utama e-learning, materi interaktif, dan kuis berkala.",
    category: "lms",
    categoryLabel: "Core LMS",
    url: "https://lms.fmcu-portal.internal",
    iconName: "GraduationCap",
    badge: "Utama",
    ssoSupported: true,
    isFavorite: true,
    status: "online",
    tags: ["e-learning", "modul", "kursus", "moodle"]
  },
  {
    id: "app-ms-teams",
    name: "Virtual Classroom (MS Teams)",
    shortDesc: "Akses langsung ke ruang kelas webinar dan sesi tatap muka online.",
    category: "classroom",
    categoryLabel: "Live Class",
    url: "https://teams.microsoft.com",
    iconName: "Video",
    badge: "Live Session",
    ssoSupported: true,
    isFavorite: true,
    status: "online",
    tags: ["webinar", "kelas online", "teams", "meeting"]
  },
  {
    id: "app-exam-center",
    name: "Online Assessment & Exam",
    shortDesc: "Pusat ujian sertifikasi internal, pre-test, dan post-test berkala.",
    category: "assessment",
    categoryLabel: "Assessment",
    url: "https://exam.fmcu-portal.internal",
    iconName: "FileSpreadsheet",
    ssoSupported: true,
    isFavorite: false,
    status: "online",
    tags: ["ujian", "quiz", "post-test", "evaluasi"]
  },
  {
    id: "app-cert-hub",
    name: "E-Certificate & Credential Hub",
    shortDesc: "Unduh dan verifikasi sertifikat kelulusan pelatihan resmi dengan QR Code.",
    category: "certification",
    categoryLabel: "Sertifikasi",
    url: "https://certificates.fmcu-portal.internal",
    iconName: "Award",
    badge: "Official",
    ssoSupported: true,
    isFavorite: true,
    status: "online",
    tags: ["sertifikat", "credential", "ijazah", "kelulusan"]
  },
  {
    id: "app-elibrary",
    name: "Enterprise Digital Library",
    shortDesc: "Ribuan e-book bisnis, engineering, leadership, dan jurnal industri.",
    category: "repository",
    categoryLabel: "Repository",
    url: "https://elibrary.fmcu-portal.internal",
    iconName: "BookOpen",
    ssoSupported: true,
    isFavorite: false,
    status: "online",
    tags: ["buku", "jurnal", "referensi", "e-book"]
  },
  {
    id: "app-skill-matrix",
    name: "Competency & Skill Matrix",
    shortDesc: "Peta kompetensi jabatan karyawan dan rekomendasi gap pelatihan.",
    category: "tools",
    categoryLabel: "Tools & Analytics",
    url: "https://skills.fmcu-portal.internal",
    iconName: "Target",
    badge: "HR Sync",
    ssoSupported: true,
    isFavorite: false,
    status: "online",
    tags: ["kompetensi", "karir", "skill gap", "evaluasi kerja"]
  },
  {
    id: "app-simulasi-vr",
    name: "VR & Interactive Simulation Lab",
    shortDesc: "Modul simulasi 3D interaktif untuk SOP keselamatan dan operasional armada.",
    category: "tools",
    categoryLabel: "Tools & Analytics",
    url: "https://simulation.fmcu-portal.internal",
    iconName: "Cpu",
    badge: "New",
    ssoSupported: false,
    isFavorite: false,
    status: "online",
    tags: ["simulasi", "vr", "praktik", "3d"]
  },
  {
    id: "app-sop-portal",
    name: "Standard Operating Procedures (SOP)",
    shortDesc: "Pusat panduan baku operasional, keselamatan kerja, dan compliance.",
    category: "repository",
    categoryLabel: "Repository",
    url: "https://sop.fmcu-portal.internal",
    iconName: "FolderGit2",
    ssoSupported: true,
    isFavorite: true,
    status: "online",
    tags: ["sop", "aturan", "kebijakan", "panduan"]
  }
];

export const trainingCoursesData: TrainingCourse[] = [
  {
    id: "crs-101",
    title: "Health, Safety & Environment (HSE) Compliance 2026",
    category: "Mandatory Compliance",
    progress: 75,
    dueDate: "28 Okt 2026",
    isMandatory: true,
    totalModules: 8,
    completedModules: 6,
    estimatedHours: "4 Jam",
    status: "in-progress"
  },
  {
    id: "crs-102",
    title: "Enterprise Data Security & Anti-Phishing Awareness",
    category: "IT Security",
    progress: 100,
    dueDate: "15 Sep 2026",
    isMandatory: true,
    totalModules: 5,
    completedModules: 5,
    estimatedHours: "2.5 Jam",
    status: "completed"
  },
  {
    id: "crs-103",
    title: "Operational Excellence & Fleet Telematics Management",
    category: "Technical Skill",
    progress: 30,
    dueDate: "10 Nov 2026",
    isMandatory: false,
    totalModules: 10,
    completedModules: 3,
    estimatedHours: "6 Jam",
    status: "in-progress"
  },
  {
    id: "crs-104",
    title: "Transformational Leadership & Team Coaching",
    category: "Leadership",
    progress: 0,
    dueDate: "30 Nov 2026",
    isMandatory: false,
    totalModules: 6,
    completedModules: 0,
    estimatedHours: "5 Jam",
    status: "not-started"
  }
];

export const upcomingEventsData: CalendarEvent[] = [
  {
    id: "evt-201",
    title: "Executive Townhall: Digital Transformation Roadmap FMCU",
    type: "Webinar",
    trainer: "Direksi & BOD FMCU",
    date: "18 Okt 2026",
    time: "09:00 - 11:30 WIB",
    location: "MS Teams Live Room 1",
    isOnline: true,
    meetingUrl: "https://teams.microsoft.com/l/meetup-join/fmcu-townhall",
    registeredCount: 342,
    maxCapacity: 500
  },
  {
    id: "evt-202",
    title: "Hands-on Workshop: Emergency Response & Fleet Safety",
    type: "Workshop Offline",
    trainer: "Kapten Hendra Gunawan (Senior Safety Expert)",
    date: "24 Okt 2026",
    time: "08:30 - 15:00 WIB",
    location: "Auditorium Lantai 3, Gedung Training Center FMCU",
    isOnline: false,
    registeredCount: 45,
    maxCapacity: 50
  },
  {
    id: "evt-203",
    title: "Sertifikasi Kompetensi Internal: Logistics Coordinator",
    type: "Certification Exam",
    trainer: "Lembaga Sertifikasi Profesi (LSP) FMCU",
    date: "05 Nov 2026",
    time: "10:00 - 12:00 WIB",
    location: "Online Exam Center (Proctored)",
    isOnline: true,
    meetingUrl: "https://exam.fmcu-portal.internal",
    registeredCount: 18,
    maxCapacity: 30
  }
];

export const documentItemsData: DocumentItem[] = [
  {
    id: "doc-301",
    title: "SOP Keselamatan Kerja & Prosedur Tanggap Darurat 2026 (Rev. 4)",
    category: "SOP",
    format: "PDF",
    size: "4.8 MB",
    updatedAt: "10 Okt 2026",
    downloadUrl: "#"
  },
  {
    id: "doc-302",
    title: "Panduan Penggunaan Sistem One-Gate Training FMCU (User Manual)",
    category: "Manual Guide",
    format: "PDF",
    size: "2.1 MB",
    updatedAt: "01 Okt 2026",
    downloadUrl: "#"
  },
  {
    id: "doc-303",
    title: "Slide Presentasi Modul Kepemimpinan & Manajemen Konflik",
    category: "Modul Pelatihan",
    format: "PPTX",
    size: "18.5 MB",
    updatedAt: "12 Sep 2026",
    downloadUrl: "#"
  },
  {
    id: "doc-304",
    title: "Kebijakan Pelatihan Karyawan & Skema Penggantian Biaya Kursus",
    category: "Kebijakan Perusahaan",
    format: "PDF",
    size: "1.4 MB",
    updatedAt: "15 Agu 2026",
    downloadUrl: "#"
  }
];

export const userNotificationsData: UserNotification[] = [
  {
    id: "notif-1",
    title: "Batas Waktu Pelatihan HSE tinggal 12 hari",
    description: "Selesaikan 2 modul tersisa sebelum 28 Oktober 2026 untuk memenuhi syarat compliance.",
    timestamp: "10 menit yang lalu",
    read: false,
    type: "warning"
  },
  {
    id: "notif-2",
    title: "Sertifikat Baru Tersedia!",
    description: "Sertifikat kelulusan 'Enterprise Data Security' sudah dapat diunduh di E-Certificate Hub.",
    timestamp: "Kemarin",
    read: false,
    type: "success"
  },
  {
    id: "notif-3",
    title: "Registrasi Webinar Diterima",
    description: "Anda telah terdaftar pada Executive Townhall Digital Transformation 18 Okt 2026.",
    timestamp: "2 hari yang lalu",
    read: true,
    type: "info"
  }
];
