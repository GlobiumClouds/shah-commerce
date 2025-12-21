"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CheckInOutCard from "@/components/teacher/CheckInOutCard";
import AttendanceHistoryCard from "@/components/teacher/AttendanceHistoryCard";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  Clock,
  Edit,
  Save,
  Bell,
  Lock,
  Palette,
  Globe,
} from "lucide-react";
import { toast } from "sonner";

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    attendanceReminders: true,
    theme: "system",
    language: "en",
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockData = {
        profile: {
          firstName: "Teacher",
          lastName: "Name",
          email: "teacher@example.com",
          phone: "+92 300 1234567",
          address: "123 Main Street, Karachi, Pakistan",
          dateOfBirth: "1990-01-01",
          joiningDate: "2020-01-01",
          employeeId: "TCH001",
          qualification: "M.Sc. Mathematics",
          experience: "5 years",
          subjects: ["Mathematics", "Physics"],
          department: "Science",
        },
        teacherAttendance: {
          status: "checked_in",
          checkInTime: new Date(Date.now() - 28800000).toISOString(),
          checkOutTime: null,
          workingHours: null,
        },
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
        ],
        stats: {
          totalClasses: 5,
          totalStudents: 150,
          attendanceRate: 92,
          averageGrade: 85,
        },
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
      toast.success("Checked in successfully!");
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
      toast.success("Checked out successfully!");
    } catch (error) {
      console.error("Check-out error:", error);
      throw error;
    }
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully!");
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

  const { profile, teacherAttendance, attendanceHistory, stats } = profileData;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teacher Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile and settings
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          ID: {profile.employeeId}
        </Badge>
      </div>

      {/* Profile Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-sm text-muted-foreground">Classes</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalClasses}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-8 h-8 text-green-600" />
            <span className="text-sm text-muted-foreground">Students</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalStudents}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-purple-600" />
            <span className="text-sm text-muted-foreground">Attendance</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {stats.attendanceRate}%
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-orange-600" />
            <span className="text-sm text-muted-foreground">Avg Grade</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {stats.averageGrade}%
          </p>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <Edit className="w-4 h-4 mr-2" />
                )}
                {isEditing ? "Save" : "Edit"}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {profile.firstName} {profile.lastName}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{profile.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.phone}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Date of Birth
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.address}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Professional Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Professional Information
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Qualification
                </label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span>{profile.qualification}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Experience
                </label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span>{profile.experience}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Department
                </label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span>{profile.department}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Joining Date
                </label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span>
                    {new Date(profile.joiningDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Subjects
                </label>
                <div className="flex gap-2">
                  {profile.subjects.map((subject, idx) => (
                    <Badge key={idx} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Settings Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">
              Preferences & Settings
            </h2>

            {/* Notifications */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Notifications</h3>
              </div>

              {[
                { key: "emailNotifications", label: "Email Notifications" },
                { key: "pushNotifications", label: "Push Notifications" },
                { key: "attendanceReminders", label: "Attendance Reminders" },
              ].map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-sm">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[key]}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-3">
                <Palette className="w-5 h-5 text-primary" />
                <h3 className="font-medium">Appearance</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        theme: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        language: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English</option>
                    <option value="ur">Urdu</option>
                  </select>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full mt-4">
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Attendance */}
        <div className="space-y-6">
          <CheckInOutCard
            teacherAttendance={teacherAttendance}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </div>
      </div>

      {/* Attendance History - Full Width */}
      <AttendanceHistoryCard attendanceHistory={attendanceHistory} />
    </div>
  );
}
