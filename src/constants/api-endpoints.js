// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication Endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
    ME: '/auth/me',
  },

  // Super Admin Endpoints
  SUPER_ADMIN: {
    DASHBOARD: '/super-admin/dashboard',
    
    // Branch Management
    BRANCHES: {
      CREATE: '/super-admin/branches',
      LIST: '/super-admin/branches',
      GET: '/super-admin/branches/:id',
      UPDATE: '/super-admin/branches/:id',
      DELETE: '/super-admin/branches/:id',
      STATS: '/super-admin/branches/stats',
      ACTIVATE: '/super-admin/branches/:id/activate',
      DEACTIVATE: '/super-admin/branches/:id/deactivate',
    },
    
    // Branch Admin Management
    BRANCH_ADMINS: {
      CREATE: '/super-admin/branch-admins',
      LIST: '/super-admin/branch-admins',
      GET: '/super-admin/branch-admins/:id',
      UPDATE: '/super-admin/branch-admins/:id',
      DELETE: '/super-admin/branch-admins/:id',
      ASSIGN_BRANCH: '/super-admin/branch-admins/:id/assign-branch',
    },
    
    // Global Settings
    SETTINGS: {
      GET: '/super-admin/settings',
      UPDATE: '/super-admin/settings',
      RESET: '/super-admin/settings/reset',
    },

    // Events Management
    EVENTS: {
      CREATE: '/super-admin/events',
      LIST: '/super-admin/events',
      GET: '/super-admin/events/:id',
      UPDATE: '/super-admin/events/:id',
      DELETE: '/super-admin/events/:id',
    },

    // Expenses Management
    EXPENSES: {
      CREATE: '/super-admin/expenses',
      LIST: '/super-admin/expenses',
      GET: '/super-admin/expenses/:id',
      UPDATE: '/super-admin/expenses/:id',
      DELETE: '/super-admin/expenses/:id',
    },

    // Subscriptions Management
    SUBSCRIPTIONS: {
      CREATE: '/super-admin/subscriptions',
      LIST: '/super-admin/subscriptions',
      GET: '/super-admin/subscriptions/:id',
      UPDATE: '/super-admin/subscriptions/:id',
      DELETE: '/super-admin/subscriptions/:id',
    },

    // Salaries Management
    SALARIES: {
      CREATE: '/super-admin/salaries',
      LIST: '/super-admin/salaries',
      GET: '/super-admin/salaries/:id',
      UPDATE: '/super-admin/salaries/:id',
      DELETE: '/super-admin/salaries/:id',
      PROCESS: '/super-admin/salaries/:id/process',
    },
    
    // Admins Management
    ADMINS: {
      CREATE: '/super-admin/admins',
      LIST: '/super-admin/admins',
      GET: '/super-admin/admins/:id',
      UPDATE: '/super-admin/admins/:id',
      DELETE: '/super-admin/admins/:id',
      ASSIGN_BRANCH: '/super-admin/admins/:id/assign-branch',
    },
    
    // Reports
    REPORTS: {
      OVERALL: '/super-admin/reports/overall',
      BRANCHES: '/super-admin/reports/branches',
      FINANCIAL: '/super-admin/reports/financial',
      ATTENDANCE: '/super-admin/reports/attendance',
      PERFORMANCE: '/super-admin/reports/performance',
      EXPORT: '/super-admin/reports/export',
    },
    
    // Users Management
    USERS: {
      LIST: '/super-admin/users',
      GET: '/super-admin/users/:id',
      CREATE: '/super-admin/users',
      UPDATE: '/super-admin/users/:id',
      DELETE: '/super-admin/users/:id',
      BULK_CREATE: '/super-admin/users/bulk',
      EXPORT: '/super-admin/users/export',
    },
  },

  // Branch Admin Endpoints
  BRANCH_ADMIN: {
    DASHBOARD: '/branch-admin/dashboard',
    
    // Teachers Management
    TEACHERS: {
      CREATE: '/branch-admin/teachers',
      LIST: '/branch-admin/teachers',
      GET: '/branch-admin/teachers/:id',
      UPDATE: '/branch-admin/teachers/:id',
      DELETE: '/branch-admin/teachers/:id',
      ASSIGN_SUBJECTS: '/branch-admin/teachers/:id/assign-subjects',
      ASSIGN_CLASSES: '/branch-admin/teachers/:id/assign-classes',
      SCHEDULE: '/branch-admin/teachers/:id/schedule',
    },
    
    // Students Management
    STUDENTS: {
      CREATE: '/branch-admin/students',
      LIST: '/branch-admin/students',
      GET: '/branch-admin/students/:id',
      UPDATE: '/branch-admin/students/:id',
      DELETE: '/branch-admin/students/:id',
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
