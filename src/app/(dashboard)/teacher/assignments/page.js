"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Clock,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import DashboardSkeleton from "@/components/teacher/DashboardSkeleton";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, submitted, overdue

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));

      const mockAssignments = [
        {
          _id: "1",
          title: "Quadratic Equations - Problem Set",
          className: "Mathematics 101",
          description:
            "Solve 20 problems on quadratic equations covering all topics",
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          totalMarks: 50,
          totalStudents: 30,
          submitted: 18,
          pending: 12,
          status: "active",
        },
        {
          _id: "2",
          title: "Newton's Laws Lab Report",
          className: "Physics 201",
          description:
            "Write a detailed lab report on Newton's three laws of motion",
          dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
          totalMarks: 100,
          totalStudents: 25,
          submitted: 10,
          pending: 15,
          status: "active",
        },
        {
          _id: "3",
          title: "Chemical Bonding Essay",
          className: "Chemistry 301",
          description:
            "Write an essay on types of chemical bonding with examples",
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          totalMarks: 75,
          totalStudents: 28,
          submitted: 20,
          pending: 8,
          status: "overdue",
        },
        {
          _id: "4",
          title: "Cell Structure Diagram",
          className: "Biology 401",
          description:
            "Draw and label a detailed diagram of plant and animal cells",
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
          totalMarks: 50,
          totalStudents: 22,
          submitted: 5,
          pending: 17,
          status: "active",
        },
        {
          _id: "5",
          title: "Shakespeare Analysis",
          className: "English Literature 501",
          description: "Analyze themes in Romeo and Juliet - 2000 words",
          dueDate: new Date(Date.now() - 86400000 * 3).toISOString(),
          totalMarks: 100,
          totalStudents: 35,
          submitted: 35,
          pending: 0,
          status: "completed",
        },
      ];

      setAssignments(mockAssignments);
    } catch (error) {
      console.error("Error loading assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (assignment.status === "completed") {
      return { label: "Completed", color: "bg-gray-500", variant: "default" };
    }

    if (diffDays < 0) {
      return { label: "Overdue", color: "bg-red-500", variant: "destructive" };
    }

    if (diffDays === 0) {
      return {
        label: "Due Today",
        color: "bg-orange-500 animate-pulse",
        variant: "default",
      };
    }

    if (diffDays === 1) {
      return {
        label: "Due Tomorrow",
        color: "bg-yellow-500",
        variant: "default",
      };
    }

    return {
      label: `${diffDays} days left`,
      color: "bg-blue-500",
      variant: "default",
    };
  };

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true;
    if (filter === "active") return assignment.status === "active";
    if (filter === "submitted")
      return assignment.submitted === assignment.totalStudents;
    if (filter === "overdue") return assignment.status === "overdue";
    return true;
  });

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage student assignments
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({assignments.length})
        </Button>
        <Button
          variant={filter === "active" ? "default" : "outline"}
          onClick={() => setFilter("active")}
        >
          Active ({assignments.filter((a) => a.status === "active").length})
        </Button>
        <Button
          variant={filter === "overdue" ? "default" : "outline"}
          onClick={() => setFilter("overdue")}
        >
          Overdue ({assignments.filter((a) => a.status === "overdue").length})
        </Button>
        <Button
          variant={filter === "submitted" ? "default" : "outline"}
          onClick={() => setFilter("submitted")}
        >
          Fully Submitted (
          {assignments.filter((a) => a.submitted === a.totalStudents).length})
        </Button>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment, index) => {
          const statusInfo = getStatusInfo(assignment);
          const submissionRate = Math.round(
            (assignment.submitted / assignment.totalStudents) * 100
          );

          return (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
                <div className="flex items-start justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                            {assignment.title}
                          </h3>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {assignment.className}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {assignment.description}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground ml-16">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Due:{" "}
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{assignment.totalMarks} marks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{assignment.totalStudents} students</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Stats */}
                  <div className="text-right flex-shrink-0">
                    <div className="mb-3">
                      <p className="text-3xl font-bold text-primary">
                        {submissionRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-green-600 font-medium">
                        {assignment.submitted} submitted
                      </p>
                      <p className="text-orange-600 font-medium">
                        {assignment.pending} pending
                      </p>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 mb-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
                      style={{ width: `${submissionRate}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Submissions
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground font-medium">
            No assignments found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {filter === "all"
              ? "Create your first assignment"
              : `No ${filter} assignments`}
          </p>
        </div>
      )}
    </div>
  );
}
