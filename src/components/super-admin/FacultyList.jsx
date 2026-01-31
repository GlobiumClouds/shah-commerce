"use client";
import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FacultyForm from './FacultyForm';

const FacultyList = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const { execute: apiCall, loading: apiLoading } = useApi();

  const fetchFaculties = async () => {
    try {
      const response = await apiCall('/super-admin/faculties');
      if (response.success) {
        setFaculties(response.data);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleCreate = () => {
    setEditingFaculty(null);
    setShowForm(true);
  };

  const handleEdit = (faculty) => {
    setEditingFaculty(faculty);
    setShowForm(true);
  };

  const handleDelete = async (facultyId) => {
    if (!confirm('Are you sure you want to delete this faculty?')) return;

    try {
      const response = await apiCall(`/super-admin/faculties/${facultyId}`, 'DELETE');
      if (response.success) {
        setFaculties(faculties.filter(f => f._id !== facultyId));
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchFaculties();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFaculty(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading faculties...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Academic Faculties</h1>
          <p className="text-gray-600">Manage academic faculties (pre-engineering, pre-medical, etc.)</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Faculty
        </Button>
      </div>

      {showForm && (
        <FacultyForm
          faculty={editingFaculty}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faculties.map((faculty) => (
          <Card key={faculty._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{faculty.name}</CardTitle>
              <p className="text-sm text-gray-600">{faculty.code}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faculty.description && (
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-gray-600">{faculty.description}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(faculty)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(faculty._id)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {faculties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No faculties found. Create your first academic faculty.</p>
        </div>
      )}
    </div>
  );
};

export default FacultyList;
