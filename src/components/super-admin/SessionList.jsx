"use client";
import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { API_ENDPOINTS } from '../../constants/api-endpoints';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import SessionForm from './SessionForm';

const SessionList = ({ sessions: propSessions, onEdit, onDelete, loading: propLoading, showHeader = true }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(!propSessions && showHeader && !onEdit && !onDelete);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const { execute: apiCall } = useApi();

  // Use props if provided or if callbacks are provided (controlled component), otherwise fetch data
  useEffect(() => {
    if (propSessions !== undefined || onEdit || onDelete) {
      setSessions(propSessions || []);
      setLoading(false);
    } else if (showHeader) {
      fetchSessions();
    }
  }, [propSessions, showHeader, onEdit, onDelete]);

  const fetchSessions = async () => {
    try {
      console.log('Fetching sessions from frontend...');
      const response = await apiCall(API_ENDPOINTS.SUPER_ADMIN.SESSIONS.LIST);
      console.log('Frontend response:', response);
      if (response.success) {
        console.log('Setting sessions data:', response.data);
        setSessions(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Handle authentication errors
      if (error.status === 401 || error.message?.includes('Authentication')) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return;
      }
      // For other errors, you could set an error state to display to user
      // setError(error.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSession(null);
    setShowForm(true);
  };

  const handleEdit = (session) => {
    if (onEdit) {
      onEdit(session);
    } else {
      setEditingSession(session);
      setShowForm(true);
    }
  };

  const handleDelete = async (sessionId) => {
    if (onDelete) {
      onDelete(sessionId);
    } else {
      if (!confirm('Are you sure you want to delete this session?')) return;

      try {
        const deleteEndpoint = API_ENDPOINTS.SUPER_ADMIN.SESSIONS.DELETE.replace(':id', sessionId);
        const response = await apiCall(deleteEndpoint, 'DELETE');
        if (response.success) {
          setSessions(sessions.filter(s => s._id !== sessionId));
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
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
      {/* <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Academic Sessions</h1>
          <p className="text-gray-600">Manage academic sessions (2025, 2026, etc.)</p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Session
        </Button>
      </div> */}

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
