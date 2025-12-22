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
  Shield,
  Key,
  Download,
  Upload,
  FileText,
  Settings,
  LogOut,
  CreditCard,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function TeacherProfilePage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    attendanceReminders: true,
    gradeNotifications: true,
    assignmentDueReminders: true,
    smsNotifications: false,
    theme: "system",
    language: "en",
    fontSize: "medium",
    compactView: false,
  });

  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
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
          firstName: "Muhammad",
          lastName: "Ahmed Khan",
          email: "m.ahmed.khan@ease.edu",
          phone: "+92 300 1234567",
          alternatePhone: "+92 321 9876543",
          address: "House #123, Street 4, DHA Phase 5, Karachi, Pakistan",
          dateOfBirth: "1990-01-15",
          joiningDate: "2020-01-01",
          employeeId: "TCH001",
          qualification: "M.Sc. Mathematics, B.Ed.",
          experience: "5 years",
          subjects: ["Mathematics", "Physics", "Computer Science"],
          department: "Science & Technology",
          salary: "80,000 PKR",
          bankAccount: "PK**************2345",
          emergencyContact: {
            name: "Fatima Khan",
            relation: "Wife",
            phone: "+92 300 1234568",
          },
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
          totalClasses: 8,
          totalStudents: 240,
          attendanceRate: 94,
          averageGrade: 87,
          totalAssignments: 42,
          avgResponseTime: "2.5 hours",
        },
        achievements: [
          {
            title: "Best Teacher Award 2024",
            date: "March 2024",
            icon: "trophy",
          },
          {
            title: "100% Attendance Record",
            date: "2023",
            icon: "star",
          },
          {
            title: "Student Excellence Rating",
            date: "December 2023",
            icon: "award",
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

  const handleExportData = () => {
    toast.success("Exporting your data...");
  };

  const handleChangePassword = () => {
    toast.info("Redirecting to password change...");
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

  const { profile, teacherAttendance, attendanceHistory, stats, achievements } =
    profileData;

  const menuItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "professional", label: "Professional Info", icon: Award },
    { id: "settings", label: "Preferences", icon: Settings },
    { id: "security", label: "Security", icon: Shield },
    { id: "achievements", label: "Achievements", icon: Star },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold">Teacher Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your profile, settings, and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-4 py-2">
            ID: {profile.employeeId}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/50">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalClasses}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Active Classes</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200/50">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 text-green-600" />
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalStudents}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total Students</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-200/50">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-purple-600" />
            <Badge
              variant="outline"
              className="text-[9px] border-purple-300 text-purple-700"
            >
              Excellent
            </Badge>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {stats.attendanceRate}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">My Attendance</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-200/50">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 text-orange-600" />
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {stats.averageGrade}%
          </p>
          <p className="text-sm text-muted-foreground mt-1">Class Average</p>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Sidebar - Navigation */}
        <div className="lg:col-span-3">
          <Card className="p-4">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === item.id
                      ? "bg-primary text-white"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <div className="pt-4 mt-4 border-t">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-all">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4 mt-4">
            <h3 className="font-semibold text-sm mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                View Payslip
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-6 space-y-6">
          {/* Profile Section */}
          {activeSection === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">
                    Personal Information
                  </h2>
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
                      Alternate Phone
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.alternatePhone}</span>
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Bank Account
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <span>{profile.bankAccount}</span>
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

              {/* Emergency Contact */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Emergency Contact
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span>{profile.emergencyContact.name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Relation
                    </label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span>{profile.emergencyContact.relation}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone
                    </label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span>{profile.emergencyContact.phone}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Professional Section */}
          {activeSection === "professional" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Monthly Salary
                    </label>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <span className="text-green-700 font-semibold">
                        {profile.salary}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Avg Response Time
                    </label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span>{stats.avgResponseTime}</span>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Subjects Teaching
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {profile.subjects.map((subject, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="px-3 py-1"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Performance Metrics</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Total Assignments
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.totalAssignments}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">
                        Student Rating
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        4.8/5.0
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-3">
                  {[
                    { key: "emailNotifications", label: "Email Notifications" },
                    { key: "pushNotifications", label: "Push Notifications" },
                    { key: "smsNotifications", label: "SMS Notifications" },
                    {
                      key: "attendanceReminders",
                      label: "Attendance Reminders",
                    },
                    {
                      key: "gradeNotifications",
                      label: "Grade Update Notifications",
                    },
                    {
                      key: "assignmentDueReminders",
                      label: "Assignment Due Reminders",
                    },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
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
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Appearance</h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Theme
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          theme: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          language: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    >
                      <option value="en">English</option>
                      <option value="ur">Urdu</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Font Size</label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          fontSize: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">View Mode</label>
                    <div className="flex items-center gap-2 p-3 border border-border rounded-lg">
                      <input
                        type="checkbox"
                        checked={settings.compactView}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            compactView: e.target.checked,
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Compact View</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full mt-6">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Security Settings
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          Two-Factor Authentication
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Add an extra layer of security
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.twoFactorAuth}
                        onChange={(e) =>
                          setSecurity((prev) => ({
                            ...prev,
                            twoFactorAuth: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Login Alerts</p>
                        <p className="text-xs text-muted-foreground">
                          Get notified for new logins
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={security.loginAlerts}
                        onChange={(e) =>
                          setSecurity((prev) => ({
                            ...prev,
                            loginAlerts: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg">
                    <label className="text-sm font-medium mb-2 block">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) =>
                        setSecurity((prev) => ({
                          ...prev,
                          sessionTimeout: parseInt(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleChangePassword}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Key className="w-4 h-4 mr-2" />
                    Manage API Keys
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Achievements Section */}
          {activeSection === "achievements" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Achievements & Awards
                </h2>

                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg"
                    >
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {achievement.date}
                        </p>
                      </div>
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium">
                    🎉 Keep up the great work! Your dedication is recognized.
                  </p>
                </div>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right Column - Attendance & Quick Info */}
        <div className="lg:col-span-3 space-y-6">
          <CheckInOutCard
            teacherAttendance={teacherAttendance}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />

          {/* Quick Stats */}
          <Card className="p-5">
            <h3 className="font-semibold text-sm mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Present Days
                </span>
                <span className="font-semibold">22/24</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Hours</span>
                <span className="font-semibold">8.5 hrs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Late Arrivals
                </span>
                <span className="font-semibold text-amber-600">2</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Attendance History - Full Width */}
      <AttendanceHistoryCard attendanceHistory={attendanceHistory} />
    </div>
  );
}
