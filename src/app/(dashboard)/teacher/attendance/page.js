"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ClipboardCheck,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Users,
} from "lucide-react";
import DashboardSkeleton from "@/components/teacher/DashboardSkeleton";

export default function TeacherAttendancePage() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockData = {
        classes: [
          {
            _id: "1",
            name: "Mathematics 101",
            code: "MATH101",
            studentCount: 30,
          },
          { _id: "2", name: "Physics 201", code: "PHY201", studentCount: 25 },
          {
            _id: "3",
            name: "Chemistry 301",
            code: "CHEM301",
            studentCount: 28,
          },
        ],
        todayStats: {
          totalClasses: 3,
          completedClasses: 2,
          pendingClasses: 1,
          totalStudents: 83,
          presentStudents: 75,
          absentStudents: 6,
          lateStudents: 2,
          attendanceRate: 90,
        },
        recentAttendance: [
          {
            _id: "1",
            className: "Mathematics 101",
            date: new Date().toISOString(),
            present: 28,
            absent: 2,
            late: 0,
            total: 30,
            rate: 93,
          },
          {
            _id: "2",
            className: "Physics 201",
            date: new Date().toISOString(),
            present: 23,
            absent: 1,
            late: 1,
            total: 25,
            rate: 92,
          },
          {
            _id: "3",
            className: "Chemistry 301",
            date: new Date(Date.now() - 86400000).toISOString(),
            present: 26,
            absent: 2,
            late: 0,
            total: 28,
            rate: 93,
          },
        ],
      };

      setAttendanceData(mockData);
    } catch (error) {
      console.error("Error loading attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { classes, todayStats, recentAttendance } = attendanceData;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            Mark and track student attendance
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {todayStats.attendanceRate}% Today
        </Badge>
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-sm text-muted-foreground">Present</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {todayStats.presentStudents}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
            <span className="text-sm text-muted-foreground">Absent</span>
          </div>
          <p className="text-3xl font-bold text-red-600">
            {todayStats.absentStudents}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <span className="text-sm text-muted-foreground">Late</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {todayStats.lateStudents}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {todayStats.totalStudents}
          </p>
        </Card>
      </div>

      {/* Mark Attendance Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Class
            </label>
            <select
              value={selectedClass || ""}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a class...</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} ({cls.code}) - {cls.studentCount} students
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <Button disabled={!selectedClass} className="w-full md:w-auto">
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Start Marking Attendance
        </Button>
      </Card>

      {/* Recent Attendance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Attendance Records</h2>
          <Badge variant="outline">{recentAttendance.length} Records</Badge>
        </div>

        <div className="space-y-3">
          {recentAttendance.map((record, index) => (
            <motion.div
              key={record._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{record.className}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(record.date).toLocaleDateString()}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">
                        {record.present}
                      </span>
                      <span className="text-muted-foreground">Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600 font-medium">
                        {record.absent}
                      </span>
                      <span className="text-muted-foreground">Absent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">
                        {record.late}
                      </span>
                      <span className="text-muted-foreground">Late</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {record.rate}%
                  </p>
                  <p className="text-xs text-muted-foreground">Rate</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
