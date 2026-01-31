"use client";
import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';

const SessionForm = ({ session, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    sessionYear: new Date().getFullYear(),
    isActive: true,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const { execute: apiCall } = useApi();

  useEffect(() => {
    if (session) {
      setFormData({
        name: session.name || '',
        code: session.code || '',
        sessionYear: session.sessionYear || new Date().getFullYear(),
        isActive: session.isActive !== undefined ? session.isActive : true,
        description: session.description || ''
      });
    } else {
      // Auto-generate name and code for new sessions
      const year = new Date().getFullYear();
      setFormData({
        name: `Session ${year}`,
        code: `SESS-${year}`,
        sessionYear: year,
        isActive: true,
        description: ''
      });
    }
  }, [session]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate code when name changes for new sessions
    if (field === 'name' && !session) {
      const code = value.toUpperCase().replace(/\s+/g, '-').substring(0, 10);
      setFormData(prev => ({
        ...prev,
        code: `SESS-${code}`
      }));
    }

    // Auto-generate name when sessionYear changes for new sessions
    if (field === 'sessionYear' && !session) {
      setFormData(prev => ({
        ...prev,
        name: `Session ${value}`
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = session ? `/super-admin/sessions/${session._id}` : '/super-admin/sessions';
      const method = session ? 'PUT' : 'POST';

      const response = await apiCall(url, method, formData);

      if (response.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{session ? 'Edit Session' : 'Create New Session'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Session Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Session 2025"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Session Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="e.g., SESS-2025"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionYear">Session Year *</Label>
              <Input
                id="sessionYear"
                type="number"
                min="2020"
                max="2030"
                value={formData.sessionYear}
                onChange={(e) => handleInputChange('sessionYear', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
                <Label htmlFor="isActive" className="text-sm">
                  Active Session
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description for this academic session"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (session ? 'Update Session' : 'Create Session')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SessionForm;
