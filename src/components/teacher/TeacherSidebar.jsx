"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  ClipboardCheck,
  FileText,
  BarChart3,
  UserCircle,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/teacher",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
    },
    {
      title: "My Classes",
      icon: BookOpen,
      href: "/teacher/classes",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-500/10 to-green-600/10",
    },
    {
      title: "Students",
      icon: Users,
      href: "/teacher/students",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-500/10 to-purple-600/10",
    },
    {
      title: "Attendance",
      icon: ClipboardCheck,
      href: "/teacher/attendance",
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-500/10 to-orange-600/10",
    },
    {
      title: "Exams",
      icon: Calendar,
      href: "/teacher/exams",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-500/10 to-red-600/10",
    },
    {
      title: "Assignments",
      icon: FileText,
      href: "/teacher/assignments",
      gradient: "from-pink-500 to-pink-600",
      bgGradient: "from-pink-500/10 to-pink-600/10",
    },
    {
      title: "Results",
      icon: BarChart3,
      href: "/teacher/results",
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-500/10 to-indigo-600/10",
    },
    {
      title: "Profile",
      icon: UserCircle,
      href: "/teacher/profile",
      gradient: "from-cyan-500 to-cyan-600",
      bgGradient: "from-cyan-500/10 to-cyan-600/10",
    },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      router.push("/login");
    }
  };

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="h-screen w-72 bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 flex flex-col sticky top-0 shadow-xl"
    >
      {/* Header with Logo */}
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Ease Academy
            </h1>
            <p className="text-xs text-muted-foreground">Teacher Portal</p>
          </div>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-border/30">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shadow-md">
            {user?.fullName?.charAt(0) || "T"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">
              {user?.fullName || "Teacher"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Teacher Account
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>
        {menuItems.map((item, index) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <motion.button
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => router.push(item.href)}
              className={`
                w-full group relative overflow-hidden
                ${
                  isActive
                    ? "bg-gradient-to-r " +
                      item.gradient +
                      " text-white shadow-lg shadow-primary/20"
                    : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                }
                rounded-xl transition-all duration-300
              `}
            >
              <div className="flex items-center gap-3 px-4 py-3.5 relative z-10">
                <div
                  className={`
                  p-2 rounded-lg transition-all duration-300
                  ${
                    isActive
                      ? "bg-white/20 shadow-inner"
                      : "bg-gradient-to-br " + item.bgGradient
                  }
                `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                </div>
                <span className="flex-1 text-left font-medium text-sm">
                  {item.title}
                </span>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 rounded-full bg-white shadow-lg"
                  />
                )}
              </div>

              {/* Hover gradient effect */}
              {!isActive && (
                <div
                  className={`
                  absolute inset-0 bg-gradient-to-r ${item.bgGradient} 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300
                `}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => router.push("/teacher/settings")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-all duration-300 text-muted-foreground hover:text-foreground group"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500/10 to-gray-600/10 group-hover:from-gray-500/20 group-hover:to-gray-600/20 transition-all">
            <Settings className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left font-medium text-sm">Settings</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-red-500/10 to-red-600/10 hover:from-red-500/20 hover:to-red-600/20 transition-all duration-300 text-red-600 hover:text-red-700 group border border-red-500/20"
        >
          <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-all">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="flex-1 text-left font-medium text-sm">Logout</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
