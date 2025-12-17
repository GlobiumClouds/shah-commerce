'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { CheckCircle, Eye, User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Modal from '@/components/ui/modal';

export default function PendingParentsPage() {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const { execute } = useApi();

  useEffect(() => {
    loadPendingParents();
  }, []);

  const loadPendingParents = async () => {
    try {
      setLoading(true);
      const response = await execute({ url: API_ENDPOINTS.BRANCH_ADMIN.PENDING_PARENTS });
      if (response?.success) {
        setParents(response.data.parents || []);
      }
    } catch (error) {
      console.error('Failed to load pending parents:', error);
      toast.error('Failed to load pending parents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (parentId) => {
    try {
      setApproving(parentId);
      const response = await execute({
        url: API_ENDPOINTS.BRANCH_ADMIN.APPROVE_PARENT.replace(':id', parentId),
        method: 'POST'
      });

      if (response?.success) {
        toast.success('Parent approved successfully');
        setParents(parents.filter(p => p._id !== parentId));
      } else {
        toast.error(response?.error || 'Failed to approve parent');
      }
    } catch (error) {
      console.error('Failed to approve parent:', error);
      toast.error('Failed to approve parent');
    } finally {
      setApproving(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Pending Parent Approvals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve parent accounts for your branch before they can access the system
          </p>
        </div>
        <Button onClick={loadPendingParents}>
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Parents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{parents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Parents List */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Parents</CardTitle>
        </CardHeader>
        <CardContent>
          {parents.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No pending parents to approve</p>
            </div>
          ) : (
            <div className="space-y-4">
              {parents.map((parent) => (
                <div key={parent._id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {parent.fullName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {parent.email}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Applied on {formatDate(parent.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Pending</Badge>
                      <Modal
                        open={selectedParent && selectedParent._id === parent._id}
                        onClose={() => setSelectedParent(null)}
                        title="Parent Details"
                      >
                        <div className="space-y-6">
                          {/* Basic Info */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Name:</span>
                              <span>{selectedParent.fullName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Email:</span>
                              <span>{selectedParent.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Phone:</span>
                              <span>{selectedParent.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Address:</span>
                              <span>{selectedParent.address?.street}, {selectedParent.address?.city}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Applied:</span>
                              <span>{formatDate(selectedParent.createdAt)}</span>
                            </div>
                          </div>

                          {/* Children */}
                          <div>
                            <h4 className="font-semibold mb-3">Children ({selectedParent.parentProfile?.children?.length || 0})</h4>
                            <div className="space-y-2">
                              {selectedParent.parentProfile?.children?.map((child, index) => (
                                <div key={index} className="border rounded p-3 bg-gray-50 dark:bg-gray-800">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><strong>Name:</strong> {child.name}</div>
                                    <div><strong>Registration:</strong> {child.registrationNumber}</div>
                                    <div><strong>Class:</strong> {child.classId?.name || 'N/A'}</div>
                                    <div><strong>Section:</strong> {child.section}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action */}
                          <div className="flex justify-end space-x-2">
                            <Button
                              onClick={() => handleApprove(selectedParent._id)}
                              disabled={approving === selectedParent._id}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {approving === selectedParent._id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Approve Parent
                            </Button>
                          </div>
                        </div>
                      </Modal>
                      <Button variant="outline" size="sm" onClick={() => setSelectedParent(parent)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handleApprove(parent._id)}
                        disabled={approving === parent._id}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approving === parent._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
