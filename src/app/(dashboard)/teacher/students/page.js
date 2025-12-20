"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Phone, BookOpen, Search, TrendingUp } from "lucide-react";
import DashboardSkeleton from "@/components/teacher/DashboardSkeleton";

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockStudents = [
        {
          _id: "1",
          name: "Ahmed Ali",
          rollNumber: "2024001",
          email: "ahmed@example.com",
          phone: "+92 300 1234567",
          class: "Mathematics 101",
          grade: "10th",
          attendanceRate: 95,
          performance: "Excellent",
          avatar: "A",
        },
        {
          _id: "2",
          name: "Fatima Khan",
          rollNumber: "2024002",
          email: "fatima@example.com",
          phone: "+92 301 2345678",
          class: "Physics 201",
          grade: "11th",
          attendanceRate: 92,
          performance: "Very Good",
          avatar: "F",
        },
        {
          _id: "3",
          name: "Hassan Raza",
          rollNumber: "2024003",
          email: "hassan@example.com",
          phone: "+92 302 3456789",
          class: "Chemistry 301",
          grade: "12th",
          attendanceRate: 88,
          performance: "Good",
          avatar: "H",
        },
        {
          _id: "4",
          name: "Ayesha Malik",
          rollNumber: "2024004",
          email: "ayesha@example.com",
          phone: "+92 303 4567890",
          class: "Mathematics 101",
          grade: "10th",
          attendanceRate: 97,
          performance: "Excellent",
          avatar: "A",
        },
        {
          _id: "5",
          name: "Bilal Ahmed",
          rollNumber: "2024005",
          email: "bilal@example.com",
          phone: "+92 304 5678901",
          class: "Biology 401",
          grade: "12th",
          attendanceRate: 90,
          performance: "Very Good",
          avatar: "B",
        },
        {
          _id: "6",
          name: "Sara Hussain",
          rollNumber: "2024006",
          email: "sara@example.com",
          phone: "+92 305 6789012",
          class: "English Literature 501",
          grade: "11th",
          attendanceRate: 94,
          performance: "Excellent",
          avatar: "S",
        },
      ];

      setStudents(mockStudents);
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass === "all" || student.class === filterClass;

    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map((s) => s.class))];

  const getPerformanceColor = (performance) => {
    switch (performance) {
      case "Excellent":
        return "text-green-600 bg-green-500/10";
      case "Very Good":
        return "text-blue-600 bg-blue-500/10";
      case "Good":
        return "text-yellow-600 bg-yellow-500/10";
      default:
        return "text-gray-600 bg-gray-500/10";
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Students</h1>
          <p className="text-muted-foreground mt-1">
            View and manage all your students
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {students.length} Total Students
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Class Filter */}
        <select
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Classes</option>
          {uniqueClasses.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
      </div>

      {/* Students Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
              {/* Student Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {student.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors truncate">
                    {student.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Roll: {student.rollNumber}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {student.grade}
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{student.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span className="truncate">{student.class}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">
                      Attendance
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {student.attendanceRate}%
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg ${getPerformanceColor(
                    student.performance
                  )}`}
                >
                  <span className="text-xs">Performance</span>
                  <p className="text-sm font-bold mt-1">
                    {student.performance}
                  </p>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-primary/60 w-0 group-hover:w-full transition-all duration-300" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground font-medium">No students found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}
