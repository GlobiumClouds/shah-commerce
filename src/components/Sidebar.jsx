'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  School,
  Clock,
  FileText,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  FolderOpen,
  Calendar,
  Banknote,
  BarChart3,
  Briefcase,
  Shield,
  Receipt,
  Wallet,
  TrendingUp,
  Cog,
  Activity,
  Bell,
  UserPlus,
  UserCog,
  GraduationCap,
  Keyboard,
  QrCode,
  UserCheck,
  LayoutDashboardIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const ROLE_MENUS = {
  super_admin: [
    {
      category: 'Overview',
      items: [
        { name: 'Dashboard', path: '/super-admin', icon: LayoutDashboard },
      ],
    },
    {
      category: 'Branch Management',
      items: [
        { name: 'All Branches', path: '/super-admin/branch-management/branches', icon: FolderOpen },
      ],
    },
    {
      category: 'Academic',
      items: [
        { name: 'Departments', path: '/super-admin/academic/departments', icon: Briefcase },
        { name: 'Classes', path: '/super-admin/academic/classes', icon: School },
        { name: 'Levels', path: '/super-admin/academic/levels', icon: GraduationCap },
        { name: 'Subjects', path: '/super-admin/academic/subjects', icon: BookOpen },
        { name: 'Syllabus', path: '/super-admin/academic/syllabus', icon: FileText },
      ],
    },
    {
      category: 'User Management',
      items: [
        { name: 'Administrators', path: '/super-admin/user-management/administrators', icon: UserCog },
      ],
    },
    {
      category: 'Student Management',
      items: [
        { name: 'All Students', path: '/super-admin/student-management/students', icon: Users },
        { name: 'Admissions', path: '/super-admin/student-management/admissions', icon: UserPlus },
      ],
    },
    {
      category: 'Teacher Management',
      items: [
        { name: 'All Teachers', path: '/super-admin/teacher-management/teachers', icon: Users },
      ],
    },
    {
      category: 'Fee Management',
      items: [
        { name: 'Fee Templates', path: '/super-admin/fee-management/templates', icon: Receipt },
        { name: 'Branch Fees', path: '/super-admin/fee-management/branch-fees', icon: Wallet },
        { name: 'Fee Reports', path: '/super-admin/fee-management/reports', icon: FileText },
      ],
    },
    {
      category: 'Salary Management',
      items: [
        { name: 'Salary Templates', path: '/super-admin/salary-management/salary-templates', icon: DollarSign },
        { name: 'Payroll Processing', path: '/super-admin/salary-management/payroll', icon: Banknote },
        { name: 'Salary Reports', path: '/super-admin/salary-management/reports', icon: BarChart3 },
      ],
    },
    {
      category: 'Attendance Management',
      items: [
        { name: 'Student Attendance', path: '/super-admin/attendance-management/student', icon: GraduationCap },
        { name: 'Teacher Attendance', path: '/super-admin/attendance-management/teacher', icon: LayoutDashboardIcon },
        { name: 'Manual Entry', path: '/super-admin/attendance-management/manual-entry', icon: Keyboard },
        { name: 'QR Code Scanner', path: '/super-admin/attendance-management/qr-scanner', icon: QrCode },
        { name: 'Staff Attendance', path: '/super-admin/attendance-management/staff', icon: UserCheck },
      ],
    },
    {
      category: 'Event Management',
      items: [
        { name: 'Calendar View', path: '/super-admin/event-management/calendar', icon: Calendar },
        { name: 'All Events', path: '/super-admin/event-management/events', icon: Calendar },
      ],
    },
    {
      category: 'System Analytics',
      items: [
        { name: 'Financial Reports', path: '/super-admin/analytics/financial', icon: TrendingUp },
        { name: 'Academic Reports', path: '/super-admin/analytics/academic', icon: BookOpen },
        { name: 'Operational Reports', path: '/super-admin/analytics/operational', icon: BarChart3 },
      ],
    },
    {
      category: 'Configuration',
      items: [
        { name: 'General Settings', path: '/super-admin/configuration/general', icon: Settings },
        { name: 'Academic Settings', path: '/super-admin/configuration/academic-settings', icon: School },
        { name: 'Security Settings', path: '/super-admin/configuration/security', icon: Shield },
        { name: 'Notifications', path: '/super-admin/configuration/notifications', icon: Bell },
      ],
    },
    {
      category: 'Audit & Logs',
      items: [
        { name: 'Activity Logs', path: '/super-admin/audit-logs/activity', icon: Activity },
        { name: 'System Logs', path: '/super-admin/audit-logs/system', icon: Cog },
        { name: 'Login History', path: '/super-admin/audit-logs/login-history', icon: Users },
      ],
    },
  ],

  branch_admin: [
    {
      category: 'Dashboard',
      items: [
        { name: 'Dashboard', path: '/branch-admin', icon: LayoutDashboard },
      ],
    },
    {
      category: 'Management',
      items: [
        { name: 'Teachers', path: '/branch-admin/teachers', icon: Users },
        { name: 'Students', path: '/branch-admin/students', icon: BookOpen },
        { name: 'Classes', path: '/branch-admin/classes', icon: School },
        { name: 'Attendance', path: '/branch-admin/attendance', icon: Clock },
        { name: 'Exams', path: '/branch-admin/exams', icon: FileText },
        { name: 'Finance', path: '/branch-admin/finance', icon: DollarSign },
        { name: 'Events', path: '/branch-admin/events', icon: Calendar },
      ],
    },
    {
      category: 'Settings',
      items: [
        { name: 'Branch Settings', path: '/branch-admin/settings', icon: Settings },
      ],
    },
  ],

  teacher: [
    {
      category: 'Dashboard',
      items: [
        { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
      ],
    },
    {
      category: 'Classes',
      items: [
        { name: 'My Classes', path: '/teacher/classes', icon: School },
        { name: 'Attendance', path: '/teacher/attendance', icon: Clock },
        { name: 'Exams', path: '/teacher/exams', icon: FileText },
        { name: 'Results', path: '/teacher/results', icon: BarChart3 },
      ],
    },
    {
      category: 'Account',
      items: [
        { name: 'Profile', path: '/teacher/profile', icon: Users },
        { name: 'Settings', path: '/teacher/settings', icon: Settings },
      ],
    },
  ],

  parent: [
    {
      category: 'Dashboard',
      items: [
        { name: 'Dashboard', path: '/parent', icon: LayoutDashboard },
      ],
    },
    {
      category: 'Student Info',
      items: [
        { name: 'My Children', path: '/parent/children', icon: Users },
        { name: 'Attendance', path: '/parent/attendance', icon: Clock },
        { name: 'Results', path: '/parent/results', icon: BarChart3 },
        { name: 'Fee Status', path: '/parent/fees', icon: DollarSign },
      ],
    },
    {
      category: 'Account',
      items: [
        { name: 'Profile', path: '/parent/profile', icon: Users },
        { name: 'Messages', path: '/parent/messages', icon: FileText },
        { name: 'Settings', path: '/parent/settings', icon: Settings },
      ],
    },
  ],

  student: [
    {
      category: 'Dashboard',
      items: [
        { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
      ],
    },
    {
      category: 'Academics',
      items: [
        { name: 'My Classes', path: '/student/classes', icon: School },
        { name: 'Attendance', path: '/student/attendance', icon: Clock },
        { name: 'Exams', path: '/student/exams', icon: FileText },
        { name: 'Results', path: '/student/results', icon: BarChart3 },
      ],
    },
    {
      category: 'Account',
      items: [
        { name: 'Profile', path: '/student/profile', icon: Users },
        { name: 'Messages', path: '/student/messages', icon: FileText },
        { name: 'Settings', path: '/student/settings', icon: Settings },
      ],
    },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Don't render sidebar if user is not authenticated
  if (!user) {
    return null;
  }

  const userRole = user.role || 'student';
  const menuGroups = ROLE_MENUS[userRole] || ROLE_MENUS.student;

  const handleLogout = async () => {
    await logout();
  };

  // Determine sidebar classes
  const sidebarClasses = cn(
    'bg-white border-r border-gray-200 h-screen overflow-y-auto transition-all duration-300 flex flex-col',
    isOpen ? 'w-64' : 'w-20',
    'fixed md:sticky top-0 z-40 md:z-0'
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-50 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Ease Academy</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          sidebarClasses,
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Header */}
        <div className={cn('border-b border-gray-200 flex items-center justify-between', isOpen ? 'p-6' : 'p-3')}>
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ease</h1>
              <p className="text-xs text-gray-500">Academy</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="hidden md:flex"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info */}
        <div className={cn('border-b border-gray-200', isOpen ? 'p-4' : 'p-2')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold shrink-0">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            {isOpen && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user.role?.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex} className={isOpen ? 'px-3 py-4' : 'px-2 py-4'}>
              {isOpen && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                  {group.category}
                </h3>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1',
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                    title={!isOpen ? item.name : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {isOpen && <span className="text-sm">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer - Logout */}
        <div className={cn('border-t border-gray-200', isOpen ? 'p-4' : 'p-2')}>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={cn('w-full justify-start text-gray-700', isOpen ? '' : 'px-2')}
          >
            <LogOut className="h-5 w-5" />
            {isOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
