import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { X, BookOpen, AlertCircle } from 'lucide-react';

const SubjectSelectionModal = ({
  isOpen,
  onClose,
  studentId,
  sessionId,
  facultyId,
  onSubjectsSelected
}) => {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [facultyLimits, setFacultyLimits] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { apiCall } = useApi();

  const fetchAvailableSubjects = async () => {
    if (!studentId || !sessionId || !facultyId) return;

    setLoading(true);
    try {
      const response = await apiCall(`/branch-admin/students/${studentId}/subjects`);
      if (response.success) {
        setAvailableSubjects(response.data.availableSubjects || []);
        setSelectedSubjects(response.data.selectedSubjects || []);
        setFacultyLimits(response.data.limits || {});
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSubjects();
    }
  }, [isOpen, studentId, sessionId, facultyId]);

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => {
      const isSelected = prev.some(s => s.subjectId === subjectId);
      if (isSelected) {
        return prev.filter(s => s.subjectId !== subjectId);
      } else {
        const subject = availableSubjects.find(s => s._id === subjectId);
        if (subject) {
          return [...prev, {
            subjectId: subject._id,
            subjectName: subject.name,
            creditHours: subject.creditHours || 3
          }];
        }
        return prev;
      }
    });
  };

  const getTotalCredits = () => {
    return selectedSubjects.reduce((sum, subject) => sum + (subject.creditHours || 3), 0);
  };

  const isWithinLimits = () => {
    const totalCredits = getTotalCredits();
    const maxCredits = facultyLimits.maxCredits || 20;
    const minCredits = facultyLimits.minCredits || 15;

    return totalCredits >= minCredits && totalCredits <= maxCredits;
  };

  const handleSave = async () => {
    if (!isWithinLimits()) {
      alert(`Please select subjects within the credit limit (${facultyLimits.minCredits || 15}-${facultyLimits.maxCredits || 20} credits)`);
      return;
    }

    setSaving(true);
    try {
      const response = await apiCall(`/branch-admin/students/${studentId}/subjects`, 'POST', {
        subjectIds: selectedSubjects.map(s => s.subjectId)
      });

      if (response.success) {
        onSubjectsSelected(selectedSubjects);
        onClose();
      }
    } catch (error) {
      console.error('Error saving subjects:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const totalCredits = getTotalCredits();
  const maxCredits = facultyLimits.maxCredits || 20;
  const minCredits = facultyLimits.minCredits || 15;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Select Subjects</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">Loading subjects...</div>
          ) : (
            <>
              {/* Credit Summary */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Credit Summary</h3>
                      <p className="text-sm text-gray-600">
                        Selected: {selectedSubjects.length} subjects, {totalCredits} credits
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={isWithinLimits() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {isWithinLimits() ? 'Within Limits' : 'Outside Limits'}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Required: {minCredits}-{maxCredits} credits
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subject List */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Available Subjects
                </h3>

                {availableSubjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No subjects available for the selected faculty.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableSubjects.map((subject) => {
                      const isSelected = selectedSubjects.some(s => s.subjectId === subject._id);

                      return (
                        <Card
                          key={subject._id}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSubjectToggle(subject._id)}
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleSubjectToggle(subject._id)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{subject.name}</h4>
                                <p className="text-sm text-gray-600">{subject.code}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {subject.creditHours || 3} credits
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {subject.subjectType || 'core'}
                                  </Badge>
                                </div>
                                {subject.description && (
                                  <p className="text-sm text-gray-600 mt-2">{subject.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Warning for credit limits */}
              {!isWithinLimits() && (
                <Card className="mt-6 border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Credit Limit Warning</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      You have selected {totalCredits} credits. Please adjust your selection to be between {minCredits} and {maxCredits} credits.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !isWithinLimits()}
          >
            {saving ? 'Saving...' : 'Save Selection'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelectionModal;
