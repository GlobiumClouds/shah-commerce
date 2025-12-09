'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Building2, Users, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { execute } = useApi();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard data from multiple endpoints
      const [branchesRes, eventsRes, expensesRes, subscriptionsRes, salariesRes] = await Promise.all([
        execute({ url: API_ENDPOINTS.SUPER_ADMIN.BRANCHES.LIST }),
        execute({ url: API_ENDPOINTS.SUPER_ADMIN.EVENTS.LIST }),
        execute({ url: `${API_ENDPOINTS.SUPER_ADMIN.EXPENSES.LIST}?limit=10` }),
        execute({ url: API_ENDPOINTS.SUPER_ADMIN.SUBSCRIPTIONS.LIST }),
        execute({ url: API_ENDPOINTS.SUPER_ADMIN.SALARIES.LIST }),
      ]);
      
      console.log('Branches Response:', branchesRes);
      console.log('Events Response:', eventsRes);
      console.log('Expenses Response:', expensesRes);
      
      setDashboardData({
        branches: branchesRes?.data?.branches || [],
        events: eventsRes?.data?.events || [],
        expenses: expensesRes?.data?.expenses || [],
        subscriptions: subscriptionsRes?.data?.subscriptions || [],
        salaries: salariesRes?.data?.salaries || [],
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setDashboardData({
        branches: [],
        events: [],
        expenses: [],
        subscriptions: [],
        salaries: [],
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = {
    totalBranches: dashboardData?.branches?.length || 0,
    activeBranches: dashboardData?.branches?.filter(b => b.status === 'active').length || 0,
    totalEvents: dashboardData?.events?.length || 0,
    upcomingEvents: dashboardData?.events?.filter(e => new Date(e.startDate) > new Date()).length || 0,
    totalExpenses: dashboardData?.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0,
    activeSubscriptions: dashboardData?.subscriptions?.filter(s => s.status === 'active').length || 0,
  };

  // Prepare expense chart data
  const expenseData = dashboardData?.expenses
    ?.slice(0, 6)
    .map(exp => ({
      name: exp.category || exp.type || 'Other',
      amount: exp.amount,
    })) || [];

  // Prepare branch distribution data
  const branchData = dashboardData?.branches
    ?.slice(0, 5)
    .map(branch => ({
      name: branch.name,
      users: 1,
    })) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening across all branches.
          </p>
        </div>
        <Button onClick={loadDashboardData}>
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBranches}</div>
            <p className="text-xs opacity-80">{stats.activeBranches} active</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-xs opacity-80">{stats.upcomingEvents} upcoming</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs opacity-80">Currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalExpenses.toLocaleString()}</div>
            <p className="text-xs opacity-80">YTD expenses</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-pink-500 to-pink-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Data Health</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs opacity-80">All systems normal</p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs opacity-80">All clear</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Branch User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={branchData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="users"
                >
                  {branchData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData?.expenses?.slice(0, 5).map((expense) => (
                  <tr key={expense._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">{expense.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium">${expense.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        expense.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {expense.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20" asChild>
              <a href="/super-admin/branches">
                <Building2 className="mr-2 h-4 w-4" />
                Manage Branches
              </a>
            </Button>
            <Button variant="outline" className="h-20" asChild>
              <a href="/super-admin/events">
                <Calendar className="mr-2 h-4 w-4" />
                View Events
              </a>
            </Button>
            <Button variant="outline" className="h-20" asChild>
              <a href="/super-admin/expenses">
                <DollarSign className="mr-2 h-4 w-4" />
                Track Expenses
              </a>
            </Button>
            <Button variant="outline" className="h-20" asChild>
              <a href="/super-admin/reports">
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Reports
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
