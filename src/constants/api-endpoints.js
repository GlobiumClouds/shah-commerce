// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
    RESEND_VERIFICATION: '/api/auth/resend-verification',
    CHANGE_PASSWORD: '/api/auth/change-password',
    ME: '/api/auth/me',
  },

  // Super Admin Endpoints
  SUPER_ADMIN: {
    DASHBOARD: '/api/super-admin/dashboard',
    DASHBOARD_STATS: '/api/super-admin/dashboard/stats',
    
    // Branch Management
    BRANCHES: {
      CREATE: '/api/super-admin/branches',
      LIST: '/api/super-admin/branches',
      GET: '/api/super-admin/branches/:id',
      UPDATE: '/api/super-admin/branches/:id',
      DELETE: '/api/super-admin/branches/:id',
      STATS: '/api/super-admin/branches/stats',
      ACTIVATE: '/api/super-admin/branches/:id/activate',
      DEACTIVATE: '/api/super-admin/branches/:id/deactivate',
    },
    
    // Branch Admin Management
    BRANCH_ADMINS: {
      CREATE: '/api/super-admin/branch-admins',
      LIST: '/api/super-admin/branch-admins',
      GET: '/api/super-admin/branch-admins/:id',
      UPDATE: '/api/super-admin/branch-admins/:id',
      DELETE: '/api/super-admin/branch-admins/:id',
      ASSIGN_BRANCH: '/api/super-admin/branch-admins/:id/assign-branch',
    },
    
    // Global Settings
    SETTINGS: {
      GET: '/api/super-admin/settings',
      UPDATE: '/api/super-admin/settings',
      RESET: '/api/super-admin/settings/reset',
    },

    // Events Management
    EVENTS: {
      CREATE: '/api/super-admin/events',
      LIST: '/api/super-admin/events',
      GET: '/api/super-admin/events/:id',
      UPDATE: '/api/super-admin/events/:id',
      DELETE: '/api/super-admin/events/:id',
    },

    // Expenses Management
    EXPENSES: {
      CREATE: '/api/super-admin/expenses',
      LIST: '/api/super-admin/expenses',
      GET: '/api/super-admin/expenses/:id',
      UPDATE: '/api/super-admin/expenses/:id',
      DELETE: '/api/super-admin/expenses/:id',
    },

    // Subscriptions Management
    SUBSCRIPTIONS: {
      CREATE: '/api/super-admin/subscriptions',
      LIST: '/api/super-admin/subscriptions',
      GET: '/api/super-admin/subscriptions/:id',
      UPDATE: '/api/super-admin/subscriptions/:id',
      DELETE: '/api/super-admin/subscriptions/:id',
    },

    // Salaries Management
    SALARIES: {
      CREATE: '/api/super-admin/salaries',
      LIST: '/api/super-admin/salaries',
      GET: '/api/super-admin/salaries/:id',
      UPDATE: '/api/super-admin/salaries/:id',
      DELETE: '/api/super-admin/salaries/:id',
      PROCESS: '/api/super-admin/salaries/:id/process',
    },
    
    // Admins Management
    ADMINS: {
      CREATE: '/api/super-admin/admins',
      LIST: '/api/super-admin/admins',
      GET: '/api/super-admin/admins/:id',
      UPDATE: '/api/super-admin/admins/:id',
      DELETE: '/api/super-admin/admins/:id',
      ASSIGN_BRANCH: '/api/super-admin/admins/:id/assign-branch',
    },
    
    // Reports
    REPORTS: {
      OVERALL: '/api/super-admin/reports/overall',
      BRANCHES: '/api/super-admin/reports/branches',
      FINANCIAL: '/api/super-admin/reports/financial',
      ATTENDANCE: '/api/super-admin/reports/attendance',
      PERFORMANCE: '/api/super-admin/reports/performance',
      EXPORT: '/api/super-admin/reports/export',
    },
    
    // Users Management
    USERS: {
      LIST: '/api/super-admin/users',
      GET: '/api/super-admin/users/:id',
      CREATE: '/api/super-admin/users',
      UPDATE: '/api/super-admin/users/:id',
      DELETE: '/api/super-admin/users/:id',
      BULK_CREATE: '/api/super-admin/users/bulk',
      EXPORT: '/api/super-admin/users/export',
    },
  },

  // Branch Admin Endpoints
  BRANCH_ADMIN: {
    DASHBOARD: '/api/branch-admin/dashboard',
    
    // Teachers Management
    TEACHERS: {
      CREATE: '/api/branch-admin/teachers',
      LIST: '/api/branch-admin/teachers',
      GET: '/api/branch-admin/teachers/:id',
      UPDATE: '/api/branch-admin/teachers/:id',
      DELETE: '/api/branch-admin/teachers/:id',
      ASSIGN_SUBJECTS: '/api/branch-admin/teachers/:id/assign-subjects',
      ASSIGN_CLASSES: '/api/branch-admin/teachers/:id/assign-classes',
      SCHEDULE: '/api/branch-admin/teachers/:id/schedule',
    },
    
    // Students Management
    STUDENTS: {
      CREATE: '/api/branch-admin/students',
      LIST: '/api/branch-admin/students',
      GET: '/api/branch-admin/students/:id',
      UPDATE: '/api/branch-admin/students/:id',
      DELETE: '/api/branch-admin/students/:id',
      ENROLL: '/branch-admin/students/enroll',
      TRANSFER: '/branch-admin/students/:id/transfer',
      PROMOTE: '/branch-admin/students/:id/promote',
      BULK_UPLOAD: '/branch-admin/students/bulk-upload',
      EXPORT: '/branch-admin/students/export',
    },
    
    // Classes Management
    CLASSES: {
      CREATE: '/branch-admin/classes',
      LIST: '/branch-admin/classes',
      GET: '/branch-admin/classes/:id',
      UPDATE: '/branch-admin/classes/:id',
      DELETE: '/branch-admin/classes/:id',
      ASSIGN_TEACHER: '/branch-admin/classes/:id/assign-teacher',
      STUDENTS: '/branch-admin/classes/:id/students',
      TIMETABLE: '/branch-admin/classes/:id/timetable',
    },
    
    // Subjects Management
    SUBJECTS: {
      CREATE: '/branch-admin/subjects',
      LIST: '/branch-admin/subjects',
      GET: '/branch-admin/subjects/:id',
      UPDATE: '/branch-admin/subjects/:id',
      DELETE: '/branch-admin/subjects/:id',
    },
    
    // Reports
    REPORTS: {
      ATTENDANCE: '/branch-admin/reports/attendance',
      PERFORMANCE: '/branch-admin/reports/performance',
      FINANCIAL: '/branch-admin/reports/financial',
      TEACHER_PERFORMANCE: '/branch-admin/reports/teacher-performance',
      EXPORT: '/branch-admin/reports/export',
    },
    
    // Finance
    FINANCE: {
      FEES: '/branch-admin/finance/fees',
      PAYMENTS: '/branch-admin/finance/payments',
      INVOICES: '/branch-admin/finance/invoices',
      EXPENSES: '/branch-admin/finance/expenses',
      SUMMARY: '/branch-admin/finance/summary',
    },
  },

  // Teacher Endpoints
  TEACHER: {
    DASHBOARD: '/teacher/dashboard',
    
    // Classes
    CLASSES: {
      LIST: '/teacher/classes',
      GET: '/teacher/classes/:id',
      STUDENTS: '/teacher/classes/:id/students',
      TIMETABLE: '/teacher/classes/:id/timetable',
    },
    
    // Students
    STUDENTS: {
      LIST: '/teacher/students',
      GET: '/teacher/students/:id',
      PERFORMANCE: '/teacher/students/:id/performance',
    },
    
    // Attendance
    ATTENDANCE: {
      MARK: '/teacher/attendance/mark',
      VIEW: '/teacher/attendance/view',
      HISTORY: '/teacher/attendance/history',
      REPORT: '/teacher/attendance/report',
      BULK_MARK: '/teacher/attendance/bulk-mark',
    },
    
    // Assignments
    ASSIGNMENTS: {
      CREATE: '/teacher/assignments',
      LIST: '/teacher/assignments',
      GET: '/teacher/assignments/:id',
      UPDATE: '/teacher/assignments/:id',
      DELETE: '/teacher/assignments/:id',
      SUBMISSIONS: '/teacher/assignments/:id/submissions',
      GRADE: '/teacher/assignments/:id/grade',
    },
    
    // Exams
    EXAMS: {
      CREATE: '/teacher/exams',
      LIST: '/teacher/exams',
      GET: '/teacher/exams/:id',
      UPDATE: '/teacher/exams/:id',
      DELETE: '/teacher/exams/:id',
      SCHEDULE: '/teacher/exams/:id/schedule',
    },
    
    // Grades
    GRADES: {
      CREATE: '/teacher/grades',
      LIST: '/teacher/grades',
      UPDATE: '/teacher/grades/:id',
      BULK_UPLOAD: '/teacher/grades/bulk-upload',
      PUBLISH: '/teacher/grades/publish',
    },
    
    // Leave Management
    LEAVE: {
      APPLY: '/teacher/leave/apply',
      LIST: '/teacher/leave',
      CANCEL: '/teacher/leave/:id/cancel',
      HISTORY: '/teacher/leave/history',
    },
  },

  // Parent Endpoints
  PARENT: {
    DASHBOARD: '/parent/dashboard',
    
    // Children
    CHILDREN: {
      LIST: '/parent/children',
      GET: '/parent/children/:id',
      ADD: '/parent/children/add',
      REMOVE: '/parent/children/:id/remove',
    },
    
    // Attendance
    ATTENDANCE: {
      VIEW: '/parent/attendance/:studentId',
      REPORT: '/parent/attendance/:studentId/report',
      SUMMARY: '/parent/attendance/:studentId/summary',
    },
    
    // Grades
    GRADES: {
      VIEW: '/parent/grades/:studentId',
      REPORT: '/parent/grades/:studentId/report',
      HISTORY: '/parent/grades/:studentId/history',
    },
    
    // Assignments
    ASSIGNMENTS: {
      VIEW: '/parent/assignments/:studentId',
      DETAILS: '/parent/assignments/:studentId/:assignmentId',
    },
    
    // Communications
    COMMUNICATIONS: {
      LIST: '/parent/communications',
      SEND: '/parent/communications/send',
      REPLY: '/parent/communications/:id/reply',
      TEACHERS: '/parent/communications/teachers',
    },
    
    // Fees
    FEES: {
      VIEW: '/parent/fees/:studentId',
      PAY: '/parent/fees/:studentId/pay',
      HISTORY: '/parent/fees/:studentId/history',
      INVOICES: '/parent/fees/:studentId/invoices',
    },
    
    // Leave Requests
    LEAVE: {
      APPLY: '/parent/leave/:studentId/apply',
      LIST: '/parent/leave/:studentId',
      CANCEL: '/parent/leave/:id/cancel',
    },
  },

  // Student Endpoints
  STUDENT: {
    DASHBOARD: '/student/dashboard',
    
    // Profile
    PROFILE: {
      GET: '/student/profile',
      UPDATE: '/student/profile',
      AVATAR: '/student/profile/avatar',
    },
    
    // Attendance
    ATTENDANCE: {
      VIEW: '/student/attendance',
      REPORT: '/student/attendance/report',
      SUMMARY: '/student/attendance/summary',
    },
    
    // Grades
    GRADES: {
      VIEW: '/student/grades',
      DETAILS: '/student/grades/:id',
      REPORT: '/student/grades/report',
      HISTORY: '/student/grades/history',
    },
    
    // Assignments
    ASSIGNMENTS: {
      LIST: '/student/assignments',
      GET: '/student/assignments/:id',
      SUBMIT: '/student/assignments/:id/submit',
      SUBMISSIONS: '/student/assignments/submissions',
    },
    
    // Schedule
    SCHEDULE: {
      TIMETABLE: '/student/schedule/timetable',
      EXAMS: '/student/schedule/exams',
      EVENTS: '/student/schedule/events',
    },
    
    // Fees
    FEES: {
      VIEW: '/student/fees',
      HISTORY: '/student/fees/history',
      INVOICES: '/student/fees/invoices',
    },
    
    // Library
    LIBRARY: {
      BOOKS: '/student/library/books',
      ISSUED: '/student/library/issued',
      HISTORY: '/student/library/history',
      SEARCH: '/student/library/search',
    },
  },

  // Common/Shared Endpoints
  COMMON: {
    // File Upload
    UPLOAD: {
      IMAGE: '/common/upload/image',
      DOCUMENT: '/common/upload/document',
      BULK: '/common/upload/bulk',
    },
    
    // Notifications
    NOTIFICATIONS: {
      LIST: '/common/notifications',
      READ: '/common/notifications/:id/read',
      READ_ALL: '/common/notifications/read-all',
      UNREAD_COUNT: '/common/notifications/unread-count',
      DELETE: '/common/notifications/:id',
    },
    
    // Search
    SEARCH: {
      GLOBAL: '/common/search',
      STUDENTS: '/common/search/students',
      TEACHERS: '/common/search/teachers',
      CLASSES: '/common/search/classes',
    },
  },
};

// Helper function to build URL with parameters
export const buildUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Replace path parameters
  Object.keys(params).forEach((key) => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
};

// Helper function to build full API URL
export const getFullUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export default API_ENDPOINTS;
