"use client";
import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import SessionForm from './SessionForm';

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const { apiCall, loading: apiLoading } = useApi();

  const fetchSessions = async () => {
    try {
      const response = await apiCall('/super-admin/sessions');
      if (response.success) {
        setSessions(response.data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreate = () => {
    setEditingSession(null);
    setShowForm(true);
  };

  const handleEdit = (session) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await apiCall(`/super-admin/sessions/${sessionId}`, 'DELETE');
      if (response.success) {
        setSessions(sessions.filter(s => s._id !== sessionId));
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchSessions();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingSession(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Academic Sessions</h1>
          <p className="text-gray-600">Manage academic sessions (2025, 2026, etc.)</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Session
        </Button>
      </div>

      {showForm && (
        <SessionForm
          session={editingSession}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => (
          <Card key={session._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{session.name}</CardTitle>
                  <p className="text-sm text-gray-600">{session.code}</p>
                </div>
                <Badge variant={session.isActive ? 'default' : 'secondary'}>
                  {session.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Session Year</p>
                  <p className="text-lg font-bold text-blue-600">{session.sessionYear}</p>
                </div>

                {session.description && (
                  <div>
                    <p className="text-sm font-medium">Description</p>
                    <p className="text-sm text-gray-600">{session.description}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(session)}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(session._id)}
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

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No sessions found. Create your first academic session.</p>
        </div>
      )}
    </div>
  );
};

export default SessionList;
