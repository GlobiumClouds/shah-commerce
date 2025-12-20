"use client";

import TeacherSidebar from "@/components/teacher/TeacherSidebar";

export default function TeacherLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
