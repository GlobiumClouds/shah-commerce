'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Dropdown from '@/components/ui/dropdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

const SuperAdminBranchWiseStudents = ({ selectedBranch = 'all', branchPerformance = [] }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChartBranch, setSelectedChartBranch] = useState('all');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchBranchWiseStudents();
  }, [selectedChartBranch]);

  const fetchBranchWiseStudents = async () => {
    try {
      setLoading(true);
      const params = {
        branch: selectedChartBranch
      };

      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.CHARTS.BRANCH_WISE_STUDENTS, { params });

      if (response.success && response.data) {
        setData(response.data);
      } else {
        // Fallback mock data
        setData(generateMockData());
      }
    } catch (err) {
      console.error('Failed to fetch branch-wise students:', err);
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const branches = ['Main Campus', 'North Branch', 'South Branch', 'East Branch', 'West Branch'];
    return branches.map(branch => ({
      branch: branch,
      students: Math.floor(Math.random() * 200) + 50,
      code: branch.split(' ')[0].toUpperCase()
    }));
  };

  const totalStudents = data.reduce((sum, item) => sum + (item.students || 0), 0);

  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            Branch-wise Student Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="hover:shadow-lg transition-shadow relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* {isHovered && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
          <span className="text-black text-lg font-semibold">Test White</span>
        </div>
      )} */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            Branch-wise Student Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            <Dropdown
              value={selectedChartBranch}
              onChange={(e) => setSelectedChartBranch(e.target.value)}
              options={[
                { value: 'all', label: 'All Branches' },
                ...branchPerformance.map(branch => ({
                  value: branch.id,
                  label: branch.name
                }))
              ]}
              placeholder="Select Branch"
              className="w-32"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Students: {totalStudents} • {selectedChartBranch === 'all' ? 'All Branches' : `Branch: ${selectedChartBranch}`}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="branch"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
              formatter={(value, name) => [
                `${value} students`,
                'Students'
              ]}
              labelFormatter={(label) => `Branch: ${label}`}
            />
            <Bar
              dataKey="students"
              fill="#8B5CF6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SuperAdminBranchWiseStudents;
