"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import CheckInOutCard from "@/components/teacher/CheckInOutCard";
import AttendanceHistoryCard from "@/components/teacher/AttendanceHistoryCard";
import RecentActivityFeed from "@/components/teacher/RecentActivityFeed";

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load profile data with mock data
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // MOCK DATA - Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockData = {
        teacherAttendance: {
          status: "checked_in",
          checkInTime: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
          checkOutTime: null,
          workingHours: null,
        },
        recentActivity: [
          {
            _id: "1",
            type: "attendance",
            title: "Attendance marked",
            description: "Marked attendance for Mathematics 101",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            className: "Mathematics 101",
            status: "completed",
          },
          {
            _id: "2",
            type: "exam",
            title: "Exam scheduled",
            description: "Mid-term exam scheduled",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            className: "Physics 201",
            status: "pending",
          },
          {
            _id: "3",
            type: "assignment",
            title: "Assignment created",
            description: "New assignment posted",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            className: "Chemistry 301",
            status: "completed",
          },
        ],
        attendanceHistory: [
          {
            _id: "1",
            date: new Date(Date.now() - 86400000).toISOString(),
            status: "present",
            checkInTime: new Date(
              Date.now() - 86400000 - 28800000
            ).toISOString(),
            checkOutTime: new Date(
              Date.now() - 86400000 - 3600000
            ).toISOString(),
            workingHours: "9h 0m",
          },
          {
            _id: "2",
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            status: "present",
            checkInTime: new Date(
              Date.now() - 86400000 * 2 - 28800000
            ).toISOString(),
            checkOutTime: new Date(
              Date.now() - 86400000 * 2 - 3600000
            ).toISOString(),
            workingHours: "8h 30m",
          },
          {
            _id: "3",
            date: new Date(Date.now() - 86400000 * 3).toISOString(),
            status: "late",
            checkInTime: new Date(
              Date.now() - 86400000 * 3 - 25200000
            ).toISOString(),
            checkOutTime: new Date(
              Date.now() - 86400000 * 3 - 3600000
            ).toISOString(),
            workingHours: "8h 0m",
          },
          {
            _id: "4",
            date: new Date(Date.now() - 86400000 * 4).toISOString(),
            status: "present",
            checkInTime: new Date(
              Date.now() - 86400000 * 4 - 28800000
            ).toISOString(),
            checkOutTime: new Date(
              Date.now() - 86400000 * 4 - 3600000
            ).toISOString(),
            workingHours: "9h 15m",
          },
          {
            _id: "5",
            date: new Date(Date.now() - 86400000 * 5).toISOString(),
            status: "present",
            checkInTime: new Date(
              Date.now() - 86400000 * 5 - 28800000
            ).toISOString(),
            checkOutTime: new Date(
              Date.now() - 86400000 * 5 - 3600000
            ).toISOString(),
            workingHours: "8h 45m",
          },
        ],
      };

      setProfileData(mockData);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      setProfileData((prev) => ({
        ...prev,
        teacherAttendance: {
          status: "checked_in",
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
          workingHours: null,
        },
      }));
    } catch (error) {
      console.error("Check-in error:", error);
      throw error;
    }
  };

  const handleCheckOut = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const checkInTime = new Date(profileData?.teacherAttendance?.checkInTime);
      const checkOutTime = new Date();
      const diffMs = checkOutTime - checkInTime;
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const workingHours = `${hours}h ${minutes}m`;

      setProfileData((prev) => ({
        ...prev,
        teacherAttendance: {
          status: "checked_out",
          checkInTime: prev.teacherAttendance.checkInTime,
          checkOutTime: checkOutTime.toISOString(),
          workingHours,
        },
      }));
    } catch (error) {
      console.error("Check-out error:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your attendance and view your activity
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Check-in and Activity */}
        <div className="lg:col-span-1 space-y-6">
          {/* Check In/Out Card */}
          <CheckInOutCard
            teacherAttendance={profileData?.teacherAttendance}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />

          {/* Recent Activity */}
          <RecentActivityFeed activities={profileData?.recentActivity} />
        </div>

        {/* Right Column - Attendance History */}
        <div className="lg:col-span-2">
          <AttendanceHistoryCard
            attendanceHistory={profileData?.attendanceHistory}
          />
        </div>
      </div>
    </div>
  );
}
