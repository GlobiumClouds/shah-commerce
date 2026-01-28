'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Dropdown from '@/components/ui/dropdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

const SuperAdminClassWiseStudents = ({ selectedBranch = 'all' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    fetchClassWiseStudents();
  }, [selectedBranch, selectedFilter]);

  const fetchClassWiseStudents = async () => {
    try {
      setLoading(true);
      const params = {
        branch: selectedBranch,
        filter: selectedFilter
      };

      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.CHARTS.CLASS_WISE_STUDENTS, { params });

      if (response.success && response.data) {
        setData(response.data);
      } else {
        // Fallback mock data
        setData(generateMockData());
      }
    } catch (err) {
      console.error('Failed to fetch class-wise students:', err);
      setData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'];
    return classes.map(className => ({
      class: className,
      students: Math.floor(Math.random() * 40) + 20,
      branch: selectedBranch === 'all' ? 'Branch A' : selectedBranch
    }));
  };

  const totalStudents = data.reduce((sum, item) => sum + (item.students || 0), 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Class-wise Student Distribution
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Class-wise Student Distribution
          </CardTitle>
          <div className="flex items-center gap-2">
            <Dropdown
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Classes' },
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' }
              ]}
              placeholder="Select Filter"
              className="w-32"
            />
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Total Students: {totalStudents} • {selectedBranch === 'all' ? 'All Branches' : `Branch: ${selectedBranch}`}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="class"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
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
              labelFormatter={(label) => `Class: ${label}`}
            />
            <Bar
              dataKey="students"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SuperAdminClassWiseStudents;
