"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Calendar, Users, BookOpen, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function SessionsPage() {
  const { user } = useAuth();
  const { execute: apiCall, loading } = useApi();
  const [sessions, setSessions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    sessionYear: new Date().getFullYear(),
    description: "",
    isActive: true
  });

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await apiCall(API_ENDPOINTS.SUPER_ADMIN.SESSIONS.LIST, "GET");
      if (response.success) {
        setSessions(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to fetch sessions");
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      sessionYear: new Date().getFullYear(),
      description: "",
      isActive: true
    });
    setEditingSession(null);
  };

  // Handle create/edit session
  const handleSaveSession = async () => {
    try {
      // Validation
      if (!formData.name.trim() || !formData.code.trim()) {
        toast.error("Name and code are required");
        return;
      }

      const method = editingSession ? "PUT" : "POST";
      const url = editingSession
        ? API_ENDPOINTS.SUPER_ADMIN.SESSIONS.UPDATE.replace(':id', editingSession._id)
        : API_ENDPOINTS.SUPER_ADMIN.SESSIONS.CREATE;

      const response = await apiCall(url, method, formData);

      if (response.success) {
        toast.success(
          editingSession
            ? "Session updated successfully"
            : "Session created successfully"
        );
        setShowForm(false);
        resetForm();
        fetchSessions();
      } else {
        toast.error(response.message || "Failed to save session");
      }
    } catch (error) {
      console.error("Error saving session:", error);
      toast.error("Failed to save session");
    }
  };

  // Handle delete session
  const handleDeleteSession = async (sessionId) => {
    if (!confirm("Are you sure you want to delete this session?")) return;

    try {
      const deleteUrl = API_ENDPOINTS.SUPER_ADMIN.SESSIONS.DELETE.replace(':id', sessionId);
      const response = await apiCall(deleteUrl, "DELETE");

      if (response.success) {
        toast.success("Session deleted successfully");
        fetchSessions();
      } else {
        toast.error(response.message || "Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Failed to delete session");
    }
  };

  // Handle edit session
  const handleEditSession = (session) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      code: session.code,
      sessionYear: session.sessionYear,
      description: session.description || "",
      isActive: session.isActive
    });
    setShowForm(true);
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    resetForm();
  };

  if (showForm) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleCancelForm}
              className="mb-4"
            >
              ← Back to Sessions
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingSession ? "Edit Session" : "Create New Session"}
            </h1>
            <p className="text-gray-600 mt-1">
              {editingSession
                ? "Update session details"
                : "Add a new academic session (e.g., 2025, 2026)"}
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Session Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g., 2025 Academic Year"
                    />
                  </div>
                  <div>
                    <Label htmlFor="code">Session Code *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => handleInputChange("code", e.target.value)}
                      placeholder="e.g., SESS-2025"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="sessionYear">Session Year</Label>
                  <Input
                    id="sessionYear"
                    type="number"
                    value={formData.sessionYear}
                    onChange={(e) => handleInputChange("sessionYear", parseInt(e.target.value))}
                    min="2020"
                    max="2030"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Optional description for the session"
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Active Session</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={handleCancelForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSession} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingSession ? "Update Session" : "Create Session"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academic Sessions</h1>
          <p className="text-gray-600 mt-1">
            Manage academic sessions like 2025, 2026 for your institution
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.filter(s => s.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Session</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0
                ? Math.max(...sessions.map(s => s.sessionYear))
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div className="space-y-6">
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
                      onClick={() => handleEditSession(session)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSession(session._id)}
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
    </div>
  );
}
