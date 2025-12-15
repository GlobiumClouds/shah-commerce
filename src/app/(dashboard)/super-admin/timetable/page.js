'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Modal from '@/components/ui/modal';
import Dropdown from '@/components/ui/dropdown';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users,
  BookOpen,
  Coffee,
  School,
  Search,
  Filter,
} from 'lucide-react';
import BranchSelect from '@/components/ui/branch-select';
import ClassSelect from '@/components/ui/class-select';
import apiClient from '@/lib/api-client';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PERIOD_TYPES = [
  { value: 'lecture', label: 'Lecture', icon: BookOpen },
  { value: 'lab', label: 'Lab', icon: School },
  { value: 'practical', label: 'Practical', icon: Users },
  { value: 'break', label: 'Break', icon: Coffee },
  { value: 'lunch', label: 'Lunch', icon: Coffee },
  { value: 'assembly', label: 'Assembly', icon: Users },
  { value: 'sports', label: 'Sports', icon: Users },
  { value: 'library', label: 'Library', icon: BookOpen },
];

export default function TimetablePage() {
  const { execute: request, loading } = useApi();

  const [timetables, setTimetables] = useState([]);
  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingTimetable, setEditingTimetable] = useState(null);
  const [viewingTimetable, setViewingTimetable] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    academicYear: '2024-2025',
    branchId: '',
    classId: '',
    section: '',
    effectiveFrom: '',
    effectiveTo: '',
    status: 'draft',
    periods: [],
    timeSettings: {
      periodDuration: 40,
      breakDuration: 10,
      lunchDuration: 30,
      schoolStartTime: '08:00',
      schoolEndTime: '14:00',
    },
  });

  useEffect(() => {
    fetchBranches();
    fetchTimetables();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      fetchClasses(selectedBranch);
    }
  }, [selectedBranch]);

  useEffect(() => {
    if (selectedClass) {
      fetchSections(selectedClass);
      fetchSubjects(selectedClass);
      fetchTeachers();
    }
  }, [selectedClass]);

  useEffect(() => {
    if (formData.classId && classes.length > 0) {
      fetchSections(formData.classId);
    }
  }, [formData.classId, classes]);

  const fetchBranches = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUPER_ADMIN.BRANCHES.LIST);
      if (response.success) {
        setBranches(response.data.branches || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      toast.error('Failed to load branches');
    }
  };

  const fetchClasses = async (branchId) => {
    if (!branchId || typeof branchId !== 'string') return;
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.SUPER_ADMIN.CLASSES.LIST}?branchId=${encodeURIComponent(branchId)}`
      );
      if (response.success) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    }
  };

  const fetchSections = async (classId) => {
    if (!classId || typeof classId !== 'string') return;
    try {
      const selectedClass = classes.find(c => c._id === classId);
      if (selectedClass && selectedClass.sections) {
        setSections(selectedClass.sections);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      setSections([]);
    }
  };

  const fetchSubjects = async (classId) => {
    if (!classId || typeof classId !== 'string') return;
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.SUPER_ADMIN.SUBJECTS.LIST}?classId=${encodeURIComponent(classId)}`
      );
      if (response.success) {
        setSubjects(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.SUPER_ADMIN.TEACHERS.LIST}`
      );
      if (response.success) {
        setTeachers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      toast.error('Failed to load teachers');
    }
  };

  const fetchTimetables = async () => {
    try {
      let url = API_ENDPOINTS.SUPER_ADMIN.TIMETABLES.LIST;
      const params = [];
      
      if (selectedBranch) params.push(`branchId=${selectedBranch}`);
      if (selectedClass) params.push(`classId=${selectedClass}`);
      if (selectedAcademicYear) params.push(`academicYear=${selectedAcademicYear}`);
      
      if (params.length > 0) {
        url += '?' + params.join('&');
      }

      const response = await apiClient.get(url);
      if (response.success) {
        setTimetables(response.data);
      }
    } catch (error) {
      toast.error('Failed to fetch timetables');
    }
  };

  const handleCreateNew = async () => {
    setEditingTimetable(null);
    setFormData({
      name: '',
      academicYear: selectedAcademicYear || '2024-2025',
      branchId: selectedBranch || '',
      classId: selectedClass || '',
      section: '',
      effectiveFrom: '',
      effectiveTo: '',
      status: 'draft',
      periods: [],
      timeSettings: {
        periodDuration: 40,
        breakDuration: 10,
        lunchDuration: 30,
        schoolStartTime: '08:00',
        schoolEndTime: '14:00',
      },
    });
    setShowDialog(true);
    // Fetch branches if not already loaded
    if (branches.length === 0) {
      await fetchBranches();
    }
    // If selectedBranch exists, fetch its classes
    if (selectedBranch) {
      await fetchClasses(selectedBranch);
    }
  };

  const handleEdit = async (timetable) => {
    setEditingTimetable(timetable);
    const branchId = timetable.branchId?._id || timetable.branchId;
    const classId = timetable.classId?._id || timetable.classId;
    
    setFormData({
      name: timetable.name,
      academicYear: timetable.academicYear,
      branchId: branchId,
      classId: classId,
      section: timetable.section || '',
      effectiveFrom: timetable.effectiveFrom?.split('T')[0] || '',
      effectiveTo: timetable.effectiveTo?.split('T')[0] || '',
      status: timetable.status,
      periods: timetable.periods || [],
      timeSettings: timetable.timeSettings || {
        periodDuration: 40,
        breakDuration: 10,
        lunchDuration: 30,
        schoolStartTime: '08:00',
        schoolEndTime: '14:00',
      },
    });
    setShowDialog(true);
    
    // Fetch required data for modal
    if (branches.length === 0) {
      await fetchBranches();
    }
    if (branchId) {
      await fetchClasses(branchId);
    }
    if (classId) {
      await fetchSubjects(classId);
      await fetchTeachers();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingTimetable) {
        response = await apiClient.put(
          API_ENDPOINTS.SUPER_ADMIN.TIMETABLES.UPDATE(editingTimetable._id),
          formData
        );
      } else {
        response = await apiClient.post(
          API_ENDPOINTS.SUPER_ADMIN.TIMETABLES.CREATE,
          formData
        );
      }

      if (response.success) {
        toast.success(response.message || 'Timetable saved successfully');
        setShowDialog(false);
        fetchTimetables();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save timetable');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this timetable?')) return;

    try {
      const response = await apiClient.delete(
        API_ENDPOINTS.SUPER_ADMIN.TIMETABLES.DELETE(id)
      );

      if (response.success) {
        toast.success('Timetable deleted successfully');
        fetchTimetables();
      }
    } catch (error) {
      toast.error('Failed to delete timetable');
    }
  };

  // Helper to check if a period already exists with time overlap
  const isDuplicatePeriod = (period, currentIndex = -1) => {
    return formData.periods.some(
      (p, index) => {
        if (index === currentIndex) return false; // Skip checking against itself
        
        // Check for same day, section, and time overlap
        if (
          p.day === period.day &&
          formData.section === period.section
        ) {
          // Check for exact same period details
          if (
            p.subjectId === period.subjectId &&
            p.periodNumber === period.periodNumber &&
            p.startTime === period.startTime &&
            p.endTime === period.endTime
          ) {
            return true; // Exact duplicate
          }
          
          // Check for time overlap
          const pStart = p.startTime;
          const pEnd = p.endTime;
          const periodStart = period.startTime;
          const periodEnd = period.endTime;
          
          if (
            (periodStart >= pStart && periodStart < pEnd) ||
            (periodEnd > pStart && periodEnd <= pEnd) ||
            (periodStart <= pStart && periodEnd >= pEnd)
          ) {
            return true; // Time overlap
          }
        }
        
        return false;
      }
    );
  };

  const addPeriod = () => {
    if (!formData.section) {
      toast.error('Please select a section first!');
      return;
    }
    
    const newPeriod = {
      periodNumber: formData.periods.length + 1,
      day: 'Monday',
      startTime: '08:00',
      endTime: '08:40',
      subjectId: '',
      teacherId: '',
      periodType: 'lecture',
      roomNumber: '',
      notes: '',
      section: formData.section,
    };
    
    if (isDuplicatePeriod(newPeriod)) {
      toast.error('This time slot is already occupied on this day for this section!');
      return;
    }
    setFormData({ ...formData, periods: [...formData.periods, newPeriod] });
  };

  const updatePeriod = (index, field, value) => {
    const updatedPeriods = [...formData.periods];
    updatedPeriods[index] = {
      ...updatedPeriods[index],
      [field]: value,
    };
    
    // Check for duplicates when updating time or day related fields
    if (['day', 'startTime', 'endTime', 'subjectId', 'periodNumber'].includes(field)) {
      if (isDuplicatePeriod(updatedPeriods[index], index)) {
        toast.error('This time slot is already occupied on this day for this section!');
        return;
      }
    }
    
    setFormData({ ...formData, periods: updatedPeriods });
  };

  const removePeriod = (index) => {
    const updatedPeriods = formData.periods.filter((_, i) => i !== index);
    setFormData({ ...formData, periods: updatedPeriods });
  };

  const viewTimetable = (timetable) => {
    setViewingTimetable(timetable);
  };

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      inactive: 'destructive',
      archived: 'outline',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Timetable Management</h1>
          <p className="text-muted-foreground">
            Manage class timetables and periods
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Timetable
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Branch</Label>
              <BranchSelect
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                placeholder="Select branch"
                className="w-full"
                branches={branches}
              />
            </div>

            <div className="space-y-2">
              <Label>Class</Label>
              <ClassSelect
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                placeholder="Select class"
                className="w-full"
                classes={classes}
              />
            </div>

            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Dropdown
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                options={[
                  { value: '2023-2024', label: '2023-2024' },
                  { value: '2024-2025', label: '2024-2025' },
                  { value: '2025-2026', label: '2025-2026' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={fetchTimetables} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timetables List */}
      <Card>
        <CardHeader>
          <CardTitle>Timetables</CardTitle>
          <CardDescription>
            {timetables.length} timetable(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Name</th>
                  <th className="text-left p-3 font-semibold">Branch</th>
                  <th className="text-left p-3 font-semibold">Class</th>
                  <th className="text-left p-3 font-semibold">Section</th>
                  <th className="text-left p-3 font-semibold">Academic Year</th>
                  <th className="text-left p-3 font-semibold">Periods</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timetables.map((timetable) => (
                  <tr key={timetable._id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-3 font-medium">
                      {timetable.name}
                    </td>
                    <td className="p-3">
                      {timetable.branchId?.name || 'N/A'}
                    </td>
                    <td className="p-3">
                      {timetable.classId?.name || 'N/A'}
                    </td>
                    <td className="p-3">{timetable.section || 'All'}</td>
                    <td className="p-3">{timetable.academicYear}</td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {timetable.periods?.length || 0} periods
                      </Badge>
                    </td>
                    <td className="p-3">{getStatusBadge(timetable.status)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewTimetable(timetable)}
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(timetable)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(timetable._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        open={showDialog}
        onClose={() => setShowDialog(false)}
        title={editingTimetable ? 'Edit Timetable' : 'Create Timetable'}
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} form="timetable-form">
              {loading ? 'Saving...' : editingTimetable ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
          <form id="timetable-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Timetable Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Academic Year *</Label>
                <Dropdown
                  value={formData.academicYear}
                  onChange={(e) =>
                    setFormData({ ...formData, academicYear: e.target.value })
                  }
                  options={[
                    { value: '2023-2024', label: '2023-2024' },
                    { value: '2024-2025', label: '2024-2025' },
                    { value: '2025-2026', label: '2025-2026' },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label>Branch *</Label>
                <BranchSelect
                  value={formData.branchId}
                  onChange={(e) => {
                    const branchId = e.target.value;
                    setFormData({ ...formData, branchId: branchId, classId: '', section: '' });
                    setClasses([]);
                    setSections([]);
                    if (branchId) {
                      fetchClasses(branchId);
                    }
                  }}
                  branches={branches}
                  placeholder="Select branch"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Class *</Label>
                <ClassSelect
                  value={formData.classId}
                  onChange={(e) => {
                    const classId = e.target.value;
                    setFormData({ ...formData, classId: classId, section: '' });
                    setSections([]);
                    if (classId) {
                      fetchSections(classId);
                      fetchSubjects(classId);
                      fetchTeachers();
                    }
                  }}
                  classes={classes}
                  placeholder="Select class"
                  className="w-full"
                  disabled={!formData.branchId}
                />
              </div>

              <div className="space-y-2">
                <Label>Section *</Label>
                <Dropdown
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
                  }
                  options={sections.map(s => ({
                    value: s.name,
                    label: `${s.name} ${s.roomNumber ? `(Room: ${s.roomNumber})` : ''}`
                  }))}
                  placeholder="Select section"
                  disabled={!formData.classId || sections.length === 0}
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Dropdown
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </div>

              <div className="space-y-2">
                <Label>Effective From *</Label>
                <Input
                  type="date"
                  value={formData.effectiveFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveFrom: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Effective To</Label>
                <Input
                  type="date"
                  value={formData.effectiveTo}
                  onChange={(e) =>
                    setFormData({ ...formData, effectiveTo: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Time Settings */}
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Time Settings</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Period Duration (min)</Label>
                  <Input
                    type="number"
                    value={formData.timeSettings.periodDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeSettings: {
                          ...formData.timeSettings,
                          periodDuration: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Break Duration (min)</Label>
                  <Input
                    type="number"
                    value={formData.timeSettings.breakDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeSettings: {
                          ...formData.timeSettings,
                          breakDuration: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lunch Duration (min)</Label>
                  <Input
                    type="number"
                    value={formData.timeSettings.lunchDuration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeSettings: {
                          ...formData.timeSettings,
                          lunchDuration: parseInt(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>School Start Time</Label>
                  <Input
                    type="time"
                    value={formData.timeSettings.schoolStartTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeSettings: {
                          ...formData.timeSettings,
                          schoolStartTime: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>School End Time</Label>
                  <Input
                    type="time"
                    value={formData.timeSettings.schoolEndTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeSettings: {
                          ...formData.timeSettings,
                          schoolEndTime: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Periods */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Periods</Label>
                <Button type="button" onClick={addPeriod} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Period
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {formData.periods.map((period, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label>Day</Label>
                          <Dropdown
                            value={period.day}
                            onChange={(e) =>
                              updatePeriod(index, 'day', e.target.value)
                            }
                            options={DAYS.map((day) => ({
                              value: day,
                              label: day,
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Period Number</Label>
                          <Input
                            type="number"
                            value={period.periodNumber}
                            onChange={(e) =>
                              updatePeriod(
                                index,
                                'periodNumber',
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={period.startTime}
                            onChange={(e) =>
                              updatePeriod(index, 'startTime', e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={period.endTime}
                            onChange={(e) =>
                              updatePeriod(index, 'endTime', e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Period Type</Label>
                          <Dropdown
                            value={period.periodType}
                            onChange={(e) =>
                              updatePeriod(index, 'periodType', e.target.value)
                            }
                            options={PERIOD_TYPES.map((type) => ({
                              value: type.value,
                              label: type.label,
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Subject</Label>
                          <Dropdown
                            value={period.subjectId}
                            onChange={(e) =>
                              updatePeriod(index, 'subjectId', e.target.value)
                            }
                            options={[
                              { value: '', label: 'None' },
                              ...subjects.map((subject) => ({
                                value: subject._id,
                                label: subject.name,
                              })),
                            ]}
                            placeholder="Select subject"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Teacher</Label>
                          <Dropdown
                            value={period.teacherId}
                            onChange={(e) =>
                              updatePeriod(index, 'teacherId', e.target.value)
                            }
                            options={[
                              { value: '', label: 'None' },
                              ...teachers.map((teacher) => ({
                                value: teacher._id,
                                label: `${teacher.firstName} ${teacher.lastName}`,
                              })),
                            ]}
                            placeholder="Select teacher"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Room Number</Label>
                          <Input
                            value={period.roomNumber}
                            onChange={(e) =>
                              updatePeriod(index, 'roomNumber', e.target.value)
                            }
                            placeholder="e.g., 101, Lab A"
                          />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3 space-y-2">
                          <Label>Notes</Label>
                          <Input
                            value={period.notes}
                            onChange={(e) =>
                              updatePeriod(index, 'notes', e.target.value)
                            }
                            placeholder="Additional notes"
                          />
                        </div>

                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removePeriod(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </form>
      </Modal>

      {/* View Timetable Modal */}
      {viewingTimetable && (
        <Modal
          open={!!viewingTimetable}
          onClose={() => setViewingTimetable(null)}
          title={viewingTimetable.name}
          size="xl"
          footer={
            <div className="flex justify-end">
              <Button onClick={() => setViewingTimetable(null)}>
                Close
              </Button>
            </div>
          }
        >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {viewingTimetable.branchId?.name} - {viewingTimetable.classId?.name}
                {viewingTimetable.section && ` (Section ${viewingTimetable.section})`}
              </p>

              {/* Timetable Grid */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-muted">Period</th>
                      {DAYS.map((day) => (
                        <th key={day} className="border p-2 bg-muted">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(
                      new Set(viewingTimetable.periods.map((p) => p.periodNumber))
                    )
                      .sort((a, b) => a - b)
                      .map((periodNum) => (
                        <tr key={periodNum}>
                          <td className="border p-2 font-semibold text-center">
                            {periodNum}
                          </td>
                          {DAYS.map((day) => {
                            const period = viewingTimetable.periods.find(
                              (p) => p.day === day && p.periodNumber === periodNum
                            );
                            return (
                              <td
                                key={day}
                                className="border p-2 text-sm"
                              >
                                {period ? (
                                  <div className="space-y-1">
                                    <div className="font-medium">
                                      {period.subjectId?.name || period.periodType}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {period.teacherId?.firstName}{' '}
                                      {period.teacherId?.lastName}
                                    </div>
                                    <div className="text-xs">
                                      {period.startTime} - {period.endTime}
                                    </div>
                                    {period.roomNumber && (
                                      <div className="text-xs text-muted-foreground">
                                        Room: {period.roomNumber}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-center text-muted-foreground">
                                    -
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
        </Modal>
      )}
    </div>
  );
}
