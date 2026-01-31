import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ChevronRight, ChevronDown, Users, BookOpen, GraduationCap } from 'lucide-react';

const ClassHierarchy = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const { apiCall } = useApi();

  const fetchHierarchy = async () => {
    try {
      // Fetch sessions, faculties, and classes
      const [sessionsRes, facultiesRes, classesRes] = await Promise.all([
        apiCall('/super-admin/sessions'),
        apiCall('/super-admin/faculties'),
        apiCall('/branch-admin/classes')
      ]);

      if (sessionsRes.success && facultiesRes.success && classesRes.success) {
        // Build hierarchy: Session > Faculty > Classes
        const sessions = sessionsRes.data;
        const faculties = facultiesRes.data;
        const classes = classesRes.data;

        const hierarchyData = sessions.map(session => ({
          ...session,
          type: 'session',
          children: faculties.map(faculty => ({
            ...faculty,
            type: 'faculty',
            children: classes
              .filter(cls => cls.sessionId === session._id && cls.facultyId === faculty._id)
              .map(cls => ({
                ...cls,
                type: 'class',
                children: [] // Classes don't have children in this hierarchy
              }))
          })).filter(faculty => faculty.children.length > 0) // Only show faculties with classes
        })).filter(session => session.children.length > 0); // Only show sessions with faculties

        setHierarchy(hierarchyData);
      }
    } catch (error) {
      console.error('Error fetching hierarchy:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  const toggleExpanded = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node, level = 0) => {
    const isExpanded = expandedNodes.has(node._id);
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = level * 24;

    const getIcon = () => {
      switch (node.type) {
        case 'session':
          return <GraduationCap className="h-4 w-4" />;
        case 'faculty':
          return <BookOpen className="h-4 w-4" />;
        case 'class':
          return <Users className="h-4 w-4" />;
        default:
          return null;
      }
    };

    const getBadgeColor = () => {
      switch (node.type) {
        case 'session':
          return 'bg-blue-100 text-blue-800';
        case 'faculty':
          return 'bg-green-100 text-green-800';
        case 'class':
          return 'bg-purple-100 text-purple-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div key={node._id}>
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-50 cursor-pointer border-l-2 ${
            node.type === 'session' ? 'border-blue-200' :
            node.type === 'faculty' ? 'border-green-200' : 'border-purple-200'
          }`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          onClick={() => hasChildren && toggleExpanded(node._id)}
        >
          {hasChildren && (
            <div className="mr-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-6" />}

          <div className="flex items-center gap-2 flex-1">
            {getIcon()}
            <span className="font-medium">{node.name}</span>
            <Badge className={`text-xs ${getBadgeColor()}`}>
              {node.type === 'session' ? `Session ${node.sessionYear}` :
               node.type === 'faculty' ? 'Faculty' : 'Class'}
            </Badge>
          </div>

          {node.type === 'class' && (
            <div className="text-sm text-gray-500">
              {node.sections?.length || 0} sections
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading academic hierarchy...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Academic Hierarchy</h1>
        <p className="text-gray-600">Session → Faculty → Classes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {hierarchy.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No academic structure found. Create sessions and faculties first.
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {hierarchy.map(node => renderNode(node))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{hierarchy.length}</p>
                <p className="text-sm text-gray-600">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {hierarchy.reduce((sum, session) => sum + session.children.length, 0)}
                </p>
                <p className="text-sm text-gray-600">Faculties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {hierarchy.reduce((sum, session) =>
                    sum + session.children.reduce((facultySum, faculty) =>
                      facultySum + faculty.children.length, 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Classes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassHierarchy;
