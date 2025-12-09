import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ease Academy</h1>
                <p className="text-sm text-gray-500">School Management System</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Ease Academy
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            A comprehensive school management system with multi-branch support,
            role-based access control, and modern features.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              👨‍🎓
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Student Management
            </h3>
            <p className="text-gray-600">
              Complete student information system with enrollment, tracking, and progress monitoring.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              👨‍🏫
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Teacher Portal
            </h3>
            <p className="text-gray-600">
              Manage classes, mark attendance, create assignments, and grade exams efficiently.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              👪
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Parent Portal
            </h3>
            <p className="text-gray-600">
              Track your child's attendance, grades, and communicate with teachers.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              ✅
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Attendance System
            </h3>
            <p className="text-gray-600">
              Digital attendance tracking with real-time updates and reports.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📝
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Exam Management
            </h3>
            <p className="text-gray-600">
              Schedule exams, manage results, and generate comprehensive reports.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-2xl">
              💰
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Fee Management
            </h3>
            <p className="text-gray-600">
              Track payments, generate invoices, and manage financial records.
            </p>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Built for Modern Schools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-gray-600">User Roles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">20+</div>
              <div className="text-gray-600">Features</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Secure</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">24/7</div>
              <div className="text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600">
            © 2025 Ease Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
