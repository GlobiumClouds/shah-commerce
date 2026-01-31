"use client";
import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';

const FacultyForm = ({ faculty, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { execute: apiCall } = useApi();

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name || '',
        code: faculty.code || '',
        description: faculty.description || ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: ''
      });
    }
  }, [faculty]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate code when name changes for new faculties
    if (field === 'name' && !faculty) {
      const code = value.toUpperCase().replace(/\s+/g, '-').substring(0, 10);
      setFormData(prev => ({
        ...prev,
        code: code
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = faculty ? `/super-admin/faculties/${faculty._id}` : '/super-admin/faculties';
      const method = faculty ? 'PUT' : 'POST';

      const response = await apiCall(url, method, formData);

      if (response.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{faculty ? 'Edit Faculty' : 'Create New Faculty'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Faculty Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Pre-Engineering"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Faculty Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="e.g., PRE-ENG"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for this academic faculty"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (faculty ? 'Update Faculty' : 'Create Faculty')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FacultyForm;
