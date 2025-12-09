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
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const ROLE_MENUS = {
  super_admin: [
    {
      category: 'Management',
      items: [
        { name: 'Dashboard', path: '/super-admin', icon: LayoutDashboard },
        { name: 'Branches', path: '/super-admin/branches', icon: FolderOpen },
        { name: 'Events', path: '/super-admin/events', icon: Calendar },
        { name: 'Expenses', path: '/super-admin/expenses', icon: Banknote },
        { name: 'Salaries', path: '/super-admin/salaries', icon: DollarSign },
        { name: 'Reports', path: '/super-admin/reports', icon: BarChart3 },
      ],
    },
    {
      category: 'Settings',
      items: [
        { name: 'Admin Users', path: '/super-admin/admins', icon: Briefcase },
        { name: 'Subscriptions', path: '/super-admin/subscriptions', icon: FileText },
        { name: 'Settings', path: '/super-admin/settings', icon: Settings },
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
