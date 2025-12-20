# 🔌 Teacher Dashboard - API Integration Guide

## Required API Endpoints

### 1. Dashboard Data Endpoint

**Endpoint**: `GET /api/teacher/dashboard`  
**Purpose**: Fetch all dashboard data in one call  
**Authentication**: Required (JWT token)

#### Request

```javascript
GET / api / teacher / dashboard;
Headers: {
  Authorization: "Bearer <token>";
}
```

#### Response Structure

```javascript
{
  "success": true,
  "data": {
    // For DashboardStats component
    "stats": {
      "classes": {
        "total": 5,
        "active": 3,
        "change": 2  // Percentage change from last period
      },
      "students": {
        "total": 150,
        "change": 5
      },
      "attendance": {
        "average": 92,  // Percentage
        "change": 3
      },
      "exams": {
        "total": 8,
        "thisWeek": 2,
        "change": 1
      }
    },

    // For MyClassesCard component
    "myClasses": [
      {
        "_id": "class_id_1",
        "name": "Mathematics 101",
        "code": "MATH101",
        "studentCount": 30,
        "attendanceRate": 95,  // Optional
        "schedule": [
          {
            "day": "Monday",
            "startTime": "09:00",
            "endTime": "10:30"
          },
          {
            "day": "Wednesday",
            "startTime": "14:00",
            "endTime": "15:30"
          }
        ],
        "nextClass": "Tomorrow at 9:00 AM"  // Optional, formatted string
      }
    ],

    // For UpcomingExamsCard component
    "upcomingExams": [
      {
        "_id": "exam_id_1",
        "title": "Mid-term Exam - Mathematics",
        "date": "2025-12-25T10:00:00Z",  // ISO 8601 format
        "classId": {
          "name": "Mathematics 101"
        },
        "duration": 120,  // Minutes
        "room": "A101",
        "subject": "Mathematics"
      }
    ],

    // For DashboardGreeting component
    "branchInfo": {
      "branchName": "Main Campus",
      "branchCode": "MC001"  // Optional
    },

    // For TodayAttendanceCard component
    "todayAttendance": {
      "totalClasses": 4,
      "completedClasses": 2,
      "pendingClasses": 2,
      "totalStudents": 120,
      "presentStudents": 110,
      "absentStudents": 8,
      "lateStudents": 2,
      "attendanceRate": 92  // Percentage
    },

    // For RecentActivityFeed component
    "recentActivity": [
      {
        "_id": "activity_id_1",
        "type": "attendance",  // attendance | exam | assignment | announcement | message
        "title": "Attendance marked",
        "description": "Marked attendance for Mathematics 101",
        "timestamp": "2025-12-21T09:00:00Z",
        "className": "Mathematics 101",  // Optional
        "status": "completed"  // Optional
      }
    ],

    // For CheckInOutCard component
    "teacherAttendance": {
      "status": "checked_in",  // not_checked_in | checked_in | checked_out
      "checkInTime": "2025-12-21T08:00:00Z",  // null if not checked in
      "checkOutTime": null,  // null if not checked out
      "workingHours": null  // "9h 30m" format, null if not checked out
    },

    // For AttendanceHistoryCard component
    "attendanceHistory": [
      {
        "_id": "history_id_1",
        "date": "2025-12-20T00:00:00Z",
        "status": "present",  // present | absent | late
        "checkInTime": "2025-12-20T08:00:00Z",
        "checkOutTime": "2025-12-20T17:00:00Z",
        "workingHours": "9h 0m"
      }
    ]
  }
}
```

---

### 2. Check-In Endpoint

**Endpoint**: `POST /api/teacher/check-in`  
**Purpose**: Record teacher check-in time  
**Authentication**: Required

#### Request

```javascript
POST /api/teacher/check-in
Headers: {
  Authorization: "Bearer <token>"
}
Body: {}  // No body needed, teacher ID from token
```

#### Response

```javascript
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "checkInTime": "2025-12-21T08:00:00Z",
    "status": "checked_in"
  }
}
```

---

### 3. Check-Out Endpoint

**Endpoint**: `POST /api/teacher/check-out`  
**Purpose**: Record teacher check-out time and calculate working hours  
**Authentication**: Required

#### Request

```javascript
POST / api / teacher / check - out;
Headers: {
  Authorization: "Bearer <token>";
}
Body: {
} // No body needed
```

#### Response

```javascript
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "checkOutTime": "2025-12-21T17:00:00Z",
    "workingHours": "9h 0m",
    "status": "checked_out"
  }
}
```

---

## Backend Implementation Examples

### MongoDB Schema for Teacher Attendance

```javascript
// models/TeacherAttendance.js
const mongoose = require("mongoose");

const teacherAttendanceSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["not_checked_in", "checked_in", "checked_out", "absent", "late"],
      default: "not_checked_in",
    },
    workingHours: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
teacherAttendanceSchema.index({ teacherId: 1, date: -1 });

module.exports = mongoose.model("TeacherAttendance", teacherAttendanceSchema);
```

---

### Dashboard Controller Example

```javascript
// controllers/teacherController.js
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");
const Exam = require("../models/Exam");
const TeacherAttendance = require("../models/TeacherAttendance");

exports.getDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id; // From JWT middleware

    // Fetch teacher's classes
    const myClasses = await Class.find({ teacherId })
      .populate("students")
      .lean();

    // Calculate stats
    const totalStudents = myClasses.reduce(
      (sum, cls) => sum + cls.students.length,
      0
    );

    // Fetch upcoming exams
    const upcomingExams = await Exam.find({
      classId: { $in: myClasses.map((c) => c._id) },
      date: { $gte: new Date() },
    })
      .populate("classId", "name")
      .sort({ date: 1 })
      .limit(10)
      .lean();

    // Today's attendance
    const today = new Date().setHours(0, 0, 0, 0);
    const todayAttendance = await calculateTodayAttendance(teacherId, today);

    // Teacher's own attendance
    const teacherAttendance = await TeacherAttendance.findOne({
      teacherId,
      date: today,
    }).lean();

    // Attendance history (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const attendanceHistory = await TeacherAttendance.find({
      teacherId,
      date: { $gte: threeMonthsAgo },
    })
      .sort({ date: -1 })
      .lean();

    // Recent activity
    const recentActivity = await getRecentActivity(teacherId);

    // Branch info
    const teacher = await Teacher.findById(teacherId).populate("branchId");

    res.json({
      success: true,
      data: {
        stats: {
          classes: {
            total: myClasses.length,
            active: myClasses.filter((c) => c.isActive).length,
            change: 2, // Calculate from previous period
          },
          students: {
            total: totalStudents,
            change: 5,
          },
          attendance: {
            average: 92, // Calculate from attendance records
            change: 3,
          },
          exams: {
            total: upcomingExams.length,
            thisWeek: upcomingExams.filter((e) => isThisWeek(e.date)).length,
            change: 1,
          },
        },
        myClasses: myClasses.map((cls) => ({
          _id: cls._id,
          name: cls.name,
          code: cls.code,
          studentCount: cls.students.length,
          attendanceRate: calculateAttendanceRate(cls._id),
          schedule: cls.schedule,
          nextClass: getNextClassTime(cls.schedule),
        })),
        upcomingExams,
        branchInfo: {
          branchName: teacher.branchId.name,
        },
        todayAttendance,
        recentActivity,
        teacherAttendance: teacherAttendance || {
          status: "not_checked_in",
          checkInTime: null,
          checkOutTime: null,
          workingHours: null,
        },
        attendanceHistory,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
```

---

### Check-In Controller

```javascript
exports.checkIn = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const today = new Date().setHours(0, 0, 0, 0);

    // Check if already checked in
    let attendance = await TeacherAttendance.findOne({
      teacherId,
      date: today,
    });

    if (attendance && attendance.status !== "not_checked_in") {
      return res.status(400).json({
        success: false,
        message: "Already checked in today",
      });
    }

    const checkInTime = new Date();

    // Determine if late (after 9 AM)
    const isLate = checkInTime.getHours() >= 9;

    if (!attendance) {
      attendance = new TeacherAttendance({
        teacherId,
        date: today,
        checkInTime,
        status: isLate ? "late" : "checked_in",
      });
    } else {
      attendance.checkInTime = checkInTime;
      attendance.status = isLate ? "late" : "checked_in";
    }

    await attendance.save();

    res.json({
      success: true,
      message: "Checked in successfully",
      data: {
        checkInTime,
        status: attendance.status,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check in",
    });
  }
};
```

---

### Check-Out Controller

```javascript
exports.checkOut = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const today = new Date().setHours(0, 0, 0, 0);

    const attendance = await TeacherAttendance.findOne({
      teacherId,
      date: today,
    });

    if (!attendance || attendance.status === "not_checked_in") {
      return res.status(400).json({
        success: false,
        message: "Please check in first",
      });
    }

    if (attendance.status === "checked_out") {
      return res.status(400).json({
        success: false,
        message: "Already checked out today",
      });
    }

    const checkOutTime = new Date();

    // Calculate working hours
    const diffMs = checkOutTime - attendance.checkInTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const workingHours = `${hours}h ${minutes}m`;

    attendance.checkOutTime = checkOutTime;
    attendance.status = "checked_out";
    attendance.workingHours = workingHours;

    await attendance.save();

    res.json({
      success: true,
      message: "Checked out successfully",
      data: {
        checkOutTime,
        workingHours,
        status: "checked_out",
      },
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check out",
    });
  }
};
```

---

## API Routes Setup

```javascript
// routes/teacherRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const teacherController = require("../controllers/teacherController");

// Dashboard
router.get("/dashboard", authenticate, teacherController.getDashboard);

// Attendance
router.post("/check-in", authenticate, teacherController.checkIn);
router.post("/check-out", authenticate, teacherController.checkOut);

module.exports = router;
```

---

## Frontend API Client

```javascript
// lib/api-client.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

---

## Constants File

```javascript
// constants/api-endpoints.js
export const API_ENDPOINTS = {
  TEACHER: {
    DASHBOARD: "/teacher/dashboard",
    CHECK_IN: "/teacher/check-in",
    CHECK_OUT: "/teacher/check-out",
  },
};
```

---

## Error Handling

```javascript
// In your dashboard page
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const response = await apiClient.get(API_ENDPOINTS.TEACHER.DASHBOARD);

    if (response.data.success) {
      setDashboardData(response.data.data);
    } else {
      setError(response.data.message || "Failed to load dashboard");
    }
  } catch (err) {
    if (err.response?.status === 401) {
      // Unauthorized - redirect to login
      router.push("/login");
    } else {
      setError(err.message || "Failed to load dashboard data");
    }
  } finally {
    setLoading(false);
  }
};
```

---

## Testing the API

### Using cURL

```bash
# Get dashboard data
curl -X GET http://localhost:3000/api/teacher/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check in
curl -X POST http://localhost:3000/api/teacher/check-in \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Check out
curl -X POST http://localhost:3000/api/teacher/check-out \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman

1. Create a new request
2. Set method to GET/POST
3. Add URL: `http://localhost:3000/api/teacher/dashboard`
4. Add header: `Authorization: Bearer YOUR_TOKEN`
5. Send request

---

**Your API integration guide is ready! 🚀**
