"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, TrendingUp, Clock, Search } from "lucide-react";
import DashboardSkeleton from "@/components/teacher/DashboardSkeleton";

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockClasses = [
        {
          _id: "1",
          name: "Mathematics 101",
          code: "MATH101",
          subject: "Mathematics",
          grade: "10th",
          section: "A",
          studentCount: 30,
          attendanceRate: 95,
          schedule: [
            { day: "Monday", startTime: "09:00", endTime: "10:30" },
            { day: "Wednesday", startTime: "14:00", endTime: "15:30" },
          ],
          room: "A-101",
          semester: "Spring 2025",
        },
        {
          _id: "2",
          name: "Physics 201",
          code: "PHY201",
          subject: "Physics",
          grade: "11th",
          section: "B",
          studentCount: 25,
          attendanceRate: 88,
          schedule: [
            { day: "Tuesday", startTime: "10:00", endTime: "11:30" },
            { day: "Thursday", startTime: "13:00", endTime: "14:30" },
          ],
          room: "B-205",
          semester: "Spring 2025",
        },
        {
          _id: "3",
          name: "Chemistry 301",
          code: "CHEM301",
          subject: "Chemistry",
          grade: "12th",
          section: "A",
          studentCount: 28,
          attendanceRate: 91,
          schedule: [
            {
              day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
              startTime: "09:00",
              endTime: "10:30",
            },
          ],
          room: "C-102",
          semester: "Spring 2025",
        },
        {
          _id: "4",
          name: "Biology 401",
          code: "BIO401",
          subject: "Biology",
          grade: "12th",
          section: "B",
          studentCount: 22,
          attendanceRate: 93,
          schedule: [{ day: "Friday", startTime: "11:00", endTime: "12:30" }],
          room: "D-303",
          semester: "Spring 2025",
        },
        {
          _id: "5",
          name: "English Literature 501",
          code: "ENG501",
          subject: "English",
          grade: "11th",
          section: "A",
          studentCount: 35,
          attendanceRate: 89,
          schedule: [
            { day: "Monday", startTime: "11:00", endTime: "12:30" },
            { day: "Thursday", startTime: "09:00", endTime: "10:30" },
          ],
          room: "E-201",
          semester: "Spring 2025",
        },
      ];

      setClasses(mockClasses);
    } catch (error) {
      console.error("Error loading classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Classes</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all your classes
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {classes.length} Total Classes
        </Badge>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          placeholder="Search classes by name, code, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Classes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredClasses.map((classItem, index) => {
          const isLive = classItem.schedule.some(
            (s) =>
              s.day ===
              new Date().toLocaleDateString("en-US", { weekday: "long" })
          );

          return (
            <motion.div
              key={classItem._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden">
                {/* Live Indicator */}
                {isLive && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white animate-pulse">
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      LIVE
                    </Badge>
                  </div>
                )}

                {/* Class Header */}
                <div className="mb-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {classItem.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {classItem.code} • {classItem.grade} - Section{" "}
                        {classItem.section}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Students
                      </span>
                    </div>
                    <p className="text-2xl font-bold">
                      {classItem.studentCount}
                    </p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">
                        Attendance
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {classItem.attendanceRate}%
                    </p>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Schedule:</p>
                  {classItem.schedule.map((sch, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Clock className="w-3 h-3" />
                      <span>
                        {sch.day}: {sch.startTime} - {sch.endTime}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Room: {classItem.room}
                  </span>
                  <Badge variant="outline">{classItem.subject}</Badge>
                </div>

                {/* Hover Effect */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-primary/60 w-0 group-hover:w-full transition-all duration-300" />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground font-medium">No classes found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search
          </p>
        </div>
      )}
    </div>
  );
}
