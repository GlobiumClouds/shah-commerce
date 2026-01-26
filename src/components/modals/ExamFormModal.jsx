'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { textarea } from '@/components/ui/textarea';
import Dropdown from '@/components/ui/dropdown';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Plus,
  Trash2,
  Clock,
  Calendar,
  BookOpen,
  Users,
  Building2
} from 'lucide-react';

export default function ExamFormModal({ exam, branches, classes, subjects, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    examType: '',
    branchId: '',
    classId: '',
    section: '',
    status: 'scheduled',
    subjects: []
  });
  const [errors, setErrors] = useState({});
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  useEffect(() => {
    if (exam) {
      setFormData({
        title: exam.title || '',
        examType: exam.examType || '',
        branchId: exam.branchId?._id || exam.branchId || '',
        classId: exam.classId?._id || exam.classId || '',
        section: exam.section || '',
        status: exam.status || 'scheduled',
        subjects: exam.subjects || []
      });
    }
  }, [exam]);

  useEffect(() => {
    // Filter classes based on selected branch
    if (formData.branchId) {
      const branchClasses = classes.filter(cls => cls.branchId === formData.branchId);
      setFilteredClasses(branchClasses);
    } else {
      setFilteredClasses(classes);
    }
  }, [formData.branchId, classes]);

  useEffect(() => {
    // Filter subjects based on selected class
    if (formData.classId) {
      // In a real implementation, you'd filter subjects by class
      // For now, we'll show all subjects
      setFilteredSubjects(subjects);
    } else {
      setFilteredSubjects(subjects);
    }
  }, [formData.classId, subjects]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addSubject = () => {
    setFormData(prev => ({
      ...prev,
      subjects: [...prev.subjects, {
        subjectId: '',
        date: '',
        startTime: '',
        endTime: '',
        duration: 60,
        totalMarks: 100,
        passingMarks: 40,
        room: '',
        instructions: '',
        syllabus: ''
      }]
    }));
  };

  const removeSubject = (index) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  const updateSubject = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map((subject, i) =>
        i === index ? { ...subject, [field]: value } : subject
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Exam title is required';
    }

    if (!formData.examType) {
      newErrors.examType = 'Exam type is required';
    }

    if (!formData.classId) {
      newErrors.classId = 'Class is required';
    }

    if (!formData.subjects.length) {
      newErrors.subjects = 'At least one subject is required';
    } else {
      formData.subjects.forEach((subject, index) => {
        if (!subject.subjectId) {
          newErrors[`subject_${index}_subjectId`] = 'Subject is required';
        }
        if (!subject.date) {
          newErrors[`subject_${index}_date`] = 'Date is required';
        }
        if (!subject.startTime) {
          newErrors[`subject_${index}_startTime`] = 'Start time is required';
        }
        if (!subject.endTime) {
          newErrors[`subject_${index}_endTime`] = 'End time is required';
        }
        if (!subject.duration || subject.duration <= 0) {
          newErrors[`subject_${index}_duration`] = 'Valid duration is required';
        }
        if (!subject.totalMarks || subject.totalMarks <= 0) {
          newErrors[`subject_${index}_totalMarks`] = 'Valid total marks is required';
        }
        if (!subject.passingMarks || subject.passingMarks < 0) {
          newErrors[`subject_${index}_passingMarks`] = 'Valid passing marks is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">
              {exam ? 'Edit Exam' : 'Create New Exam'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Exam Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter exam title"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>

                <div>
                  <Label htmlFor="examType">Exam Type *</Label>
                  <Dropdown
                    value={formData.examType}
                    onChange={(e) => handleInputChange('examType', e.target.value)}
                    options={[
                      { value: '', label: 'Select exam type' },
                      { value: 'midterm', label: 'Midterm' },
                      { value: 'final', label: 'Final' },
                      { value: 'quiz', label: 'Quiz' },
                      { value: 'unit_test', label: 'Unit Test' },
                      { value: 'mock', label: 'Mock' },
                      { value: 'surprise', label: 'Surprise' },
                      { value: 'practical', label: 'Practical' },
                      { value: 'oral', label: 'Oral' }
                    ]}
                    placeholder="Select exam type"
                    className={errors.examType ? 'border-red-500' : ''}
                  />
                  {errors.examType && <p className="text-red-500 text-sm mt-1">{errors.examType}</p>}
                </div>

                <div>
                  <Label htmlFor="branchId">Branch (Optional)</Label>
            <Dropdown
              value={formData.branchId}
              onChange={(e) => handleInputChange('branchId', e.target.value)}
              options={[
                { value: '', label: 'Select branch' },
                ...(Array.isArray(branches) ? branches.map(branch => ({
                  value: branch._id,
                  label: branch.name
                })) : [])
              ]}
              placeholder="Select branch"
              className={errors.branchId ? 'border-red-500' : ''}
            />
                  {errors.branchId && <p className="text-red-500 text-sm mt-1">{errors.branchId}</p>}
                </div>

                <div>
                  <Label htmlFor="classId">Class *</Label>
                  <Dropdown
                    value={formData.classId}
                    onChange={(e) => handleInputChange('classId', e.target.value)}
                    options={[
                      { value: '', label: 'Select class' },
                      ...filteredClasses.map(cls => ({
                        value: cls._id,
                        label: `${cls.name} ${cls.section ? `(${cls.section})` : ''}`
                      }))
                    ]}
                    placeholder="Select class"
                    className={errors.classId ? 'border-red-500' : ''}
                  />
                  {errors.classId && <p className="text-red-500 text-sm mt-1">{errors.classId}</p>}
                </div>

                <div>
                  <Label htmlFor="section">Section (Optional)</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    placeholder="e.g., A, B, C"
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Dropdown
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    options={[
                      { value: 'scheduled', label: 'Scheduled' },
                      { value: 'ongoing', label: 'Ongoing' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' },
                      { value: 'postponed', label: 'Postponed' }
                    ]}
                    placeholder="Select status"
                  />
                </div>
              </div>

              {/* Subjects Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-semibold">Exam Subjects *</Label>
                  <Button
                    type="button"
                    onClick={addSubject}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                </div>

                {errors.subjects && <p className="text-red-500 text-sm mb-2">{errors.subjects}</p>}

                <div className="space-y-4">
                  {formData.subjects.map((subject, index) => (
                    <Card key={index} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            Subject {index + 1}
                          </h4>
                          <Button
                            type="button"
                            onClick={() => removeSubject(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <Label>Subject *</Label>
                            <Dropdown
                              value={subject.subjectId}
                              onChange={(e) => updateSubject(index, 'subjectId', e.target.value)}
                              options={[
                                { value: '', label: 'Select subject' },
                                ...filteredSubjects.map(sub => ({
                                  value: sub._id,
                                  label: sub.name
                                }))
                              ]}
                              placeholder="Select subject"
                              className={errors[`subject_${index}_subjectId`] ? 'border-red-500' : ''}
                            />
                            {errors[`subject_${index}_subjectId`] && (
                              <p className="text-red-500 text-sm mt-1">{errors[`subject_${index}_subjectId`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>Date *</Label>
                            <Input
                              type="date"
                              value={subject.date}
                              onChange={(e) => updateSubject(index, 'date', e.target.value)}
                              className={errors[`subject_${index}_date`] ? 'border-red-500' : ''}
                            />
                            {errors[`subject_${index}_date`] && (
                              <p className="text-red-500 text-sm mt-1">{errors[`subject_${index}_date`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>Start Time *</Label>
                            <Input
                              type="time"
                              value={subject.startTime}
                              onChange={(e) => updateSubject(index, 'startTime', e.target.value)}
                              className={errors[`subject_${index}_startTime`] ? 'border-red-500' : ''}
                            />
                            {errors[`subject_${index}_startTime`] && (
                              <p className="text-red-500 text-sm mt-1">{errors[`subject_${index}_startTime`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>End Time *</Label>
                            <Input
                              type="time"
                              value={subject.endTime}
                              onChange={(e) => updateSubject(index, 'endTime', e.target.value)}
                              className={errors[`subject_${index}_endTime`] ? 'border-red-500' : ''}
                            />
                            {errors[`subject_${index}_endTime`] && (
                              <p className="text-red-500 text-sm mt-1">{errors[`subject_${index}_endTime`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>Duration (minutes) *</Label>
                            <Input
                              type="number"
                              value={subject.duration}
                              onChange={(e) => updateSubject(index, 'duration', parseInt(e.target.value) || 0)}
                              min="1"
                              className={errors[`subject_${index}_duration`] ? 'border-red-500' : ''}
                            />
                            {errors[`subject_${index}_duration`] && (
                              <p className="text-red-500 text-sm mt-1">{errors[`subject_${index}_duration`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>Total Marks *</Label>
                            <Input
                              type="number"
                              value={subject.totalMarks}
                              onChange={(e) => updateSubject(index, 'totalMarks', parseInt(e.target.value) || 0)}
                              min="1"
                              className={errors[`subject_${index}_totalMarks`] ? 'border-red-500' : ''}
                            />
                            {errors[`subject_${index}_totalMarks`] && (
                              <p className="text-red-500 text-sm mt-1">{errors[`subject_${index}_totalMarks`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>Passing Marks *</Label>
                            <Input
                              type="number"
                              value={subject.passingMarks}
                              onChange={(e) => updateSubject(index, 'passingMarks', parseInt(e.target.value) || 0)}
                              min="0"
                              className={errors[`subject_${index}_passingMarks`] ? 'border-red-500' : ''}
                            />
                            {errors[`subject_${index}_passingMarks`] && (
                              <p className="text-red-500 text-sm mt-1">{errors[`subject_${index}_passingMarks`]}</p>
                            )}
                          </div>

                          <div>
                            <Label>Room (Optional)</Label>
                            <Input
                              value={subject.room}
                              onChange={(e) => updateSubject(index, 'room', e.target.value)}
                              placeholder="Room number"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Instructions (Optional)</Label>
                            <textarea
                              value={subject.instructions}
                              onChange={(e) => updateSubject(index, 'instructions', e.target.value)}
                              placeholder="Exam instructions..."
                              rows={2}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Syllabus (Optional)</Label>
                            <textarea
                              value={subject.syllabus}
                              onChange={(e) => updateSubject(index, 'syllabus', e.target.value)}
                              placeholder="Syllabus coverage..."
                              rows={2}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {formData.subjects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No subjects added yet. Click "Add Subject" to get started.</p>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {exam ? 'Update Exam' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
